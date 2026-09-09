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
  FaClock
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "👋 Hi there! How can I help you today? You can ask questions, report issues, or give feedback.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "text"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quickReplies] = useState([
    "Report a bug 🐛",
    "Give feedback 💡",
    "Ask a question ❓",
    "Feature request 🚀"
  ]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input when chat opens
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "text"
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const responses = [
        "Thank you for your feedback! We'll look into this and get back to you soon. 🙏",
        "I appreciate you reaching out! Your feedback is valuable to us. 💡",
        "Thanks for reporting this! Our team will investigate and fix it. 🔧",
        "Great suggestion! We'll consider this for future updates. 🚀",
        "I understand your concern. Let me escalate this to our support team. 📧",
        "Thank you for helping us improve! Your input makes a difference. ✨"
      ];

      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "text"
      };

      setMessages(prev => [...prev, botMessage]);
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
      {/* Toggle Button - Bottom Right */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen
            ? "bg-red-500 hover:bg-red-600"
            : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:shadow-amber-500/50"
        } text-white`}
        aria-label="Chat"
      >
        {isOpen ? (
          <FaTimes className="text-xl" />
        ) : (
          <FaHeadset className="text-xl" />
        )}
      </motion.button>

      {/* Chat Window - Right Side */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FaHeadset className="text-white text-sm" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Support & Feedback</h3>
                  <p className="text-white/80 text-xs flex items-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-300" />
                    </span>
                    Online
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="ml-auto p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-stone-50/50 dark:bg-stone-950/50">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex items-start gap-2 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.sender === "bot" && (
                      <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs">
                        <FaRobot />
                      </div>
                    )}
                    <div>
                      <div className={`rounded-2xl px-4 py-2.5 text-sm ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                          : "bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                      }`}>
                        {msg.text}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 ${msg.sender === "user" ? "justify-end" : ""}`}>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500">{msg.timestamp}</span>
                        {msg.sender === "user" && (
                          <FaCheckCircle className="text-[10px] text-emerald-500" />
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
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs">
                      <FaRobot />
                    </div>
                    <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-stone-400 dark:bg-stone-500 animate-bounce" />
                        <div className="h-2 w-2 rounded-full bg-stone-400 dark:bg-stone-500 animate-bounce delay-150" />
                        <div className="h-2 w-2 rounded-full bg-stone-400 dark:bg-stone-500 animate-bounce delay-300" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />

              {/* Quick Replies */}
              {messages.length < 3 && !isTyping && (
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400 transition-all text-xs"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-stone-200 dark:border-stone-800 p-3 bg-white dark:bg-stone-900">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows="1"
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none text-sm min-h-[40px] max-h-[100px]"
                  style={{ height: 'auto' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <FaPaperPlane className="text-sm" />
                </button>
              </div>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 text-center mt-2">
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