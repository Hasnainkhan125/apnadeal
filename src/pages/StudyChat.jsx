// pages/StudyChat.jsx - Modern with Two-Way Messaging
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  FaArrowLeft,
  FaSpinner,
  FaPaperPlane,
  FaUserCircle,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaReply,
  FaUser,
  FaGraduationCap,
  FaDollarSign,
  FaWhatsapp,
  FaPhone,
  FaEnvelope,
  FaUserCheck,
  FaCheck,
  FaTimes,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const StudyChat = () => {
  const { partnerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [isPartnerUser, setIsPartnerUser] = useState(false);
  const messagesEndRef = useRef(null);

  // ─── Scroll to bottom ──────────────────────────────────────────────
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ─── Check if current user is the partner ─────────────────────────
  useEffect(() => {
    const checkIfPartner = async () => {
      if (!user || !partnerId) return;
      
      const { data, error } = await supabase
        .from('study_partners')
        .select('user_id')
        .eq('id', partnerId)
        .single();
      
      if (!error && data) {
        setIsPartnerUser(data.user_id === user.id);
      }
    };
    checkIfPartner();
  }, [user, partnerId]);

  // ─── Fetch Partner and Messages ──────────────────────────────────────
  const fetchPartnerAndMessages = useCallback(async () => {
    if (!user || !partnerId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch partner details
      const { data: partnerData, error: partnerError } = await supabase
        .from('study_partners')
        .select('*')
        .eq('id', partnerId)
        .single();

      if (partnerError) {
        console.error('Error fetching partner:', partnerError);
        setError('Partner not found');
        setLoading(false);
        return;
      }

      setPartner(partnerData);

      // Fetch messages - get ALL requests between this user and partner
      let query = supabase
        .from('study_requests')
        .select(`
          *,
          users:user_id (
            id,
            name,
            email
          )
        `)
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: true });

      // If user is the partner, show requests from all users
      if (partnerData.user_id === user.id) {
        // Partner can see all requests for their service
        const { data, error } = await supabase
          .from('study_requests')
          .select(`
            *,
            users:user_id (
              id,
              name,
              email
            )
          `)
          .eq('partner_id', partnerId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
          setError('Failed to load messages');
          return;
        }
        setMessages(data || []);
      } else {
        // Regular user sees only their requests
        const { data, error } = await supabase
          .from('study_requests')
          .select(`
            *,
            users:user_id (
              id,
              name,
              email
            )
          `)
          .eq('partner_id', partnerId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
          setError('Failed to load messages');
          return;
        }
        setMessages(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user, partnerId]);

  // ─── Real-time subscription ─────────────────────────────────────────
  useEffect(() => {
    fetchPartnerAndMessages();

    const subscription = supabase
      .channel('study-chat-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_requests',
        },
        (payload) => {
          console.log('🔄 Real-time message update:', payload);
          fetchPartnerAndMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchPartnerAndMessages]);

  // ─── Send Message ─────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !partner) return;

    setSending(true);

    try {
      // Check if there's an existing request
      const { data: existingRequest, error: checkError } = await supabase
        .from('study_requests')
        .select('id, message, partner_reply, status')
        .eq('partner_id', partnerId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing request:', checkError);
        setSending(false);
        return;
      }

      if (existingRequest) {
        // If status is rejected, don't allow messages
        if (existingRequest.status === 'rejected') {
          alert('This request was rejected. You cannot send more messages.');
          setSending(false);
          return;
        }

        // Update existing request with new message
        const updatedMessage = existingRequest.message 
          ? existingRequest.message + '\n\n' + newMessage.trim() 
          : newMessage.trim();
          
        const { error: updateError } = await supabase
          .from('study_requests')
          .update({
            message: updatedMessage,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRequest.id);

        if (updateError) {
          console.error('Error updating message:', updateError);
          alert('Failed to send message. Please try again.');
          setSending(false);
          return;
        }
      } else {
        // Create new request
        const { error: insertError } = await supabase
          .from('study_requests')
          .insert({
            partner_id: partnerId,
            user_id: user.id,
            message: newMessage.trim(),
            status: 'pending',
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Error creating request:', insertError);
          alert('Failed to send message. Please try again.');
          setSending(false);
          return;
        }
      }

      setNewMessage('');
      await fetchPartnerAndMessages();
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // ─── Partner Reply ────────────────────────────────────────────────────
  const sendPartnerReply = async (requestId, replyText) => {
    if (!replyText.trim()) return;

    setSending(true);

    try {
      const { error } = await supabase
        .from('study_requests')
        .update({
          partner_reply: replyText.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error sending reply:', error);
        alert('Failed to send reply. Please try again.');
        setSending(false);
        return;
      }

      await fetchPartnerAndMessages();
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to send reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // ─── Update Request Status ──────────────────────────────────────────
  const updateRequestStatus = async (requestId, status) => {
    setSending(true);

    try {
      const { error } = await supabase
        .from('study_requests')
        .update({
          status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error updating status:', error);
        alert('Failed to update status. Please try again.');
        setSending(false);
        return;
      }

      await fetchPartnerAndMessages();
      alert(`✅ Request ${status === 'accepted' ? 'approved' : 'rejected'} successfully!`);
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // ─── Get Status Color ───────────────────────────────────────────────
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'border-amber-200 dark:border-amber-800/30 bg-amber-50/30 dark:bg-amber-950/10';
      case 'accepted': return 'border-emerald-200 dark:border-emerald-800/30 bg-emerald-50/30 dark:bg-emerald-950/10';
      case 'rejected': return 'border-red-200 dark:border-red-800/30 bg-red-50/30 dark:bg-red-950/10';
      default: return 'border-stone-200 dark:border-stone-800';
    }
  };

  // ─── Status Badge ────────────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'pending':
        return <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><FaClock className="text-[10px]" /> Pending</span>;
      case 'accepted':
        return <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><FaCheckCircle className="text-[10px]" /> Approved ✓</span>;
      case 'rejected':
        return <span className="flex items-center gap-1 text-red-600 dark:text-red-400"><FaTimesCircle className="text-[10px]" /> Rejected ✗</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-stone-950">
        <div className="text-center">
          <div className="inline-block h-8 w-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 dark:text-stone-500 text-sm mt-4">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-stone-950">
        <div className="text-center">
          <p className="text-stone-500 dark:text-stone-400">{error || 'Partner not found'}</p>
          <Link to="/study-partners">
            <button className="mt-4 px-6 py-2 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 text-sm rounded-full hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
              Back to Partners
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-stone-50/50 dark:from-stone-950 dark:to-stone-900/50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/study-partners"
            className="p-2.5 rounded-xl bg-white dark:bg-stone-800 shadow-sm hover:shadow-md transition-all duration-300 border border-stone-200 dark:border-stone-700"
          >
            <FaArrowLeft className="text-stone-600 dark:text-stone-400" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-base font-bold shadow-lg shadow-amber-500/20">
                {partner.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                  {partner.name}
                </h2>
                <p className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-2">
                  <FaGraduationCap className="text-[10px]" />
                  {partner.subject} • {partner.level}
                  {isPartnerUser && (
                    <span className="flex items-center gap-1 text-emerald-500 text-[8px] bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                      <FaUserCheck className="text-[8px]" /> You are the Partner
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              const phone = partner.phone || '03140972575';
              window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
            }}
            className="p-2.5 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all duration-300 shadow-lg shadow-green-500/20"
            title="WhatsApp"
          >
            <FaWhatsapp className="text-lg" />
          </button>
        </div>

        {/* ─── Messages Container ──────────────────────────────────────── */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          {/* Status Bar */}
          {messages.length > 0 && (
            <div className={`p-4 border-b ${getStatusColor(messages[0].status)}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-500 dark:text-stone-400">Request Status:</span>
                  <StatusBadge status={messages[0].status} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 dark:text-stone-400">Rate:</span>
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">${partner.rate}/hr</span>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="h-[50vh] overflow-y-auto p-4 space-y-4 bg-stone-50/50 dark:bg-stone-900/30">
            <AnimatePresence>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center mb-4">
                    <FaUserCircle className="text-4xl text-amber-400 dark:text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-300">No messages yet</h3>
                  <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
                    Send a message to start the conversation
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwnMessage = msg.user_id === user.id;
                  const showPartnerReply = msg.partner_reply;

                  return (
                    <div key={msg.id} className="space-y-3">
                      {/* User Message */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-start gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwnMessage && (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
                            {msg.users?.name?.charAt(0).toUpperCase() || 'S'}
                          </div>
                        )}
                        <div className={`max-w-[75%] ${
                          isOwnMessage 
                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl rounded-tr-sm p-3 shadow-lg shadow-amber-500/20'
                            : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white rounded-2xl rounded-tl-sm p-3 shadow-md border border-stone-200 dark:border-stone-700'
                        }`}>
                          {!isOwnMessage && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                {msg.users?.name || 'Student'}
                              </span>
                              <span className="text-[8px] text-stone-400 dark:text-stone-500">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                          {isOwnMessage && (
                            <p className="text-[8px] text-white/70 mt-1 text-right">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                        {isOwnMessage && (
                          <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
                            {user?.name?.charAt(0).toUpperCase() || 'Y'}
                          </div>
                        )}
                      </motion.div>

                      {/* Partner Reply */}
                      {showPartnerReply && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-3 justify-start ml-4"
                        >
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
                            {partner.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="max-w-[75%] bg-emerald-50 dark:bg-emerald-950/30 text-stone-900 dark:text-white rounded-2xl rounded-tl-sm p-3 shadow-md border border-emerald-200 dark:border-emerald-800/30">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                {partner.name} (Partner)
                              </span>
                              <span className="text-[8px] text-stone-400 dark:text-stone-500">
                                {msg.updated_at ? new Date(msg.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed">{msg.partner_reply}</p>
                          </div>
                        </motion.div>
                      )}

                      {/* Partner Actions - Only for partner user */}
                      {isPartnerUser && msg.status === 'pending' && (
                        <div className="flex items-center gap-2 justify-end mt-2">
                          <button
                            onClick={() => updateRequestStatus(msg.id, 'accepted')}
                            disabled={sending}
                            className="px-4 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-full hover:bg-emerald-600 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <FaCheck className="text-[10px]" /> Approve
                          </button>
                          <button
                            onClick={() => updateRequestStatus(msg.id, 'rejected')}
                            disabled={sending}
                            className="px-4 py-1.5 bg-red-500 text-white text-xs font-medium rounded-full hover:bg-red-600 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <FaTimes className="text-[10px]" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </AnimatePresence>
          </div>

          {/* ─── Input Area ─────────────────────────────────────────────── */}
          <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
            {messages.length === 0 || messages[0]?.status !== 'rejected' ? (
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={messages.length === 0 ? "✏️ Send a request message..." : "✏️ Type your message..."}
                    className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl resize-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 dark:focus:border-amber-600 outline-none transition-all duration-300 text-sm text-stone-900 dark:text-white placeholder:text-stone-400"
                    rows="2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center min-w-[52px]"
                >
                  {sending ? (
                    <FaSpinner className="animate-spin text-lg" />
                  ) : (
                    <FaPaperPlane className="text-lg" />
                  )}
                </button>
              </div>
            ) : (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-800/30 text-center">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
                  <FaTimesCircle className="text-base" />
                  This request was rejected. You cannot send more messages.
                </p>
              </div>
            )}

            {/* Partner Reply Input - Only for partner user */}
            {isPartnerUser && messages.length > 0 && messages[0]?.status === 'pending' && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-200 dark:border-blue-800/30">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2 flex items-center gap-1">
                  <FaReply className="text-[10px]" />
                  Reply as Partner
                </p>
                <div className="flex items-end gap-2">
                  <textarea
                    placeholder="Write your reply as partner..."
                    className="flex-1 p-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all duration-300 text-sm text-stone-900 dark:text-white placeholder:text-stone-400"
                    rows="1"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (messages.length > 0) {
                          sendPartnerReply(messages[0].id, newMessage);
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (messages.length > 0) {
                        sendPartnerReply(messages[0].id, newMessage);
                      }
                    }}
                    disabled={sending || !newMessage.trim()}
                    className="p-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {sending ? (
                      <FaSpinner className="animate-spin text-sm" />
                    ) : (
                      <FaPaperPlane className="text-sm" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Info Footer ──────────────────────────────────────────────── */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-stone-400 dark:text-stone-500">
            💬 All messages are private between you and {partner.name}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudyChat;