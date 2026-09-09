import React, { useState, useRef, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { 
  FaPaperPlane, FaUser, FaUsers, FaTimes, FaSearch, FaBell,
  FaCheckCircle, FaUserPlus, FaUserCheck, FaUserTimes, FaPhone,
  FaVideo as FaVideoCall, FaEnvelope, FaSmile, FaPaperclip,
  FaCheck, FaTimes as FaTimesIcon, FaSpinner, FaBan, FaUndo,
  FaBars, FaHome, FaTrash, FaCheckDouble, FaComment, 
  FaArrowLeft as FaBack, FaPhone as FaPhoneIcon, FaMicrophone,
  FaMicrophoneSlash, FaPhoneSlash, FaUserEdit, FaClipboardList,
  FaArrowLeft, FaArrowRight, FaSignOutAlt, FaVolumeUp,
  FaChevronLeft, FaChevronRight, FaUsers as FaUsersIcon,
  FaImage, FaStickyNote, FaReply, FaVolumeMute, FaVolumeOff,
  FaStop, FaPlay, FaPause, FaMicrophone as FaMicrophoneIcon
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { 
  X, 
  Search, 
  RotateCcw, 
  UserPlus, 
  Home, 
  Bell, 
  UserCog,
  UserMinus,
  Check,
  ChevronDown,
  Loader2,
  Users,
  LogOut
} from 'lucide-react';

const SOCKET_URL = 'http://localhost:5000';

// Speech Synthesis for Voice Notifications
const speakNotification = (message, onEnd) => {
  if (!('speechSynthesis' in window)) return;
  
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  
  const voices = window.speechSynthesis.getVoices();
  const femaleVoice = voices.find(voice => voice.name.includes('Female') || voice.name.includes('Google UK Female'));
  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }
  
  if (onEnd) {
    utterance.onend = onEnd;
  }
  
  window.speechSynthesis.speak(utterance);
};

// Emoji/Sticker Data
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

// Sound notification using Web Audio API
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 1000;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.2);
    }, 150);
  } catch (error) {
    // Silent fail
  }
};

const playMessageSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 600;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch (error) {
    // Silent fail
  }
};

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Avatar Component with Black/70 Background
const AvatarWithFallback = ({ seed, name, size = 'h-10 w-10', textSize = 'text-sm', className = '' }) => {
  const displayName = name || seed || 'User';
  const initials = getInitials(displayName);
  
  return (
    <div className={`${size} rounded-full bg-black/70 flex items-center justify-center text-white font-bold ${textSize} shadow-lg ${className}`}>
      {initials}
    </div>
  );
};

// Voice Call Component
const VoiceCallModal = ({ 
  isOpen, 
  onClose, 
  callerName, 
  callerAvatar,
  onAccept,
  onReject,
  onEndCall,
  callStatus
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval;
    if (callStatus === 'active') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gradient-to-b from-stone-900 to-stone-950 rounded-3xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative inline-block mb-4">
          {callerAvatar ? (
            <img
              src={callerAvatar}
              alt={callerName}
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover ring-4 ring-amber-500/30 shadow-lg shadow-amber-500/20"
            />
          ) : (
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mx-auto shadow-lg shadow-amber-500/30">
              {callerName?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          {callStatus === 'active' && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute bottom-0 right-0 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-emerald-500 ring-2 ring-stone-950"
            />
          )}
          {callStatus === 'incoming' && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-amber-500 ring-2 ring-stone-950 animate-pulse"
            />
          )}
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{callerName || 'Unknown Caller'}</h3>
        <p className="text-xs sm:text-sm text-stone-400 mb-4 sm:mb-6">
          {callStatus === 'incoming' && 'Incoming call...'}
          {callStatus === 'outgoing' && 'Calling...'}
          {callStatus === 'active' && `Call in progress • ${formatDuration(callDuration)}`}
          {callStatus === 'ended' && 'Call ended'}
        </p>

        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
          {callStatus === 'incoming' && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onReject}
                className="p-3 sm:p-4 rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all"
              >
                <FaPhoneSlash className="text-lg sm:text-xl" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onAccept}
                className="p-3 sm:p-4 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
              >
                <FaPhoneIcon className="text-lg sm:text-xl" />
              </motion.button>
            </>
          )}

          {(callStatus === 'outgoing' || callStatus === 'active') && (
            <>
              {(callStatus === 'active') && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3 sm:p-4 rounded-full ${isMuted ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-stone-700 text-stone-300 shadow-lg shadow-stone-700/30'} hover:shadow-lg transition-all`}
                  >
                    {isMuted ? <FaMicrophoneSlash className="text-lg sm:text-xl" /> : <FaMicrophone className="text-lg sm:text-xl" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                    className={`p-3 sm:p-4 rounded-full ${isSpeakerOn ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-stone-700 text-stone-300 shadow-lg shadow-stone-700/30'} hover:shadow-lg transition-all`}
                  >
                    <FaVolumeUp className="text-lg sm:text-xl" />
                  </motion.button>
                </>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEndCall}
                className="p-3 sm:p-4 rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all"
              >
                <FaPhoneSlash className="text-lg sm:text-xl" />
              </motion.button>
            </>
          )}
        </div>

        {callStatus === 'ended' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-4 sm:mt-6 px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl bg-stone-700 text-white text-xs sm:text-sm hover:bg-stone-600 transition-all"
          >
            Close
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

// Reply Preview Component
const ReplyPreview = ({ replyTo, onCancelReply }) => {
  if (!replyTo) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center justify-between px-3 py-2 bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 rounded-lg mb-2"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
          Replying to {replyTo.sender === 'user' ? 'yourself' : replyTo.senderName || 'User'}
        </p>
        <p className="text-xs text-stone-600 dark:text-stone-400 truncate">
          {replyTo.text && replyTo.text.length > 50 ? replyTo.text.substring(0, 50) + '...' : replyTo.text}
        </p>
      </div>
      <button
        onClick={onCancelReply}
        className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
      >
        <X size={14} strokeWidth={2} className="text-stone-400" />
      </button>
    </motion.div>
  );
};

// Message Actions Popup
const MessageActions = ({ message, onClose, onDelete, onReply }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        exit={{ y: 20 }}
        className="bg-white dark:bg-stone-900 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center mx-auto mb-4">
            <FaComment className="text-amber-500 text-xl" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">
            Message Options
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
            What would you like to do with this message?
          </p>
          
          <div className="space-y-2">
            <button
              onClick={() => {
                onReply();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
            >
              <FaReply className="text-sm" />
              <span className="font-medium">Reply to this message</span>
            </button>
            
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
            >
              <FaTrash className="text-sm" />
              <span className="font-medium">Delete this message</span>
            </button>
            
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
  const [userToUnapprove, setUserToUnapprove] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [selectedStickerCategory, setSelectedStickerCategory] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showMessageActions, setShowMessageActions] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  
  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const hideTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const touchStartPosRef = useRef(null);
  
  // Voice Recording Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // Voice Call States
  const [socket, setSocket] = useState(null);
  const [peer, setPeer] = useState(null);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [callerInfo, setCallerInfo] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const streamRef = useRef(null);

  // Update user online status in Supabase
  const updateUserStatus = async (status) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('user_status')
        .upsert(
          { user_id: user.id, status: status, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );
      if (error) throw error;
    } catch (error) {
      // Silent fail
    }
  };

  // Set user online when component mounts
  useEffect(() => {
    if (user) {
      updateUserStatus('online');
    }
    
    return () => {
      if (user) {
        updateUserStatus('offline');
      }
    };
  }, [user]);

  // Load voices for speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Auto-show and auto-hide requests panel with animation
  useEffect(() => {
    if (chatRequests.length > 0) {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      
      setShowRequests(true);
      
      if (!isMuted) {
        const senderName = chatRequests[chatRequests.length - 1]?.sender_name || 'Someone';
        speakNotification(`You have received a new chat request from ${senderName}`);
      }
      
      hideTimerRef.current = setTimeout(() => {
        setShowRequests(false);
        hideTimerRef.current = null;
      }, 3000);
    }
    
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [chatRequests.length]);

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      window.speechSynthesis.cancel();
    }
    showNotification(isMuted ? 'Sound notifications enabled' : 'Sound notifications muted', 'info');
  };

  // Toggle requests panel with auto-hide
  const toggleRequestsPanel = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    
    const newState = !showRequests;
    setShowRequests(newState);
    
    if (newState && chatRequests.length > 0) {
      hideTimerRef.current = setTimeout(() => {
        setShowRequests(false);
        hideTimerRef.current = null;
      }, 3000);
    }
  };

  // Socket connection
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    let newSocket = null;

    if (socket) return;

    const connectSocket = () => {
      if (newSocket) return;

      newSocket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      newSocket.on('connect', () => {
        if (!isMounted) return;
        if (user) {
          newSocket.emit('register-user', user.id);
        }
      });

      newSocket.on('connect_error', (error) => {
        // Silent fail
      });

      newSocket.on('online-users', (onlineUsers) => {
        if (!isMounted) return;
        setAllUsers(prev => prev.map(u => ({
          ...u,
          online: onlineUsers.includes(u.id)
        })));
      });

      newSocket.on('user-online', (userId) => {
        if (!isMounted) return;
        setAllUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, online: true } : u
        ));
      });

      newSocket.on('user-offline', (userId) => {
        if (!isMounted) return;
        setAllUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, online: false } : u
        ));
      });

      newSocket.on('incoming-call', ({ from, signal, caller }) => {
        if (!isMounted) return;
        const callerUser = allUsers.find(u => u.id === from);
        if (callerUser) {
          setCallerInfo({
            id: from,
            name: getUserDisplayName(callerUser),
            avatar: getUserAvatar(callerUser)
          });
          setCallStatus('incoming');
          setCallModalOpen(true);
          window._incomingSignal = signal;
          window._callerId = from;
          playNotificationSound();
          if (!isMuted) {
            speakNotification(`Incoming call from ${getUserDisplayName(callerUser)}`);
          }
          showNotification(`Incoming call from ${getUserDisplayName(callerUser)}`, 'request');
        }
      });

      newSocket.on('call-accepted', ({ signal, from }) => {
        if (!isMounted) return;
        if (peer) {
          peer.signal(signal);
          setCallStatus('active');
          setIsInCall(true);
          playNotificationSound();
          if (!isMuted) {
            speakNotification('Call connected');
          }
          showNotification('Call connected!', 'success');
        }
      });

      newSocket.on('call-rejected', ({ from }) => {
        if (!isMounted) return;
        setCallStatus('ended');
        setIsInCall(false);
        if (peer) {
          peer.destroy();
          setPeer(null);
        }
        if (!isMuted) {
          speakNotification('Call rejected');
        }
        showNotification('Call rejected', 'info');
      });

      newSocket.on('call-ended', ({ from }) => {
        if (!isMounted) return;
        setCallStatus('ended');
        setIsInCall(false);
        if (peer) {
          peer.destroy();
          setPeer(null);
        }
        if (!isMuted) {
          speakNotification('Call ended');
        }
        showNotification('Call ended', 'info');
      });

      newSocket.on('user-offline', (userId) => {
        if (!isMounted) return;
        if (isInCall && selectedUser?.id === userId) {
          setCallStatus('ended');
          setIsInCall(false);
          if (peer) {
            peer.destroy();
            setPeer(null);
          }
          if (!isMuted) {
            speakNotification('User disconnected');
          }
          showNotification('User disconnected', 'info');
        }
      });

      setSocket(newSocket);
    };

    connectSocket();

    return () => {
      isMounted = false;
      if (newSocket) {
        if (user) {
          newSocket.emit('unregister-user', user.id);
        }
        newSocket.disconnect();
        setSocket(null);
      }
    };
  }, [user]);

  // Initialize peer connection
  const initPeer = (isInitiator, stream) => {
    const newPeer = new Peer({
      initiator: isInitiator,
      stream: stream,
      trickle: false,
    });

    newPeer.on('signal', (data) => {
      if (socket && selectedUser) {
        if (isInitiator) {
          socket.emit('call-user', {
            from: user.id,
            to: selectedUser.id,
            signalData: data
          });
        } else {
          socket.emit('accept-call', {
            to: window._callerId || selectedUser.id,
            signalData: data
          });
        }
      }
    });

    newPeer.on('stream', (remoteStream) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.play();
      }
    });

    newPeer.on('connect', () => {
      setCallStatus('active');
      setIsInCall(true);
    });

    newPeer.on('close', () => {
      setCallStatus('ended');
      setIsInCall(false);
    });

    newPeer.on('error', (err) => {
      setCallStatus('ended');
      setIsInCall(false);
    });

    return newPeer;
  };

  // Start a call
  const startCall = async (receiverId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      streamRef.current = stream;
      
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
        localAudioRef.current.play();
      }

      const newPeer = initPeer(true, stream);
      setPeer(newPeer);
      setCallStatus('outgoing');
      setCallModalOpen(true);
      
      const targetUser = allUsers.find(u => u.id === receiverId);
      if (targetUser) {
        setCallerInfo({
          id: targetUser.id,
          name: getUserDisplayName(targetUser),
          avatar: getUserAvatar(targetUser)
        });
      }

    } catch (error) {
      showNotification('Failed to start call. Please check your microphone permissions.', 'error');
    }
  };

  // Accept a call
  const acceptCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      streamRef.current = stream;
      
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
        localAudioRef.current.play();
      }

      const newPeer = initPeer(false, stream);
      setPeer(newPeer);
      
      if (window._incomingSignal) {
        newPeer.signal(window._incomingSignal);
      }
      
      setCallStatus('active');
      setIsInCall(true);
      playNotificationSound();

    } catch (error) {
      showNotification('Failed to accept call. Please check your microphone permissions.', 'error');
    }
  };

  // Reject a call
  const rejectCall = () => {
    if (socket && window._callerId) {
      socket.emit('reject-call', { to: window._callerId });
    }
    setCallStatus('ended');
    setCallModalOpen(false);
    setIsInCall(false);
    if (!isMuted) {
      speakNotification('Call rejected');
    }
    showNotification('Call rejected', 'info');
  };

  // End a call
  const endCall = () => {
    if (socket && selectedUser) {
      socket.emit('end-call', { to: selectedUser.id });
    }
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCallStatus('ended');
    setIsInCall(false);
    setCallModalOpen(false);
    if (!isMuted) {
      speakNotification('Call ended');
    }
    showNotification('Call ended', 'info');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peer) {
        peer.destroy();
        setPeer(null);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (!isMuted) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        sendVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 60) { // Max 60 seconds
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      showNotification('Failed to access microphone. Please check permissions.', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const sendVoiceMessage = async (audioBlob) => {
    if (!selectedUser) return;
    
    if (blockedUsers.includes(selectedUser.id)) {
      showNotification('You have blocked this user', 'info');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Audio = event.target?.result;
      
      if (!base64Audio) return;
      
      const tempId = Date.now();
      
      const newMessage = {
        id: tempId,
        sender: "user",
        text: base64Audio,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true,
        delivered: true,
        type: "voice",
        duration: recordingDuration,
        replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, sender: replyingTo.sender } : null
      };

      setMessages(prev => [...prev, newMessage]);
      playMessageSound();

      try {
        const { data, error } = await supabase
          .from('messages')
          .insert([
            {
              sender_id: user.id,
              receiver_id: selectedUser.id,
              content: base64Audio,
              created_at: new Date().toISOString(),
              read: false,
              message_type: 'voice',
              reply_to: replyingTo ? replyingTo.id : null,
              duration: recordingDuration
            }
          ])
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          setMessages(prev => prev.map(msg => 
            msg.id === tempId 
              ? { ...msg, id: data[0].id }
              : msg
          ));
        }
        
        setReplyingTo(null);

      } catch (error) {
        console.error('Error sending voice message:', error);
        showNotification('Failed to send voice message', 'error');
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
      }
    };
    reader.readAsDataURL(audioBlob);
  };

  const playVoiceMessage = (message) => {
    if (playingMessageId === message.id) {
      // Pause if playing
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        setIsPlaying(false);
        setPlayingMessageId(null);
      }
      return;
    }

    // Stop any currently playing audio
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }

    // Create new audio player
    const audio = new Audio(message.text);
    audioPlayerRef.current = audio;
    
    audio.onended = () => {
      setIsPlaying(false);
      setPlayingMessageId(null);
      audioPlayerRef.current = null;
    };

    audio.onplay = () => {
      setIsPlaying(true);
      setPlayingMessageId(message.id);
    };

    audio.onpause = () => {
      setIsPlaying(false);
      setPlayingMessageId(null);
    };

    audio.play().catch(err => {
      console.error('Error playing audio:', err);
      showNotification('Failed to play voice message', 'error');
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
    } catch (error) {
      // Silent fail
    } finally {
      setLoadingProfile(false);
    }
  };

  const getUserDisplayName = (user) => {
    return user?.full_name || user?.name || user?.email || 'User';
  };

  const getUserAvatar = (user) => {
    return user?.avatar_url || null;
  };

  // Load users and chat requests
  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadUsers();
      loadChatRequests();
      loadPendingRequests();
      loadApprovedChats();
      loadBlockedUsers();
    }
  }, [user]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const reqChannel = supabase
      .channel('chat_requests_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_requests',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          setChatRequests(prev => [...prev, payload.new]);
          playNotificationSound();
          if (!isMuted) {
            speakNotification(`New chat request from ${payload.new.sender_name || 'a user'}`);
          }
          showNotification(`New chat request from ${payload.new.sender_name || 'a user'}`, 'request');
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_requests'
        },
        () => {
          loadChatRequests();
          loadPendingRequests();
          loadApprovedChats();
        }
      )
      .subscribe();

    setChannel(reqChannel);

    const msgChannel = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          if (selectedUser && selectedUser.id === payload.new.sender_id) {
            const newMsg = {
              id: payload.new.id,
              sender: 'other',
              text: payload.new.content,
              timestamp: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: false,
              delivered: true,
              type: payload.new.message_type || 'text',
              duration: payload.new.duration || 0
            };
            setMessages(prev => [...prev, newMsg]);
            playNotificationSound();
          } else {
            playNotificationSound();
            if (!isMuted) {
              speakNotification(`New message from ${payload.new.sender_name || 'a user'}`);
            }
            showNotification(`New message from ${payload.new.sender_name || 'a user'}`, 'message');
            loadUsers();
          }
        }
      )
      .subscribe();

    setMessagesChannel(msgChannel);

    return () => {
      if (reqChannel) reqChannel.unsubscribe();
      if (msgChannel) msgChannel.unsubscribe();
      if (!isMuted) {
        window.speechSynthesis.cancel();
      }
    };
  }, [user, selectedUser, isMuted]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load blocked users
  const loadBlockedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocked_user_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setBlockedUsers(data?.map(b => b.blocked_user_id) || []);
    } catch (error) {
      // Silent fail
    }
  };

  // Block a user
  const blockUser = async (userId) => {

    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert([{ user_id: user.id, blocked_user_id: userId }]);

      if (error) throw error;

      setBlockedUsers(prev => [...prev, userId]);
      showNotification('User blocked successfully', 'success');
      
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
        setMessages([]);
      }
      
      loadUsers();
      setIsMobileSidebarOpen(false);
    } catch (error) {
      alert('Failed to block user');
    }
  };

  // Unblock a user
  const unblockUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('user_id', user.id)
        .eq('blocked_user_id', userId);

      if (error) throw error;

      setBlockedUsers(prev => prev.filter(id => id !== userId));
      showNotification('User unblocked successfully', 'success');
      loadUsers();
    } catch (error) {
      alert('Failed to unblock user');
    }
  };

  // Unapprove/Remove Chat Partner
  const unapproveUser = async (userId) => {
    try {
      const { data: requests, error: findError } = await supabase
        .from('chat_requests')
        .select('*')
        .eq('status', 'accepted')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

      if (findError) throw findError;

      if (!requests || requests.length === 0) {
        showNotification('No approved chat found with this user', 'info');
        return;
      }

      const { error: updateError } = await supabase
        .from('chat_requests')
        .update({ status: 'pending' })
        .eq('id', requests[0].id);

      if (updateError) throw updateError;

      showNotification('Chat partner removed successfully 🔄', 'success');
      
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
        setMessages([]);
      }
      
      loadUsers();
      loadApprovedChats();
      setIsMobileSidebarOpen(false);
      setUserToUnapprove(null);
      setShowUnapproveConfirm(false);
      
    } catch (error) {
      alert('Failed to remove chat partner');
    }
  };

  // Delete a message
  const deleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;

    setDeletingMessage(messageId);
    
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        setDeletingMessage(null);
        return;
      }

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      showNotification('Message deleted successfully ✅', 'success');
      
      if (replyingTo && replyingTo.id === messageId) {
        setReplyingTo(null);
      }
    } catch (error) {
      alert('Failed to delete message. Please try again.');
    } finally {
      setDeletingMessage(null);
    }
  };

  // Clear all messages
  const clearChat = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),` +
          `and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`
        );

      if (error) {
        alert('Failed to clear chat: ' + error.message);
        return;
      }

      setMessages([]);
      showNotification('Chat cleared successfully ✅', 'success');
      setIsMobileSidebarOpen(false);
      
    } catch (error) {
      alert('Failed to clear chat');
    }
  };

  // Handle call click
  const handleCallClick = (type) => {
    if (!selectedUser || !selectedUser.isApproved) {
      showNotification('Please select an approved chat partner', 'info');
      return;
    }
    
    if (type === 'voice') {
      startCall(selectedUser.id);
    } else {
      showNotification('Video calls coming soon!', 'info');
    }
  };

  // Upload image
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image size should be less than 5MB', 'error');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      showNotification('Please upload an image file', 'error');
      return;
    }
    
    setUploadingImage(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target?.result;
        
        if (!base64Image) {
          setUploadingImage(false);
          return;
        }
        
        await sendMessageWithImage(base64Image);
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      showNotification('Failed to upload image', 'error');
      setUploadingImage(false);
    }
  };

  // Send message with image
  const sendMessageWithImage = async (imageData) => {
    if (!selectedUser) return;
    
    if (blockedUsers.includes(selectedUser.id)) {
      showNotification('You have blocked this user', 'info');
      return;
    }

    const tempId = Date.now();
    
    const newMessage = {
      id: tempId,
      sender: "user",
      text: imageData,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
      delivered: true,
      type: "image",
      replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, sender: replyingTo.sender } : null
    };

    setMessages(prev => [...prev, newMessage]);
    playMessageSound();

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            receiver_id: selectedUser.id,
            content: imageData,
            created_at: new Date().toISOString(),
            read: false,
            message_type: 'image',
            reply_to: replyingTo ? replyingTo.id : null
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, id: data[0].id }
            : msg
        ));
      }
      
      setReplyingTo(null);

    } catch (error) {
      console.error('Error sending image:', error);
      showNotification('Failed to send image', 'error');
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  // Send sticker/emoji
  const sendSticker = async (sticker) => {
    if (!selectedUser) return;
    
    if (blockedUsers.includes(selectedUser.id)) {
      showNotification('You have blocked this user', 'info');
      return;
    }

    const tempId = Date.now();
    
    const newMessage = {
      id: tempId,
      sender: "user",
      text: sticker,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
      delivered: true,
      type: "sticker",
      replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, sender: replyingTo.sender } : null
    };

    setMessages(prev => [...prev, newMessage]);
    setShowStickerPicker(false);
    playMessageSound();

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            receiver_id: selectedUser.id,
            content: sticker,
            created_at: new Date().toISOString(),
            read: false,
            message_type: 'sticker',
            reply_to: replyingTo ? replyingTo.id : null
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, id: data[0].id }
            : msg
        ));
      }
      
      setReplyingTo(null);

    } catch (error) {
      console.error('Error sending sticker:', error);
      showNotification('Failed to send sticker', 'error');
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .neq('id', user.id);

      if (usersError) throw usersError;

      const { data: userSettings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*');

      if (settingsError) throw settingsError;

      const { data: approvedChats, error: chatError } = await supabase
        .from('chat_requests')
        .select('*')
        .eq('status', 'accepted')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (chatError) throw chatError;

      const { data: statusData, error: statusError } = await supabase
        .from('user_status')
        .select('*');

      if (statusError) throw statusError;

      const usersWithStatus = (usersData || []).map(u => {
        const status = statusData?.find(s => s.user_id === u.id);
        const settings = userSettings?.find(s => s.user_id === u.id);
        const isApproved = approvedChats?.some(
          c => (c.sender_id === u.id || c.receiver_id === u.id)
        );
        const isBlocked = blockedUsers.includes(u.id);
        return {
          ...u,
          full_name: settings?.full_name || u.name,
          avatar_url: settings?.avatar_url || null,
          phone: settings?.phone || null,
          bio: settings?.bio || null,
          occupation: settings?.occupation || null,
          company: settings?.company || null,
          education: settings?.education || null,
          interests: settings?.interests || [],
          skills: settings?.skills || [],
          social_links: settings?.social_links || {},
          online: status?.status === 'online' || false,
          lastSeen: status?.updated_at || null,
          isApproved: isApproved || false,
          isBlocked: isBlocked || false
        };
      });

      setAllUsers(usersWithStatus);
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const loadApprovedChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_requests')
        .select('*')
        .eq('status', 'accepted')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (error) throw error;
      loadUsers();
    } catch (error) {
      // Silent fail
    }
  };

  const loadChatRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_requests')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      setChatRequests(data || []);
    } catch (error) {
      // Silent fail
    }
  };

  const loadPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_requests')
        .select('*')
        .eq('sender_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      setPendingRequests(data || []);
    } catch (error) {
      // Silent fail
    }
  };

  const sendChatRequest = async (receiverId, receiverName) => {
    try {
      if (blockedUsers.includes(receiverId)) {
        showNotification('You have blocked this user', 'info');
        return;
      }

      const existing = pendingRequests.find(r => r.receiver_id === receiverId);
      if (existing) {
        showNotification('Request already sent! Waiting for approval ⏳', 'info');
        return;
      }

      const senderName = userProfile?.full_name || user.name || user.email || 'User';

      const { error } = await supabase
        .from('chat_requests')
        .insert([
          {
            sender_id: user.id,
            sender_name: senderName,
            receiver_id: receiverId,
            receiver_name: receiverName || 'User',
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      
      playNotificationSound();
      if (!isMuted) {
        speakNotification(`Chat request sent to ${receiverName}`);
      }
      showNotification('Chat request sent successfully! 📨', 'success');
      loadPendingRequests();
      loadUsers();
    } catch (error) {
      alert('Failed to send chat request');
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('chat_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      playNotificationSound();
      if (!isMuted) {
        speakNotification('Request accepted! You can now chat.');
      }
      showNotification('Request accepted! You can now chat. 💬', 'success');
      loadChatRequests();
      loadUsers();
      
      const request = chatRequests.find(r => r.id === requestId);
      if (request) {
        const sender = allUsers.find(u => u.id === request.sender_id);
        if (sender) {
          setSelectedUser(sender);
          loadMessages(sender.id);
        }
      }
      
      setTimeout(() => setShowRequests(false), 500);
    } catch (error) {
      // Silent fail
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('chat_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      if (!isMuted) {
        speakNotification('Request rejected');
      }
      showNotification('Request rejected.', 'info');
      loadChatRequests();
      
      setTimeout(() => setShowRequests(false), 500);
    } catch (error) {
      // Silent fail
    }
  };

  const loadMessages = async (otherUserId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = (data || []).map(msg => ({
        id: msg.id,
        sender: msg.sender_id === user.id ? 'user' : 'other',
        text: msg.content,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: msg.read || false,
        delivered: true,
        type: msg.message_type || 'text',
        replyTo: msg.reply_to || null,
        duration: msg.duration || 0
      }));

      setMessages(formattedMessages);
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  // Send message with reply support
  const sendMessage = async () => {
    if (!inputText.trim() || !selectedUser) return;
    
    if (blockedUsers.includes(selectedUser.id)) {
      showNotification('You have blocked this user', 'info');
      return;
    }

    const userMessage = inputText.trim();
    const tempId = Date.now();
    
    const newMessage = {
      id: tempId,
      sender: "user",
      text: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
      delivered: true,
      type: "text",
      replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, sender: replyingTo.sender } : null
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText("");
    playMessageSound();

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            receiver_id: selectedUser.id,
            content: userMessage,
            created_at: new Date().toISOString(),
            read: false,
            message_type: 'text',
            reply_to: replyingTo ? replyingTo.id : null
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, id: data[0].id }
            : msg
        ));
      }
      
      setReplyingTo(null);

    } catch (error) {
      alert('Failed to send message');
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  // Handle long press for message actions
  const handleMessagePress = (message, e) => {
    if (message.sender !== 'user') return;
    
    e.preventDefault();
    setSelectedMessage(message);
    setShowMessageActions(true);
  };

  // Handle reply to message
  const handleReplyToMessage = (message) => {
    setReplyingTo({
      id: message.id,
      text: message.text,
      sender: message.sender
    });
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (text) => {
    return text;
  };

  const isUserApproved = (userId) => {
    return allUsers.find(u => u.id === userId)?.isApproved || false;
  };

  const isUserBlocked = (userId) => {
    return blockedUsers.includes(userId);
  };

  // Show loading
  if (authLoading || loadingProfile) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-white via-amber-50/20 to-white dark:from-stone-950 dark:via-amber-950/10 dark:to-stone-950">
        <div className="text-center">
          <FaSpinner className="text-4xl text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-500 dark:text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return (
<div className="h-[100dvh] w-screen overflow-hidden pt-20 flex flex-col bg-gradient-to-b from-white via-amber-50/20 to-white dark:from-stone-950 dark:via-amber-950/10 dark:to-stone-950 fixed inset-0">
      {/* Audio Elements */}
      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />

      {/* Voice Call Modal */}
      <VoiceCallModal
        isOpen={callModalOpen}
        onClose={() => {
          if (callStatus === 'active') {
            endCall();
          } else {
            setCallModalOpen(false);
            setCallStatus('idle');
          }
        }}
        callerName={callerInfo?.name || 'Unknown'}
        callerAvatar={callerInfo?.avatar}
        onAccept={acceptCall}
        onReject={rejectCall}
        onEndCall={endCall}
        callStatus={callStatus}
      />

      {/* Message Actions Popup */}
      {showMessageActions && selectedMessage && (
        <MessageActions
          message={selectedMessage}
          onClose={() => {
            setShowMessageActions(false);
            setSelectedMessage(null);
          }}
          onDelete={() => deleteMessage(selectedMessage.id)}
          onReply={() => handleReplyToMessage(selectedMessage)}
        />
      )}

      {/* Back Button */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/60 dark:border-stone-800/60 z-10 flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-stone-100/80 to-white dark:from-stone-800/80 dark:to-stone-700/80 hover:from-amber-50 hover:to-amber-50/50 dark:hover:from-amber-950/30 dark:hover:to-amber-950/20 transition-all duration-300 shadow-sm hover:shadow-md border border-stone-200/50 dark:border-stone-700/50"
        >
          <FaBack className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300" />
          <span className="text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-300 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors duration-300">
            Back
          </span>
        </motion.button>
        
        <div className="flex-1"></div>
        
        <div className="flex items-center gap-2">
          {/* Mute/Unmute Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMute}
            className={`p-1.5 rounded-full transition-all duration-300 ${
              isMuted 
                ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
                : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'
            }`}
            title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
          >
            {isMuted ? (
              <FaVolumeOff className="text-sm sm:text-base" />
            ) : (
              <FaVolumeUp className="text-sm sm:text-base" />
            )}
          </motion.button>
          
          <div className="h-2 w-2 rounded-full bg-emerald-400/70 animate-pulse shadow-lg shadow-emerald-400/30"></div>
          <span className="text-[10px] sm:text-xs font-medium text-stone-400 dark:text-stone-500 tracking-wide">
            Live Chat
          </span>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="h-full w-full max-w-7xl mx-auto overflow-hidden">
          
          {/* Notification Toast */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                className="fixed top-14 sm:top-20 right-2 sm:right-4 z-50 max-w-[calc(100%-16px)] sm:max-w-sm w-full"
              >
                <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-2xl backdrop-blur-lg border ${
                  notification.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700' :
                  notification.type === 'request' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700' :
                  'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700'
                }`}>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className={`p-1 sm:p-1.5 rounded-full flex-shrink-0 ${
                      notification.type === 'success' ? 'bg-green-100 dark:bg-green-800' :
                      notification.type === 'request' ? 'bg-amber-100 dark:bg-amber-800' :
                      'bg-blue-100 dark:bg-blue-800'
                    }`}>
                      {notification.type === 'success' ? <FaCheck className="text-green-600 dark:text-green-300 text-xs" /> :
                       notification.type === 'request' ? <FaUserPlus className="text-amber-600 dark:text-amber-300 text-xs" /> :
                       <FaComment className="text-blue-600 dark:text-blue-300 text-xs" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-stone-900 dark:text-white">
                        {notification.message}
                      </p>
                    </div>
                    <button
                      onClick={() => setNotification(null)}
                      className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors flex-shrink-0"
                    >
                      <FaTimesIcon className="text-stone-400 text-xs" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Grid */}
          <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-1 sm:gap-2 lg:gap-6 overflow-hidden">
            
            {/* Left Sidebar - Desktop */}
            <div className="hidden lg:block lg:col-span-1 space-y-3 h-full overflow-hidden">
              <div className="h-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-stone-200/80 dark:border-stone-800/80 overflow-hidden shadow-xl shadow-stone-200/20 dark:shadow-stone-900/20 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-stone-200/80 dark:border-stone-800/80 bg-gradient-to-r from-amber-50/20 to-white dark:from-stone-900/50 dark:to-stone-900/80 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative shrink-0">
                        <AvatarWithFallback
                          seed={user?.id || user?.email || 'user'}
                          name={userProfile?.full_name || user?.name || user?.email || 'User'}
                          size="h-10 w-10"
                          textSize="text-base font-semibold"
                          className="rounded-full ring-2 ring-amber-500/20 dark:ring-amber-400/20"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-stone-950 bg-emerald-500 shadow-lg shadow-emerald-500/30">
                          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-stone-900 dark:text-stone-50 text-sm leading-tight truncate">
                          {userProfile?.full_name || user?.email || 'User'}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <p className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                            {allUsers.filter(u => !u.isBlocked).length} contacts
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={toggleMute}
                        className={`p-1.5 rounded-full transition-all duration-300 ${
                          isMuted 
                            ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
                            : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'
                        }`}
                        title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
                      >
                        {isMuted ? (
                          <FaVolumeOff className="text-sm" />
                        ) : (
                          <FaVolumeUp className="text-sm" />
                        )}
                      </button>
                      <button 
                        onClick={toggleRequestsPanel}
                        className="relative p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-300 hover:scale-110"
                      >
                        <Bell size={17} strokeWidth={2} className="text-stone-500 dark:text-stone-400" />
                        {chatRequests.length > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-gradient-to-br from-amber-500 to-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30"
                          >
                            {chatRequests.length > 9 ? '9+' : chatRequests.length}
                          </motion.span>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="mt-3 relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={14} strokeWidth={2} className="text-stone-400 dark:text-stone-500 group-focus-within:text-amber-500 transition-colors duration-300" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border-0 bg-stone-100/80 dark:bg-stone-900/80 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:bg-white dark:focus:bg-stone-950 transition-all duration-300 shadow-inner"
                    />
                  </div>
                </div>

                {/* Chat Requests Panel - Animated */}
                <AnimatePresence>
                  {showRequests && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ 
                        duration: 0.3, 
                        ease: "easeOut",
                        type: "spring",
                        damping: 20,
                        stiffness: 300
                      }}
                      className="absolute top-12 right-4 z-50 w-72 bg-white/95 dark:bg-stone-950/95 backdrop-blur-xl rounded-xl border border-stone-200/80 dark:border-stone-800/80 p-3 shadow-2xl shadow-stone-200/30 dark:shadow-stone-900/30 max-h-[60vh] overflow-y-auto origin-top-right"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                          <Bell size={14} strokeWidth={2} className="text-amber-500" />
                          Requests
                          <span className="text-[9px] bg-gradient-to-br from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                            {chatRequests.length}
                          </span>
                        </h3>
                        <button
                          onClick={() => setShowRequests(false)}
                          className="p-0.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                        >
                          <X size={14} strokeWidth={2} className="text-stone-400" />
                        </button>
                      </div>
                      
                      {chatRequests.length === 0 ? (
                        <div className="text-center py-4">
                          <Check size={24} strokeWidth={1.5} className="text-emerald-300 dark:text-emerald-700 mx-auto mb-1" />
                          <p className="text-[10px] text-stone-400 dark:text-stone-500">No pending requests</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {chatRequests.map((request, index) => (
                            <motion.div
                              key={request.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05, duration: 0.2 }}
                              className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-amber-50/50 to-white dark:from-amber-950/20 dark:to-stone-900/50 border border-amber-200/50 dark:border-amber-800/30"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <AvatarWithFallback 
                                  seed={request.sender_id || request.sender_name} 
                                  name={request.sender_name || 'User'}
                                  size="h-7 w-7"
                                  textSize="text-[10px] font-medium"
                                  className="rounded-full ring-2 ring-amber-200/50 dark:ring-amber-800/50"
                                />
                                <div className="min-w-0">
                                  <p className="text-[11px] font-medium text-stone-900 dark:text-white truncate max-w-[100px]">
                                    {request.sender_name || 'User'}
                                  </p>
                                  <p className="text-[8px] text-stone-400 dark:text-stone-500 flex items-center gap-1">
                                    <span className="inline-block h-1 w-1 rounded-full bg-amber-400" />
                                    Wants to connect
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-0.5 flex-shrink-0">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => acceptRequest(request.id)}
                                  className="p-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                                >
                                  <Check size={10} strokeWidth={2.5} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => rejectRequest(request.id)}
                                  className="p-1 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-lg hover:shadow-red-500/30 transition-all"
                                >
                                  <X size={10} strokeWidth={2.5} />
                                </motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Contact List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-amber-200 dark:scrollbar-thumb-stone-700">
                  {loading ? (
                    <div className="text-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="inline-block"
                      >
                        <Loader2 size={28} strokeWidth={1.5} className="text-stone-300 dark:text-stone-700" />
                      </motion.div>
                      <p className="text-xs text-stone-400 mt-3 font-medium">Loading contacts...</p>
                    </div>
                  ) : allUsers.filter(u => !u.isBlocked).length === 0 ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-900 mb-3">
                        <Users size={24} strokeWidth={1.5} className="text-stone-300 dark:text-stone-700" />
                      </div>
                      <p className="text-sm font-medium text-stone-500 dark:text-stone-400">No contacts yet</p>
                      <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">Start connecting with others</p>
                    </div>
                  ) : (
                    allUsers.filter(u => !u.isBlocked).map((u, index) => {
                      const hasPendingRequest = pendingRequests.some(r => r.receiver_id === u.id);
                      const hasIncomingRequest = chatRequests.some(r => r.sender_id === u.id);
                      const displayName = getUserDisplayName(u);
                      const userAvatar = getUserAvatar(u);
                      const isSelected = selectedUser?.id === u.id;

                      return (
                        <motion.button
                          key={u.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02, duration: 0.2 }}
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (isUserApproved(u.id)) {
                              setSelectedUser(u);
                              loadMessages(u.id);
                            } else if (hasPendingRequest) {
                              showNotification('Request pending...', 'info');
                            } else if (hasIncomingRequest) {
                              showNotification('You have a request from this user', 'info');
                            } else {
                              showNotification('Send a request to chat with this user', 'info');
                            }
                          }}
                          className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-left ${
                            isSelected
                              ? 'bg-gradient-to-r from-amber-50/90 to-orange-50/90 dark:from-amber-950/40 dark:to-orange-950/40 border-2 border-amber-200/60 dark:border-amber-800/50 shadow-lg shadow-amber-500/10'
                              : 'hover:bg-stone-50/80 dark:hover:bg-stone-900/60 border-2 border-transparent hover:border-stone-200/50 dark:hover:border-stone-800/50'
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="activeIndicatorDesktop"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30"
                            />
                          )}
                          
                          <div className="relative shrink-0">
                            {userAvatar ? (
                              <img
                                src={userAvatar}
                                alt={displayName}
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-stone-200/60 dark:ring-stone-800/60 shadow-sm"
                              />
                            ) : (
                              <AvatarWithFallback
                                seed={u.id || displayName}
                                name={displayName}
                                size="h-10 w-10"
                                textSize="text-xs font-medium"
                                className="rounded-full ring-2 ring-stone-200/60 dark:ring-stone-800/60 shadow-sm"
                              />
                            )}
                            <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-stone-950 transition-all duration-300 ${
                              u.online 
                                ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' 
                                : 'bg-stone-300 dark:bg-stone-700'
                            }`}>
                              {u.online && (
                                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50" />
                              )}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                                {displayName}
                              </p>
                              {u.isApproved && (
                                <span className="shrink-0 text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                                  ✓
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`inline-block h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                                u.online ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-700'
                              }`} />
                              <p className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                                {u.online ? 'Online' : 'Offline'}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex-shrink-0">
                            {(() => {
                              if (hasPendingRequest) {
                                return (
                                  <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-800/50">
                                    Pending
                                  </span>
                                );
                              } else if (hasIncomingRequest) {
                                return (
                                  <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    Request
                                  </span>
                                );
                              } else if (u.isApproved) {
                                return (
                                  <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setUserToUnapprove(u);
                                      setShowUnapproveConfirm(true);
                                    }}
                                    aria-label="Remove contact"
                                    className="p-1.5 rounded-lg text-stone-300 dark:text-stone-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all duration-200"
                                  >
                                    <UserMinus size={14} strokeWidth={2} />
                                  </motion.button>
                                );
                              } else {
                                return (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      sendChatRequest(u.id, displayName);
                                    }}
                                    aria-label="Send chat request"
                                    className="p-1.5 rounded-lg text-stone-300 dark:text-stone-600 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all duration-200"
                                  >
                                    <UserPlus size={14} strokeWidth={2} />
                                  </motion.button>
                                );
                              }
                            })()}
                          </div>
                        </motion.button>
                      );
                    })
                  )}
                </div>

                {/* Bottom Profile Section */}
                <div className="border-t border-stone-200/80 dark:border-stone-800/80 p-3 bg-gradient-to-r from-amber-50/20 to-white dark:from-stone-900/50 dark:to-stone-900/80 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <AvatarWithFallback 
                      seed={user?.id || 'user'} 
                      name={userProfile?.full_name || user?.email || 'User'}
                      size="h-8 w-8"
                      textSize="text-xs font-medium"
                      className="rounded-full ring-2 ring-amber-500/20 dark:ring-amber-400/20"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 dark:text-white truncate">
                        {userProfile?.full_name || user?.email || 'User'}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <p className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">Online</p>
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      onClick={() => navigate('/signin')}
                    >
                      <LogOut size={16} strokeWidth={2} className="text-stone-400 dark:text-stone-500 hover:text-red-500 transition-colors" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="lg:col-span-2 h-full overflow-hidden">
              <div className="h-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/60 dark:border-stone-800/60 overflow-hidden flex flex-col">
                
                {/* Chat Header */}
                <div className="flex items-center justify-between px-2 sm:px-4 lg:px-6 py-1.5 sm:py-3 lg:py-4 border-b border-stone-200/80 dark:border-stone-800/80 bg-gradient-to-r from-amber-50/30 to-white dark:from-stone-900/50 dark:to-stone-900/80 flex-shrink-0">
                  <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
                    {/* Mobile Menu Button */}
                    <button
                      onClick={() => setIsMobileSidebarOpen(true)}
                      aria-label="Open menu"
                      className="lg:hidden group flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 text-stone-600 dark:text-stone-300 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400 active:scale-95"
                    >
                      <FaBars className="text-sm sm:text-base transition-transform duration-200 group-hover:scale-110" />
                    </button>
                    
                    {selectedUser ? (
                      <>
                        <div className="relative flex-shrink-0">
                          {getUserAvatar(selectedUser) ? (
                            <img
                              src={getUserAvatar(selectedUser)}
                              alt={getUserDisplayName(selectedUser)}
                              className="h-7 w-7 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full object-cover shadow-lg ring-2 ring-amber-300/20"
                            />
                          ) : (
                            <AvatarWithFallback 
                              seed={selectedUser.id || getUserDisplayName(selectedUser)} 
                              name={getUserDisplayName(selectedUser)}
                              size="h-7 w-7 sm:h-9 sm:w-9 lg:h-10 lg:w-10"
                              textSize="text-[10px] sm:text-xs lg:text-sm"
                            />
                          )}
                          <motion.span 
                            className={`absolute bottom-0 right-0 h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 rounded-full border-2 border-white ${
                              selectedUser.online ? 'bg-green-500' : 'bg-stone-400'
                            }`}
                            animate={selectedUser.online ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h1 className="text-xs sm:text-sm lg:text-base font-bold text-stone-900 dark:text-white truncate">
                            {getUserDisplayName(selectedUser)}
                          </h1>
                          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                            <span className={`relative flex h-1 w-1 sm:h-1.5 sm:w-1.5`}>
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                                selectedUser.online ? 'bg-emerald-400' : 'bg-stone-400'
                              } opacity-75`} />
                              <span className={`relative inline-flex rounded-full h-1 w-1 sm:h-1.5 sm:w-1.5 ${
                                selectedUser.online ? 'bg-emerald-500' : 'bg-stone-500'
                              }`} />
                            </span>
                            <span className="text-[8px] sm:text-[10px] lg:text-xs text-stone-500 dark:text-stone-400">
                              {selectedUser.online ? 'Online' : 'Offline'}
                            </span>
                            {selectedUser.isApproved && (
                              <span className="text-[6px] sm:text-[8px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-0.5 sm:px-1 py-0.5 rounded-full">
                                ✓ Approved
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm">
                        Select a user
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0">
                    {selectedUser && selectedUser.isApproved && (
                      <>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleCallClick('voice')}
                          className="p-1.5 sm:p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors text-emerald-500 hover:text-emerald-600"
                          title="Voice Call"
                        >
                          <FaPhone className="text-xs sm:text-base" />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleCallClick('video')}
                          className="hidden sm:flex p-1.5 sm:p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                          title="Video Call"
                        >
                          <FaVideoCall className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm" />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => blockUser(selectedUser.id)}
                          className="hidden sm:flex p-1.5 sm:p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Block User"
                        >
                          <FaBan className="text-red-500 text-xs sm:text-sm" />
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-1.5 sm:p-3 lg:p-6 space-y-1.5 sm:space-y-3 lg:space-y-4 scrollbar-thin scrollbar-thumb-amber-200 dark:scrollbar-thumb-stone-700 pb-20 sm:pb-4">
                  {!selectedUser ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-2 sm:px-4">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <FaUsers className="text-3xl sm:text-5xl lg:text-6xl text-stone-300 dark:text-stone-700 mb-1 sm:mb-4" />
                      </motion.div>
                      <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-stone-700 dark:text-stone-300">No Conversation</h3>
                      <p className="text-[10px] sm:text-sm text-stone-400 dark:text-stone-500">Select a user to start</p>
                    </div>
                  ) : !selectedUser.isApproved ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-2 sm:px-4">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <FaUserPlus className="text-3xl sm:text-5xl lg:text-6xl text-amber-300 dark:text-amber-700 mb-1 sm:mb-4" />
                      </motion.div>
                      <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-stone-700 dark:text-stone-300">Waiting for Approval</h3>
                      <p className="text-[10px] sm:text-sm text-stone-400 dark:text-stone-500">Send a request to start</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => sendChatRequest(selectedUser.id, getUserDisplayName(selectedUser))}
                        className="mt-2 sm:mt-4 px-3 sm:px-6 py-1 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-sm shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all"
                      >
                        Send Request
                      </motion.button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-2 sm:px-4">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <FaComment className="text-3xl sm:text-5xl lg:text-6xl text-stone-300 dark:text-stone-700 mb-1 sm:mb-4" />
                      </motion.div>
                      <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-stone-700 dark:text-stone-300">No messages</h3>
                      <p className="text-[10px] sm:text-sm text-stone-400 dark:text-stone-500">Start the conversation</p>
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
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          className={`flex ${isUser ? 'justify-end' : 'justify-start'} group relative`}
                          onMouseEnter={() => !isDeleting && setShowMessageMenu(message.id)}
                          onMouseLeave={() => setShowMessageMenu(null)}
                          onTouchStart={(e) => {
                            if (isUser) {
                              touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                              longPressTimerRef.current = setTimeout(() => {
                                handleMessagePress(message, e);
                              }, 600);
                            }
                          }}
                          onTouchEnd={() => {
                            clearTimeout(longPressTimerRef.current);
                          }}
                          onTouchMove={(e) => {
                            if (touchStartPosRef.current) {
                              const dx = Math.abs(e.touches[0].clientX - touchStartPosRef.current.x);
                              const dy = Math.abs(e.touches[0].clientY - touchStartPosRef.current.y);
                              if (dx > 10 || dy > 10) {
                                clearTimeout(longPressTimerRef.current);
                              }
                            }
                          }}
                        >
                          <div className={`flex items-start gap-1.5 sm:gap-2 lg:gap-3 max-w-[85%] sm:max-w-[80%] lg:max-w-[70%] ${isUser ? 'flex-row-reverse' : ''}`}>
                            <div className="flex-shrink-0 mt-1">
                              {isUser ? (
                                <div className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 text-[8px] sm:text-sm">
                                  <FaUser className="text-[6px] sm:text-[10px]" />
                                </div>
                              ) : (
                                <AvatarWithFallback 
                                  seed={selectedUser.id || getUserDisplayName(selectedUser)} 
                                  name={getUserDisplayName(selectedUser)}
                                  size="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8"
                                  textSize="text-[8px] sm:text-[10px] font-bold"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              {/* Reply Preview */}
                              {hasReply && (
                                <div className={`text-[8px] sm:text-[10px] mb-0.5 px-2 py-0.5 rounded-lg max-w-full truncate ${
                                  isUser 
                                    ? 'bg-amber-400/20 text-amber-100' 
                                    : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
                                }`}>
                                  <span className="font-medium">
                                    Replying to {hasReply.sender === 'user' ? 'yourself' : getUserDisplayName(selectedUser)}:
                                  </span>
                                  <span className="ml-1 opacity-80 truncate">
                                    {hasReply.text && hasReply.text.length > 20 ? hasReply.text.substring(0, 20) + '...' : hasReply.text}
                                  </span>
                                </div>
                              )}
                              
                              <div className={`rounded-2xl px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 relative max-w-full ${
                                isUser 
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30' 
                                  : 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white shadow-lg shadow-stone-200/20 dark:shadow-stone-800/20'
                              }`}>
                                {isDeleting ? (
                                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                                    <FaSpinner className="animate-spin" />
                                    <span>Deleting...</span>
                                  </div>
                                ) : isImage ? (
                                  <img 
                                    src={message.text} 
                                    alt="Shared image" 
                                    className="max-w-[150px] sm:max-w-[200px] lg:max-w-[280px] rounded-lg object-cover"
                                    loading="lazy"
                                  />
                                ) : isSticker ? (
                                  <span className="text-3xl sm:text-4xl lg:text-6xl block text-center">
                                    {message.text}
                                  </span>
                                ) : isVoice ? (
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <button
                                      onClick={() => playVoiceMessage(message)}
                                      className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 ${
                                        isPlayingAudio 
                                          ? 'bg-red-500 text-white' 
                                          : 'bg-amber-500 text-white hover:bg-amber-600'
                                      }`}
                                    >
                                      {isPlayingAudio ? (
                                        <FaPause className="text-xs sm:text-sm" />
                                      ) : (
                                        <FaPlay className="text-xs sm:text-sm" />
                                      )}
                                    </button>
                                    <div className="flex-1">
                                      <div className="h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                                        <motion.div
                                          initial={{ width: '0%' }}
                                          animate={{ width: isPlayingAudio ? '100%' : '0%' }}
                                          transition={{ duration: isPlayingAudio ? message.duration || 3 : 0 }}
                                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                        />
                                      </div>
                                      <div className="flex justify-between mt-0.5">
                                        <span className="text-[8px] sm:text-[10px] text-stone-400 dark:text-stone-500">
                                          {formatDuration(message.duration || 0)}
                                        </span>
                                        <span className="text-[8px] sm:text-[10px] text-stone-400 dark:text-stone-500">
                                          Voice Message
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-[10px] sm:text-xs lg:text-sm leading-relaxed whitespace-pre-wrap break-words">
                                    {formatMessage(message.text)}
                                  </div>
                                )}
                                
                                {/* Desktop hover actions */}
                                {isUser && showMessageMenu === message.id && !isDeleting && (
                                  <div className="absolute -top-2 -right-2 flex gap-0.5">
                                    <motion.button
                                      initial={{ opacity: 0, scale: 0 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0 }}
                                      onClick={() => handleReplyToMessage(message)}
                                      className="p-0.5 sm:p-1 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-all"
                                      title="Reply to message"
                                    >
                                      <FaReply className="text-[6px] sm:text-xs" />
                                    </motion.button>
                                    <motion.button
                                      initial={{ opacity: 0, scale: 0 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0 }}
                                      onClick={() => {
                                        setSelectedMessage(message);
                                        setShowMessageActions(true);
                                      }}
                                      className="p-0.5 sm:p-1 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-all"
                                      title="Delete message"
                                    >
                                      <FaTrash className="text-[6px] sm:text-xs" />
                                    </motion.button>
                                  </div>
                                )}
                              </div>
                              <div className={`flex items-center gap-0.5 sm:gap-1 mt-0.5 ${isUser ? 'justify-end' : ''}`}>
                                <span className="text-[8px] sm:text-[10px] text-stone-400 dark:text-stone-500">
                                  {message.timestamp}
                                </span>
                                {isUser && !isDeleting && (
                                  <FaCheckDouble className="text-[8px] sm:text-[10px] text-amber-500" />
                                )}
                                {isUser && !isDeleting && (
                                  <span className="text-[8px] text-stone-400 dark:text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    (tap & hold)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                {selectedUser && selectedUser.isApproved && !isUserBlocked(selectedUser.id) && (
                  <div className="border-t border-stone-200/80 dark:border-stone-800/80 p-1.5 sm:p-3 lg:p-4 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm flex-shrink-0">
                    {/* Reply Preview */}
                    {replyingTo && (
                      <ReplyPreview 
                        replyTo={{
                          ...replyingTo,
                          senderName: replyingTo.sender === 'user' ? 'you' : getUserDisplayName(selectedUser)
                        }}
                        onCancelReply={() => setReplyingTo(null)}
                      />
                    )}
                    
                    <div className="flex items-end gap-1.5 sm:gap-2 lg:gap-3">
                      <div className="flex-1 relative">
                                       <textarea
                          ref={inputRef}
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder={replyingTo ? 'Reply to message...' : `Message ${getUserDisplayName(selectedUser)}...`}
                          rows="1"
                          className="w-full px-4 sm:px-3 lg:px-4 py-3 sm:py-2.5 lg:py-3 pr-10 sm:pr-16 rounded-full border border-stone-200 dark:border-stone-700 bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none text-xs sm:text-sm min-h-[32px] sm:min-h-[42px] lg:min-h-[50px] max-h-[60px] sm:max-h-[100px] lg:max-h-[150px] transition-all"
                          style={{ height: 'auto' }}
                        />
                        <div className="absolute right-1 sm:right-1.5 lg:right-2 bottom-3 sm:bottom-4 flex items-center gap-0.5 sm:gap-1">
                          {/* Sticker Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowStickerPicker(!showStickerPicker)}
                            className="p-0.5 sm:p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors relative"
                            title="Stickers"
                          >
                            <FaSmile className="text-stone-400 dark:text-stone-500 text-[12px] sm:text-[15px]" />
                          </motion.button>
                          
                          {/* Image Upload Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => fileInputRef.current?.click()}
                            className="p-0.5 sm:p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors relative"
                            title="Upload Image"
                            disabled={uploadingImage}
                          >
                            {uploadingImage ? (
                              <FaSpinner className="text-stone-400 dark:text-stone-500 text-[12px] sm:text-xs animate-spin" />
                            ) : (
                              <FaImage className="text-stone-400 dark:text-stone-500 text-[12px] sm:text-[15px]" />
                            )}
                          </motion.button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />

                          {/* Voice Recording Button */}
                          <motion.button
                            whileHover={{ scale: isRecording ? 1 : 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`p-0.5 sm:p-1 rounded-lg transition-all duration-300 relative ${
                              isRecording 
                                ? 'bg-red-500 text-white animate-pulse' 
                                : 'hover:bg-stone-100 dark:hover:bg-stone-700'
                            }`}
                            title={isRecording ? 'Stop recording' : 'Record voice message'}
                          >
                            {isRecording ? (
                              <FaStop className="text-[12px] sm:text-xs" />
                            ) : (
                              <FaMicrophoneIcon className="text-stone-400 dark:text-stone-500 text-[12px] sm:text-[15px]" />
                            )}
                          </motion.button>
                        </div>
                      </div>
                      
                      {/* Recording Indicator */}
                      {isRecording && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded-full">
                          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[10px] font-medium text-red-500">
                            {formatDuration(recordingDuration)}
                          </span>
                        </div>
                      )}
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={sendMessage}
                        disabled={!inputText.trim()}
                        className="p-3 sm:p-2.5 lg:p-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        <FaPaperPlane className="text-[18px] sm:text-xs lg:text-[25px]" />
                      </motion.button>
                    </div>
                    
                    {/* Sticker Picker */}
                    <AnimatePresence>
                      {showStickerPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 20, scale: 0.9 }}
                          className="absolute bottom-16 sm:bottom-20 left-0 right-0 bg-white dark:bg-stone-900 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-3 sm:p-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto z-50"
                        >
                          {/* Categories */}
                          <div className="flex gap-1 sm:gap-1.5 mb-2 sm:mb-3 overflow-x-auto pb-1 sm:pb-2 scrollbar-thin scrollbar-thumb-amber-200 dark:scrollbar-thumb-stone-700">
                            {STICKER_CATEGORIES.map((category, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedStickerCategory(idx)}
                                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                                  selectedStickerCategory === idx
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30'
                                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                                }`}
                              >
                                {category.name}
                              </button>
                            ))}
                          </div>
                          
                          {/* Emojis Grid */}
                          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 sm:gap-1.5">
                            {STICKER_CATEGORIES[selectedStickerCategory].emojis.map((emoji, idx) => (
                              <motion.button
                                key={idx}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => sendSticker(emoji)}
                                className="text-2xl sm:text-3xl lg:text-4xl p-1 sm:p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                              >
                                {emoji}
                              </motion.button>
                            ))}
                          </div>
                          
                          {/* Close Button */}
                          <button
                            onClick={() => setShowStickerPicker(false)}
                            className="absolute top-2 right-2 p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                          >
                            <X size={14} strokeWidth={2} className="text-stone-400" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                {selectedUser && isUserBlocked(selectedUser.id) && (
                  <div className="border-t border-stone-200/80 dark:border-stone-800/80 p-1.5 sm:p-4 bg-red-50 dark:bg-red-950/20 text-center flex-shrink-0">
                    <p className="text-[10px] sm:text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-2 flex-wrap">
                      <FaBan className="text-xs sm:text-base" /> You have blocked this user
                      <button
                        onClick={() => unblockUser(selectedUser.id)}
                        className="text-[10px] sm:text-xs bg-emerald-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full hover:bg-emerald-600 transition-colors"
                      >
                        Unblock
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block lg:col-span-1 space-y-4 overflow-hidden">
              <div className="space-y-4 overflow-y-auto max-h-full pr-1 scrollbar-thin scrollbar-thumb-amber-200 dark:scrollbar-thumb-stone-700">
                {selectedUser && (
                  <>
                    <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-2xl border border-stone-200/80 dark:border-stone-800/80 p-4 text-center shadow-xl shadow-stone-200/20 dark:shadow-stone-900/20">
                      <div className="relative inline-block">
                        {getUserAvatar(selectedUser) ? (
                          <motion.img
                            src={getUserAvatar(selectedUser)}
                            alt={getUserDisplayName(selectedUser)}
                            className="h-20 w-20 rounded-full object-cover shadow-lg ring-4 ring-amber-300/20"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          />
                        ) : (
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          >
                            <AvatarWithFallback 
                              seed={selectedUser.id || getUserDisplayName(selectedUser)} 
                              name={getUserDisplayName(selectedUser)}
                              size="h-20 w-20"
                              textSize="text-3xl font-bold"
                            />
                          </motion.div>
                        )}
                        <motion.span 
                          className={`absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                            selectedUser.online ? 'bg-green-500' : 'bg-stone-400'
                          }`}
                          animate={selectedUser.online ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                      <h3 className="font-bold text-stone-900 dark:text-white mt-3">
                        {getUserDisplayName(selectedUser)}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {selectedUser.online ? '🟢 Online' : '⚫ Offline'}
                      </p>
                      {selectedUser.isApproved && (
                        <span className="inline-block mt-1 text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                          ✓ Approved
                        </span>
                      )}
                    </div>

                    {selectedUser.isApproved && (
                      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-2xl border border-stone-200/80 dark:border-stone-800/80 p-4 shadow-xl shadow-stone-200/20 dark:shadow-stone-900/20">
                        <h4 className="text-xs font-semibold text-stone-400 dark:text-stone-500 mb-3">Quick Actions</h4>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCallClick('voice')}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors text-sm text-emerald-600 dark:text-emerald-400"
                        >
                          <FaPhone className="text-sm" />
                          <span>Voice Call</span>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCallClick('video')}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-sm text-stone-700 dark:text-stone-200"
                        >
                          <FaVideoCall className="text-amber-500" />
                          <span>Video Call</span>
                          <span className="ml-auto text-[8px] text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">Soon</span>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={clearChat}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-sm text-red-600 dark:text-red-400"
                        >
                          <FaTrash className="text-sm" />
                          <span>Clear Chat</span>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setUserToUnapprove(selectedUser);
                            setShowUnapproveConfirm(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors text-sm text-amber-600 dark:text-amber-400"
                        >
                          <FaUndo className="text-sm" />
                          <span>Remove Partner</span>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => blockUser(selectedUser.id)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-sm text-red-600 dark:text-red-400"
                        >
                          <FaBan className="text-sm" />
                          <span>Block User</span>
                        </motion.button>
                      </div>
                    )}
                  </>
                )}

                <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-2xl border border-stone-200/80 dark:border-stone-800/80 p-4 shadow-xl shadow-stone-200/20 dark:shadow-stone-900/20">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-3 flex items-center gap-2">
                    <FaClipboardList className="text-amber-500" />
                    Stats
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 dark:text-stone-400">Total Users</span>
                      <span className="font-semibold text-stone-900 dark:text-white">{allUsers.filter(u => !u.isBlocked).length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 dark:text-stone-400">Approved</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{allUsers.filter(u => u.isApproved && !u.isBlocked).length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 dark:text-stone-400">Pending</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{pendingRequests.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 dark:text-stone-400">Requests</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{chatRequests.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 dark:text-stone-400">Messages</span>
                      <span className="font-semibold text-stone-900 dark:text-white">{messages.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 dark:text-stone-400">Blocked</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">{blockedUsers.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Sidebar */}
          <AnimatePresence mode="wait">
            {isMobileSidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="fixed inset-0 bg-black/40 backdrop-blur-xl z-40 lg:hidden"
                  onClick={() => setIsMobileSidebarOpen(false)}
                />
                <motion.div
                  initial={{ x: '100%', opacity: 0.5 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0.5 }}
                  transition={{ 
                    type: 'spring', 
                    damping: 30, 
                    stiffness: 280,
                    mass: 0.9
                  }}
                  className="fixed right-0 top-11 h-full w-[340px] sm:w-[400px] bg-gradient-to-b from-white to-stone-50/95 dark:from-stone-950 dark:to-stone-900/95 z-50 lg:hidden overflow-y-auto shadow-2xl border-l border-stone-200/40 dark:border-stone-800/40"
                >
                  {/* Header */}
                  <div className="sticky top-0 z-20 bg-white/70 dark:bg-stone-950/70 backdrop-blur-2xl border-b border-stone-200/40 dark:border-stone-800/40 px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative shrink-0">
                          <AvatarWithFallback
                            seed={user?.id || user?.email || 'user'}
                            name={userProfile?.full_name || user?.name || user?.email || 'User'}
                            size="h-12 w-12"
                            textSize="text-base font-semibold"
                            className="rounded-full ring-2 ring-amber-500/20 dark:ring-amber-400/20 shadow-lg shadow-amber-500/10"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-stone-950 bg-emerald-500 shadow-lg shadow-emerald-500/30">
                            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-stone-900 dark:text-stone-50 text-base leading-tight truncate bg-gradient-to-r from-stone-900 to-stone-700 dark:from-stone-50 dark:to-stone-300 bg-clip-text">
                            {userProfile?.full_name || user?.email || 'User'}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">
                              {allUsers.filter(u => !u.isBlocked).length} contacts
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsMobileSidebarOpen(false)}
                        aria-label="Close sidebar"
                        className="p-2.5 -mr-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100/80 dark:hover:bg-stone-800/80 transition-all duration-300 hover:scale-95 active:scale-90"
                      >
                        <X size={18} strokeWidth={2} className="transition-transform duration-300 hover:rotate-90" />
                      </button>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-4 relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search size={16} strokeWidth={2} className="text-stone-400 dark:text-stone-500 group-focus-within:text-amber-500 transition-colors duration-300" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search contacts..."
                        className="w-full pl-10 pr-12 py-2.5 rounded-xl border-0 bg-stone-100/80 dark:bg-stone-900/80 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:bg-white dark:focus:bg-stone-950 transition-all duration-300 shadow-inner"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        <kbd className="text-[10px] font-mono font-medium text-stone-400 dark:text-stone-500 bg-stone-200/80 dark:bg-stone-800/80 px-2 py-0.5 rounded-md border border-stone-300/50 dark:border-stone-700/50">
                          ⌘K
                        </kbd>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-4">
                    {/* Chat Requests Card */}
                    {chatRequests.length > 0 && (
                      <div className="rounded-xl bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/40 dark:border-amber-800/30 overflow-hidden shadow-sm">
                        <button
                          onClick={toggleRequestsPanel}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-100/30 dark:hover:bg-amber-900/20 transition-colors duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500/60" />
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 shadow-lg shadow-amber-500/30" />
                            </div>
                            <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                              Chat Requests
                            </span>
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-200/60 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-full">
                              {chatRequests.length}
                            </span>
                          </div>
                          <motion.div
                            animate={{ rotate: showRequests ? 180 : 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <ChevronDown size={16} strokeWidth={2.5} className="text-stone-400 dark:text-stone-500" />
                          </motion.div>
                        </button>
                        
                        <AnimatePresence>
                          {showRequests && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden border-t border-amber-200/30 dark:border-amber-800/30"
                            >
                              {chatRequests.map((request, index) => (
                                <motion.div
                                  key={request.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05, duration: 0.2 }}
                                  className="flex items-center justify-between px-4 py-3 hover:bg-amber-100/30 dark:hover:bg-amber-900/20 transition-colors duration-200 border-b border-amber-200/20 dark:border-amber-800/20 last:border-0"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <AvatarWithFallback
                                      seed={request.sender_id || request.sender_name}
                                      name={request.sender_name || 'User'}
                                      size="h-9 w-9"
                                      textSize="text-xs font-medium"
                                      className="rounded-full ring-2 ring-amber-200/50 dark:ring-amber-800/50 shadow-sm"
                                    />
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                                        {request.sender_name || 'User'}
                                      </p>
                                      <p className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
                                        <span className="inline-block h-1 w-1 rounded-full bg-amber-400" />
                                        Wants to connect
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 flex-shrink-0">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => acceptRequest(request.id)}
                                      aria-label="Accept request"
                                      className="p-2 rounded-full text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all duration-200"
                                    >
                                      <Check size={15} strokeWidth={2.5} />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => rejectRequest(request.id)}
                                      aria-label="Reject request"
                                      className="p-2 rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all duration-200"
                                    >
                                      <X size={15} strokeWidth={2.5} />
                                    </motion.button>
                                  </div>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Contacts List */}
                    <div className="space-y-1.5">
                      {loading ? (
                        <div className="text-center py-16">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="inline-block"
                          >
                            <Loader2 size={36} strokeWidth={1.5} className="text-stone-300 dark:text-stone-700" />
                          </motion.div>
                          <p className="text-sm text-stone-400 mt-4 font-medium">Loading contacts...</p>
                        </div>
                      ) : allUsers.filter(u => !u.isBlocked).length === 0 ? (
                        <div className="text-center py-16">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-900 mb-4">
                            <Users size={32} strokeWidth={1.5} className="text-stone-300 dark:text-stone-700" />
                          </div>
                          <p className="text-sm font-semibold text-stone-500 dark:text-stone-400">No contacts yet</p>
                          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Start connecting with others</p>
                        </div>
                      ) : (
                        allUsers
                          .filter(u => !u.isBlocked)
                          .map((u, index) => {
                            const hasPendingRequest = pendingRequests.some(r => r.receiver_id === u.id);
                            const hasIncomingRequest = chatRequests.some(r => r.sender_id === u.id);
                            const displayName = getUserDisplayName(u);
                            const userAvatar = getUserAvatar(u);
                            const isSelected = selectedUser?.id === u.id;

                            return (
                              <motion.button
                                key={u.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03, duration: 0.25 }}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  if (isUserApproved(u.id)) {
                                    setSelectedUser(u);
                                    loadMessages(u.id);
                                    setIsMobileSidebarOpen(false);
                                  } else if (hasPendingRequest) {
                                    showNotification('Request pending...', 'info');
                                  } else if (hasIncomingRequest) {
                                    showNotification('You have a request from this user', 'info');
                                  } else {
                                    showNotification('Send a request to chat', 'info');
                                  }
                                }}
                                className={`relative w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-amber-50/90 to-orange-50/90 dark:from-amber-950/40 dark:to-orange-950/40 border-2 border-amber-200/60 dark:border-amber-800/50 shadow-lg shadow-amber-500/10'
                                    : 'hover:bg-stone-50/80 dark:hover:bg-stone-900/60 border-2 border-transparent hover:border-stone-200/50 dark:hover:border-stone-800/50'
                                }`}
                              >
                                {isSelected && (
                                  <motion.div
                                    layoutId="activeIndicator"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30"
                                  />
                                )}
                                
                                <div className="relative shrink-0">
                                  {userAvatar ? (
                                    <img
                                      src={userAvatar}
                                      alt={displayName}
                                      className="h-11 w-11 rounded-full object-cover ring-2 ring-stone-200/60 dark:ring-stone-800/60 shadow-sm"
                                    />
                                  ) : (
                                    <AvatarWithFallback
                                      seed={u.id || displayName}
                                      name={displayName}
                                      size="h-11 w-11"
                                      textSize="text-sm font-medium"
                                      className="rounded-full ring-2 ring-stone-200/60 dark:ring-stone-800/60 shadow-sm"
                                    />
                                  )}
                                  <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-stone-950 transition-all duration-300 ${
                                    u.online 
                                      ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' 
                                      : 'bg-stone-300 dark:bg-stone-700'
                                  }`}>
                                    {u.online && (
                                      <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50" />
                                    )}
                                  </span>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                                      {displayName}
                                    </p>
                                    {u.isApproved && (
                                      <span className="shrink-0 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                                        Connected
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`inline-block h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                                      u.online ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-700'
                                    }`} />
                                    <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">
                                      {u.online ? 'Online' : 'Offline'}
                                    </p>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex-shrink-0">
                                  {(() => {
                                    if (hasPendingRequest) {
                                      return (
                                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200/50 dark:border-amber-800/50">
                                          Pending
                                        </span>
                                      );
                                    } else if (hasIncomingRequest) {
                                      return (
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                          Request
                                        </span>
                                      );
                                    } else if (u.isApproved) {
                                      return (
                                        <motion.button
                                          whileHover={{ scale: 1.1, rotate: 90 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setUserToUnapprove(u);
                                            setShowUnapproveConfirm(true);
                                            setIsMobileSidebarOpen(false);
                                          }}
                                          aria-label="Remove contact"
                                          className="p-2 rounded-lg text-stone-300 dark:text-stone-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all duration-200"
                                        >
                                          <UserMinus size={15} strokeWidth={2} />
                                        </motion.button>
                                      );
                                    } else {
                                      return (
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            sendChatRequest(u.id, displayName);
                                          }}
                                          aria-label="Send chat request"
                                          className="p-2 rounded-lg text-stone-300 dark:text-stone-600 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all duration-200"
                                        >
                                          <UserPlus size={15} strokeWidth={2} />
                                        </motion.button>
                                      );
                                    }
                                  })()}
                                </div>
                              </motion.button>
                            );
                          })
                      )}
                    </div>
                  </div>

                  {/* Bottom Navigation */}
                  <div className="sticky bottom-0 bg-white/70 dark:bg-stone-950/70 backdrop-blur-2xl border-t border-stone-200/40 dark:border-stone-800/40 px-3 py-2.5">
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { icon: Home, label: 'Home', to: '/' },
                        { 
                          icon: Bell, 
                          label: 'Requests', 
                          badge: chatRequests.length, 
                          onClick: toggleRequestsPanel
                        },
                        { 
                          icon: X, 
                          label: 'Close', 
                          onClick: () => setIsMobileSidebarOpen(false) 
                        },
                        { 
                          icon: RotateCcw, 
                          label: 'Restore', 
                          onClick: () => {
                            if (selectedUser && isUserApproved(selectedUser.id)) {
                              setUserToUnapprove(selectedUser);
                              setShowUnapproveConfirm(true);
                              setIsMobileSidebarOpen(false);
                            } else {
                              showNotification('No approved chat partner selected', 'info');
                            }
                          }
                        },
                        { 
                          icon: UserCog, 
                          label: 'Profile', 
                          onClick: () => showNotification('Profile settings coming soon!', 'info') 
                        }
                      ].map((item, index) => (
                        item.to ? (
                          <Link
                            key={index}
                            to={item.to}
                            className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100/80 dark:hover:bg-stone-900/60 transition-all duration-200 group"
                          >
                            <item.icon size={18} strokeWidth={2} className="group-hover:scale-110 transition-transform duration-300" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                          </Link>
                        ) : (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={item.onClick}
                            className="relative flex flex-col items-center gap-1 py-2.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100/80 dark:hover:bg-stone-900/60 transition-all duration-200 group"
                          >
                            <span className="relative">
                              <item.icon size={18} strokeWidth={2} className="group-hover:scale-110 transition-transform duration-300" />
                              {item.badge > 0 && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                  className="absolute -top-1 -right-1.5 h-4.5 w-4.5 bg-gradient-to-br from-amber-500 to-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30"
                                >
                                  {item.badge > 9 ? '9+' : item.badge}
                                </motion.span>
                              )}
                            </span>
                            <span className="text-[10px] font-medium">{item.label}</span>
                          </motion.button>
                        )
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Unapprove Confirmation Modal */}
          <AnimatePresence>
            {showUnapproveConfirm && userToUnapprove && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
                onClick={() => {
                  setShowUnapproveConfirm(false);
                  setUserToUnapprove(null);
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                      <FaUndo className="text-3xl text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
                      Remove Chat Partner
                    </h3>
                    <p className="text-stone-500 dark:text-stone-400 text-sm mb-6">
                      Are you sure you want to remove <span className="font-semibold text-stone-900 dark:text-white">{userToUnapprove?.name || 'this user'}</span> from your approved chat partners?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowUnapproveConfirm(false);
                          setUserToUnapprove(null);
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => unapproveUser(userToUnapprove.id)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium hover:shadow-lg hover:shadow-red-500/30 transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;