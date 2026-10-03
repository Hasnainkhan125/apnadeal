// components/FloatingChat.jsx — Modern ticket design (borderless, premium)
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaComments,
  FaTimes,
  FaPaperPlane,
  FaUser,
  FaRobot,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSmile,
  FaHeadset,
  FaArrowRight,
  FaClock,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
    .font-ticket-display { font-family: 'Fraunces', Georgia, serif; }
    .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }
    .chat-scroll::-webkit-scrollbar { width: 4px; }
    .chat-scroll::-webkit-scrollbar-track { background: transparent; }
    .chat-scroll::-webkit-scrollbar-thumb { background: rgba(27,24,21,0.12); border-radius: 4px; }
    .chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(235,125,52,0.5); }
    .dark .chat-scroll::-webkit-scrollbar-thumb { background: rgba(247,241,228,0.12); }
    .dark .chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(235,125,52,0.5); }
  `}</style>
);

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "👋 Hi there! How can I help you today? You can ask questions, report issues, or give feedback.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quickReplies] = useState([
    "Report a bug ",
    "Give feedback ",
    "Ask a question ",
    "Feature request ",
  ]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "user",
      text: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        "Thank you for your feedback! We'll look into this and get back to you soon. 🙏",
        "I appreciate you reaching out! Your feedback is valuable to us. 💡",
        "Thanks for reporting this! Our team will investigate and fix it. 🔧",
        "Great suggestion! We'll consider this for future updates. 🚀",
        "I understand your concern. Let me escalate this to our support team. 📧",
        "Thank you for helping us improve! Your input makes a difference. ✨",
      ];

      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "text",
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
    }, 1500 + Math.random() * 1000);
  };

  const handleQuickReply = (text) => {
    setMessage(text);
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <FontStyles />

      {/* ═══ TOGGLE BUTTON — orange circle with glow ═══ */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`group fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full transition-colors duration-300 overflow-hidden flex items-center justify-center ${
          isOpen
            ? "bg-[#1B1815] dark:bg-[#eb7d34]"
            : "bg-gradient-to-br from-[#eb7d34] to-[#c8631f]"
        }`}
        style={{
          boxShadow: isOpen
            ? "0 12px 30px -8px rgba(27,24,21,0.45)"
            : "0 12px 30px -8px rgba(235,125,52,0.7), 0 0 0 6px rgba(235,125,52,0.12)",
        }}
        aria-label="Chat"
      >
        {/* shine sweep */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

        {/* ping ring when closed */}
        {!isOpen && (
          <motion.span
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(235,125,52,0.55)",
                "0 0 0 14px rgba(235,125,52,0)",
              ],
            }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        {isOpen ? (
          <FaTimes className="text-xl text-[#F7F1E4] dark:text-[#1B1815] relative z-10" />
        ) : (
          <FaHeadset className="text-xl text-[#1B1815] relative z-10" />
        )}
      </motion.button>

      {/* ═══ CHAT WINDOW — borderless premium card ═══ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, y: 20, scale: 0.94 }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] rounded-[26px] overflow-hidden bg-[#FCFAF3] dark:bg-[#17140F]"
            style={{
              boxShadow:
                "0 25px 70px -20px rgba(27,24,21,0.35), 0 6px 20px -6px rgba(27,24,21,0.15)",
            }}
          >
            {/* ─── HEADER — orange gradient ─── */}
            <div
              className="relative px-5 py-4"
              style={{
                background: "linear-gradient(135deg, #eb7d34 0%, #c8631f 100%)",
              }}
            >
              {/* top sheen */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
                }}
              />

              <div className="flex items-center gap-3 relative">
                <div
                  className="h-10 w-10 rounded-xl bg-[#1B1815]/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
                  style={{ boxShadow: "0 0 0 1.5px rgba(27,24,21,0.35) inset" }}
                >
                  <FaHeadset className="text-[#1B1815] text-base" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-ticket-display text-[#1B1815] font-bold text-sm leading-tight truncate">
                    Support & Feedback
                  </h3>
                  <p className="font-ticket-body text-[#1B1815]/85 text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-widest">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#164B3B] opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#164B3B]" />
                    </span>
                    Online
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-[#1B1815] hover:bg-[#1B1815]/12 transition-colors flex-shrink-0"
                  aria-label="Close chat"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
            </div>

            {/* ─── MESSAGES ─── */}
            <div className="chat-scroll h-80 overflow-y-auto p-4 space-y-3 bg-[#F7F1E4] dark:bg-[#151210]">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start gap-2 max-w-[85%] ${
                      msg.sender === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    {msg.sender === "bot" && (
                      <div
                        className="flex-shrink-0 h-7 w-7 rounded-lg bg-[#eb7d34]/15 flex items-center justify-center text-[#c8631f] dark:text-[#eb7d34] text-xs"
                        style={{ boxShadow: "0 0 0 1px rgba(235,125,52,0.35) inset" }}
                      >
                        <FaRobot />
                      </div>
                    )}
                    <div>
                      <div
                        className={`rounded-2xl px-4 py-2.5 font-ticket-body text-sm ${
                          msg.sender === "user"
                            ? "bg-gradient-to-br from-[#eb7d34] to-[#c8631f] text-[#1B1815] font-semibold"
                            : "bg-[#FCFAF3] dark:bg-[#17140F] text-[#1B1815] dark:text-[#F7F1E4]"
                        }`}
                        style={
                          msg.sender === "user"
                            ? { boxShadow: "0 6px 16px -6px rgba(235,125,52,0.6)" }
                            : { boxShadow: "0 4px 14px -6px rgba(27,24,21,0.12)" }
                        }
                      >
                        {msg.text}
                      </div>
                      <div
                        className={`flex items-center gap-1 mt-1 ${
                          msg.sender === "user" ? "justify-end" : ""
                        }`}
                      >
                        <span className="font-ticket-body text-[10px] text-[#7A6F5D] dark:text-[#B3A793] font-medium">
                          {msg.timestamp}
                        </span>
                        {msg.sender === "user" && (
                          <FaCheckCircle className="text-[10px] text-[#164B3B] dark:text-[#3fa77f]" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-2 max-w-[85%]">
                    <div
                      className="flex-shrink-0 h-7 w-7 rounded-lg bg-[#eb7d34]/15 flex items-center justify-center text-[#c8631f] dark:text-[#eb7d34] text-xs"
                      style={{ boxShadow: "0 0 0 1px rgba(235,125,52,0.35) inset" }}
                    >
                      <FaRobot />
                    </div>
                    <div
                      className="bg-[#FCFAF3] dark:bg-[#17140F] rounded-2xl px-4 py-3"
                      style={{ boxShadow: "0 4px 14px -6px rgba(27,24,21,0.12)" }}
                    >
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-[#c8631f] dark:bg-[#eb7d34] animate-bounce" />
                        <div className="h-2 w-2 rounded-full bg-[#c8631f] dark:bg-[#eb7d34] animate-bounce delay-150" />
                        <div className="h-2 w-2 rounded-full bg-[#c8631f] dark:bg-[#eb7d34] animate-bounce delay-300" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />

              {/* Quick replies */}
              {messages.length < 3 && !isTyping && (
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="group/chip relative overflow-hidden px-3 py-1.5 rounded-full bg-[#FCFAF3] dark:bg-[#17140F] hover:bg-[#eb7d34] font-ticket-body text-xs font-semibold text-[#1B1815] dark:text-[#F7F1E4] hover:text-[#1B1815] transition-colors duration-300"
                      style={{ boxShadow: "0 2px 8px -2px rgba(27,24,21,0.12)" }}
                    >
                      <span className="relative z-10">{reply}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ─── INPUT ─── */}
            <div className="p-3 bg-[#FCFAF3] dark:bg-[#17140F]">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows="1"
                  className="font-ticket-body flex-1 px-3 py-2 rounded-xl bg-[#F7F1E4] dark:bg-[#151210] text-[#1B1815] dark:text-[#F7F1E4] placeholder:text-[#7A6F5D]/70 dark:placeholder:text-[#B3A793]/70 focus:outline-none focus:bg-[#F7F1E4] dark:focus:bg-[#151210] focus:ring-2 focus:ring-[#eb7d34]/40 transition-all resize-none text-sm min-h-[40px] max-h-[100px]"
                  style={{ height: "auto" }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="group/send relative h-10 w-10 rounded-xl overflow-hidden bg-gradient-to-br from-[#eb7d34] to-[#c8631f] text-[#1B1815] transition-all duration-300 hover:scale-[1.05] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0 flex items-center justify-center"
                  style={{
                    boxShadow: message.trim()
                      ? "0 6px 16px -6px rgba(235,125,52,0.7)"
                      : "none",
                  }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/send:translate-x-full transition-transform duration-700" />
                  <FaPaperPlane className="text-sm relative z-10" />
                </button>
              </div>
              <p className="font-ticket-body text-[10px] text-[#7A6F5D] dark:text-[#B3A793] text-center mt-2 font-medium">
                We typically respond within 24 hours
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChat;