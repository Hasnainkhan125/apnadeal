  // pages/DashboardPage.jsx — Premium Modern Dashboard (Dark/Light)
  import React, { useState, useEffect, useRef } from "react";
  import { Link } from "react-router-dom";
  import { useNavigate } from "react-router-dom";
  import {
    FaSearch,
    FaCalendarAlt,
    FaChartLine,
    FaChartBar,
    FaArrowUp,
    FaArrowDown,
    FaSpinner,
    FaBars,
    FaBell,
    FaCog,
    FaUser,
    FaUsers,
    FaCommentDots,
    FaHeart,
    FaTrophy,
    FaRegSmile,
    FaRegClock,
    FaCheckCircle,
    FaSyncAlt,
    FaChevronRight,
    FaRegCalendarAlt,
    FaCircle,
  } from "react-icons/fa";
  import { motion, AnimatePresence } from "framer-motion";
  import { useAuth } from "../contexts/AuthContext";
  import { useSettings } from "../contexts/SettingsContext";
  import { supabase } from "../lib/supabase";

  /* ═══════════════════════════════════════════════════════════════
    STYLES — Premium Modern Theme (Accent: logo orange palette)
    ═══════════════════════════════════════════════════════════════ */
  const DashboardStyles = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=Manrope:wght@400;500;600;700;800&display=swap');
      .font-ticket-display { font-family: 'Fraunces', Georgia, serif; letter-spacing: -0.02em; }
      .font-ticket-body { font-family: 'Manrope', system-ui, sans-serif; }

      /* ── DARK THEME (matches Navbar bg) ─────────────────────── */
      .theme-dark {
        --db-bg-1:          #0A0A12;   /* Navbar --nav-bg */
        --db-bg-2:          #0F0F1A;   /* Navbar --nav-bg-2 */
        --db-panel:         #14141D;   /* Navbar --nav-panel */
        --db-panel-2:       #1A1A24;   /* Navbar --nav-panel-2 */
        --db-line:          rgba(255,255,255,0.08);
        --db-line-str:      rgba(255,255,255,0.14);
        --db-txt:           #FFFFFF;
        --db-txt-soft:      rgba(255,255,255,0.68);
        --db-txt-faint:     rgba(255,255,255,0.42);
        --db-dot:           rgba(255,255,255,0.05);
        --db-primary:       #E26A2C; /* Dark orange from logo */
        --db-primary-2:     #F58220; /* Light orange from logo */
        --db-primary-3:     #D35400; /* Deep burnt orange from logo */
        --db-primary-soft:  rgba(242,138,45,0.14);
        --db-primary-glow:  rgba(242,138,45,0.45);
        --db-accent:        #F58220;
        --db-accent-soft:   rgba(242,138,45,0.16);
        --db-accent-glow:   rgba(242,138,45,0.55);
        --db-danger:        #EF4444;
        --db-neutral:       #52525B;
        --db-neutral-2:     #71717A;
        --db-card:          #14141D;   /* Navbar --nav-panel */
        --db-card-2:        #1A1A24;   /* Navbar --nav-panel-2 */
        --db-soft:          rgba(255,255,255,0.05);
        --db-icon:          rgba(255,255,255,0.68);
        --db-muted:         rgba(255,255,255,0.68);
        --db-switch-active: #F58220;
      }

      /* ── LIGHT THEME ────────────────────────────────────────── */
      .theme-light {
        --db-bg-1:          #F8F9FA;
        --db-bg-2:          #FFFFFF;
        --db-panel:         #FFFFFF;
        --db-panel-2:       #F9FAFB;
        --db-line:          #E5E7EB;
        --db-line-str:      #D1D5DB;
        --db-txt:           #111827;
        --db-txt-soft:      #6B7280;
        --db-txt-faint:     #9CA3AF;
        --db-dot:           rgba(0,0,0,0.04);
        --db-primary:       #D35400; /* Deep burnt orange for light mode */
        --db-primary-2:     #F58220;
        --db-primary-3:     #E26A2C;
        --db-primary-soft:  rgba(211,84,0,0.10);
        --db-primary-glow:  rgba(211,84,0,0.30);
        --db-accent:        #D35400;
        --db-accent-soft:   rgba(211,84,0,0.12);
        --db-accent-glow:   rgba(211,84,0,0.35);
        --db-danger:        #DC2626;
        --db-neutral:       #9CA3AF;
        --db-neutral-2:     #6B7280;
        --db-card:          #FFFFFF;
        --db-card-2:        #F9FAFB;
        --db-soft:          #F3F4F6;
        --db-icon:          #6B7280;
        --db-muted:         #6B7280;
        --db-switch-active: #D35400;
      }

      .db-bg {
        background: var(--db-bg-1);
        color: var(--db-txt);
        transition: background 0.35s ease, color 0.35s ease;
      }
      .db-panel {
        background: var(--db-card);
        border: 1px solid var(--db-line);
        transition: background 0.35s ease, border-color 0.35s ease;
      }
      .db-panel-soft {
        background: var(--db-panel);
        border: 1px solid var(--db-line);
        transition: background 0.35s ease, border-color 0.35s ease;
      }
      .db-hover:hover { background: var(--db-panel-2); }
      .db-input {
        background: var(--db-soft);
        border: 1px solid transparent;
        color: var(--db-txt);
        transition: border-color 0.2s ease;
      }
      .db-input:focus { border-color: var(--db-primary); }
      .db-input::placeholder { color: var(--db-txt-faint); }

      @keyframes db-ring-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .db-ring { animation: db-ring-spin 10s linear infinite; }

      /* ── Tile gradients using logo orange palette ── */
      .db-tile-1 {
        background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 50%, #FED7AA 100%);
      }
      .db-tile-2 {
        background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%);
      }
      .db-tile-1-dark {
        background: linear-gradient(135deg, #3A2410 0%, #6B3F0E 50%, #A8600C 100%);
      }
      .db-tile-2-dark {
        background: linear-gradient(135deg, #1F3A2E 0%, #1A3A5C 50%, #1F4A80 100%);
      }

      .db-progress {
        height: 6px;
        border-radius: 999px;
        background: var(--db-line);
        overflow: hidden;
      }
      .db-progress-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--db-primary), var(--db-primary-2));
        transition: width 0.4s ease;
      }

      @keyframes onlinePulse {
        0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.55); }
        70%  { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
      }
      .db-online-dot { animation: onlinePulse 2s infinite; }

      /* Custom Scrollbar */
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: var(--db-line-str); border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: var(--db-primary); }

      /* Prevent horizontal overflow on small screens */
      .db-no-overflow { overflow-x: hidden; }
    `}</style>
  );

  const smoothLinePath = (points) => {
    if (points.length < 2) return "";
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[i + 1];
      const mx = (x0 + x1) / 2;
      d += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
    }
    return d;
  };

  const smoothAreaPath = (points, baselineY) => {
    if (points.length < 2) return "";
    const line = smoothLinePath(points);
    const last = points[points.length - 1];
    const first = points[0];
    return `${line} L ${last[0]} ${baselineY} L ${first[0]} ${baselineY} Z`;
  };

  /* ═══════════════════════════════════════════════════════════════
    AVATAR
    ═══════════════════════════════════════════════════════════════ */
  const Avatar = ({ name, src, size = 36, online = false, ring = false }) => {
    const [errored, setErrored] = useState(false);
    const initial = (name || "U").charAt(0).toUpperCase();
    const showImg = src && !errored;

    return (
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <div
          className="w-full h-full rounded-full overflow-hidden flex items-center justify-center font-ticket-body font-bold"
          style={{
            background: showImg ? "var(--db-soft)" : "linear-gradient(135deg, var(--db-accent), var(--db-primary-3))",
            color: "#1A1613",
            fontSize: size * 0.4,
            boxShadow: ring ? "0 0 0 2px var(--db-accent)" : "none",
          }}
        >
          {showImg ? (
            <img
              src={src}
              alt={name}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={() => setErrored(true)}
            />
          ) : (
            initial
          )}
        </div>

        {online && (
          <span
            className="absolute -bottom-0.5 -right-0.5 rounded-full db-online-dot"
            style={{
              width: size * 0.3,
              height: size * 0.3,
              background: "#22C55E",
              border: "2px solid var(--db-card)",
            }}
          />
        )}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════
    CHAT HOVER CARD
    ═══════════════════════════════════════════════════════════════ */
  const ChatHoverCard = ({ user, onChat }) => {
    if (!user) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.98 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="pointer-events-none absolute z-50 w-[240px] p-3 rounded-2xl shadow-2xl"
        style={{
          background: "var(--db-card)",
          border: "1px solid var(--db-line-str)",
          top: "100%",
          left: "0",
          marginTop: 8,
          boxShadow: "0 20px 50px -18px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Avatar name={user.full_name} src={user.avatar_url} size={40} online={user.online} />
          <div className="min-w-0 flex-1">
            <p className="font-ticket-body text-[12px] font-bold truncate" style={{ color: "var(--db-txt)" }}>
              {user.full_name}
            </p>
            <p className="font-ticket-body text-[10px] truncate" style={{ color: "var(--db-txt-soft)" }}>
              {user.online ? "🟢 Online now" : "⚫ Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-2">
          {user.isApproved && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-ticket-body text-[9px] font-bold"
              style={{ background: "var(--db-accent-soft)", color: "var(--db-accent)" }}
            >
              <FaCheckCircle className="text-[7px]" /> Approved
            </span>
          )}
          {user.hasPendingRequest && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-ticket-body text-[9px] font-bold"
              style={{ background: "var(--db-accent-soft)", color: "var(--db-primary-3)" }}
            >
              Pending
            </span>
          )}
          {user.hasIncomingRequest && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-ticket-body text-[9px] font-bold"
              style={{ background: "rgba(178,58,46,0.12)", color: "var(--db-danger)" }}
            >
              Request
            </span>
          )}
        </div>

        <p className="font-ticket-body text-[10px] mb-2.5 line-clamp-2" style={{ color: "var(--db-txt-soft)" }}>
          {user.lastSeen ? `Last seen ${new Date(user.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Tap to start chatting"}
        </p>

        <button
          onClick={(e) => { e.stopPropagation(); onChat && onChat(user); }}
          className="pointer-events-auto w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-ticket-body text-[11px] font-bold transition-transform active:scale-95"
          style={{
            background: "var(--db-accent)",
            color: "#1A1613",
            boxShadow: "0 8px 18px -8px var(--db-accent-glow)",
          }}
        >
          <FaCommentDots className="text-[10px]" /> Chat now
        </button>
      </motion.div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════
    MAIN COMPONENT
    ═══════════════════════════════════════════════════════════════ */
  const DashboardPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { appearance } = useSettings();
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [hoveredUser, setHoveredUser] = useState(null);

    const [myAvatar, setMyAvatar] = useState(null);

    const [isDarkMode, setIsDarkMode] = useState(() => {
      return (
        document.documentElement.classList.contains("theme-dark") ||
        document.documentElement.classList.contains("dark") ||
        appearance?.theme === "dark" ||
        (appearance?.theme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    });

    useEffect(() => {
      const checkDarkMode = () => {
        const dark =
          document.documentElement.classList.contains("theme-dark") ||
          document.documentElement.classList.contains("dark") ||
          appearance?.theme === "dark" ||
          (appearance?.theme === "system" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);
        setIsDarkMode(dark);
      };
      checkDarkMode();
      const observer = new MutationObserver(() => checkDarkMode());
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        if (appearance?.theme === "system") checkDarkMode();
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => {
        observer.disconnect();
        mediaQuery.removeEventListener("change", handleChange);
      };
    }, [appearance?.theme]);

    const [allUsers, setAllUsers] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [rawMessages, setRawMessages] = useState([]);

    const [chartData, setChartData] = useState({
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      messages: [0, 0, 0, 0, 0, 0, 0],
      activeUsers: [0, 0, 0, 0, 0, 0, 0],
    });

    const [activityMetrics, setActivityMetrics] = useState({
      totalMessages: 0,
      activeUsers: 0,
      newUsers: 0,
      engagementRate: 0,
      peakHour: "--:--",
      mostActiveUser: "--",
      messagesPerUser: 0,
      responseRate: 0,
    });

    const [stats, setStats] = useState([
      { id: 1, title: "Total Users", value: "0", change: "+0" },
      { id: 2, title: "Active Now", value: "0", change: "+0" },
      { id: 3, title: "Total Messages", value: "0", change: "+0" },
      { id: 4, title: "Chat Requests", value: "0", change: "+0" },
    ]);

    const [rangeTab, setRangeTab] = useState("week");
    const [metricTab, setMetricTab] = useState("messages");
    const [chartStyle, setChartStyle] = useState("area");

    /* Load my avatar + realtime */
    useEffect(() => {
      if (!user) return;
      let cancelled = false;

      const loadMyAvatar = async () => {
        try {
          const { data, error } = await supabase
            .from("user_settings")
            .select("avatar")
            .eq("user_id", user.id)
            .maybeSingle();

          if (cancelled) return;

          if (!error && data?.avatar) {
            setMyAvatar(data.avatar);
          } else if (user?.user_metadata?.avatar_url) {
            setMyAvatar(user.user_metadata.avatar_url);
          } else {
            setMyAvatar(null);
          }
        } catch (err) {
          console.warn("Could not load avatar:", err);
          if (!cancelled && user?.user_metadata?.avatar_url) {
            setMyAvatar(user.user_metadata.avatar_url);
          }
        }
      };

      loadMyAvatar();

      const channel = supabase
        .channel("my-avatar-watch")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "user_settings", filter: `user_id=eq.${user.id}` },
          (payload) => {
            if (payload.new?.avatar) setMyAvatar(payload.new.avatar);
          }
        )
        .subscribe();

      return () => {
        cancelled = true;
        channel.unsubscribe();
      };
    }, [user]);

    const processDashboardData = (usersList, messagesList) => {
      setAllUsers(usersList || []);

      const onlineUsers = usersList?.filter((u) => u.online).length || 0;
      const totalUsers = usersList?.length || 0;
      const pendingRequestsCount =
        usersList?.filter((u) => u.hasIncomingRequest).length || 0;

      if (!messagesList || messagesList.length === 0) {
        setChartData({
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          messages: [0, 0, 0, 0, 0, 0, 0],
          activeUsers: [0, 0, 0, 0, 0, 0, 0],
        });
        setActivityMetrics({
          totalMessages: 0, activeUsers: 0, newUsers: 0, engagementRate: 0,
          peakHour: "--:--", mostActiveUser: "--", messagesPerUser: 0, responseRate: 0,
        });
        setStats([
          { id: 1, title: "Total Users", value: totalUsers.toString(), change: `+${totalUsers}` },
          { id: 2, title: "Active Now", value: onlineUsers.toString(), change: `+${onlineUsers}` },
          { id: 3, title: "Total Messages", value: "0", change: "+0" },
          { id: 4, title: "Chat Requests", value: pendingRequestsCount.toString(), change: `+${pendingRequestsCount}` },
        ]);
        return;
      }

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayCount = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
      const userSetByDay = {
        Mon: new Set(), Tue: new Set(), Wed: new Set(),
        Thu: new Set(), Fri: new Set(), Sat: new Set(), Sun: new Set(),
      };
      const userMessageCount = {};
      let totalMsg = 0;

      messagesList.forEach((msg) => {
        totalMsg++;
        const msgDate = msg.created_at || msg.time;
        if (msgDate) {
          const date = new Date(msgDate);
          const dayName = days[date.getDay()];
          if (dayCount[dayName] !== undefined) {
            dayCount[dayName]++;
            const senderId = msg.sender_id || msg.senderId;
            if (senderId && senderId !== user?.id) userSetByDay[dayName].add(senderId);
            if (senderId) userMessageCount[senderId] = (userMessageCount[senderId] || 0) + 1;
          }
        }
      });

      const activeUsersByDay = {};
      Object.keys(userSetByDay).forEach((day) => {
        activeUsersByDay[day] = userSetByDay[day].size;
      });

      setChartData({
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        messages: [dayCount.Mon, dayCount.Tue, dayCount.Wed, dayCount.Thu, dayCount.Fri, dayCount.Sat, dayCount.Sun],
        activeUsers: [
          activeUsersByDay.Mon || 0, activeUsersByDay.Tue || 0, activeUsersByDay.Wed || 0,
          activeUsersByDay.Thu || 0, activeUsersByDay.Fri || 0, activeUsersByDay.Sat || 0, activeUsersByDay.Sun || 0,
        ],
      });

      const uniqueUsers = Object.keys(userMessageCount).length;
      const mostActive = Object.keys(userMessageCount).reduce(
        (a, b) => (userMessageCount[a] > userMessageCount[b] ? a : b), ""
      );

      let mostActiveName = "--";
      if (mostActive) {
        const foundUser = usersList?.find((u) => u.id === mostActive);
        mostActiveName = foundUser?.full_name || foundUser?.email?.split("@")[0] || "User";
      }

      setActivityMetrics({
        totalMessages: totalMsg,
        activeUsers: uniqueUsers,
        newUsers: usersList?.filter((u) => !u.isApproved).length || 0,
        engagementRate: usersList?.length > 0 ? Math.round((uniqueUsers / usersList.length) * 100) : 0,
        peakHour: "2:00 PM",
        mostActiveUser: mostActiveName,
        messagesPerUser: uniqueUsers > 0 ? Math.round(totalMsg / uniqueUsers) : 0,
        responseRate: Math.min(95, 65 + Math.round(Math.random() * 30)),
      });

      setStats([
        { id: 1, title: "Total Users", value: totalUsers.toString(), change: `+${totalUsers}` },
        { id: 2, title: "Active Now", value: onlineUsers.toString(), change: `+${onlineUsers}` },
        { id: 3, title: "Total Messages", value: totalMsg.toString(), change: `+${totalMsg}` },
        { id: 4, title: "Chat Requests", value: pendingRequestsCount.toString(), change: `+${pendingRequestsCount}` },
      ]);
    };

    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const userId = user?.id;
        let usersList = [];
        let messagesList = [];
        let activitiesList = [];

        try {
          const { data: usersData, error: usersError } = await supabase.from("users").select("*");
          if (!usersError && usersData) {
            const filteredUsers = usersData.filter((u) => u.id !== userId);

            let settingsData = [];
            try { const { data: settings } = await supabase.from("user_settings").select("*"); if (settings) settingsData = settings; } catch (e) {}
            let statusData = [];
            try { const { data: status } = await supabase.from("user_status").select("*"); if (status) statusData = status; } catch (e) {}
            let requestsData = [];
            try {
              const { data: requests } = await supabase
                .from("chat_requests").select("*")
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
              if (requests) requestsData = requests;
            } catch (e) {}

            usersList = filteredUsers.map((u) => {
              const status = statusData?.find((s) => s.user_id === u.id);
              const settings = settingsData?.find((s) => s.user_id === u.id);
              const isApproved = requestsData?.some((c) => (c.sender_id === u.id || c.receiver_id === u.id) && c.status === "accepted");
              const hasPendingRequest = requestsData?.some((c) => c.sender_id === u.id && c.status === "pending");
              const hasIncomingRequest = requestsData?.some((c) => c.receiver_id === u.id && c.status === "pending");

              const avatarUrl =
                settings?.avatar ||
                u.avatar_url ||
                u.avatar ||
                null;

              return {
                ...u,
                full_name: settings?.full_name || u.name || u.email?.split("@")[0] || "User",
                avatar_url: avatarUrl,
                online: status?.status === "online" || false,
                lastSeen: status?.updated_at || null,
                isApproved: isApproved || false,
                hasPendingRequest: hasPendingRequest || false,
                hasIncomingRequest: hasIncomingRequest || false,
              };
            });

            try {
              const { data: messages, error: msgError } = await supabase
                .from("messages").select("*")
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .order("created_at", { ascending: false });

              if (!msgError && messages) {
                messagesList = messages;
                activitiesList = messages.slice(0, 20).map((msg) => {
                  const isMe = msg.sender_id === userId;
                  const sender = usersList.find((u) => u.id === msg.sender_id);
                  const senderName = isMe ? "You" : sender?.full_name || sender?.email?.split("@")[0] || "User";

                  const avatarUrl = isMe
                    ? (myAvatar || user?.user_metadata?.avatar_url || null)
                    : (sender?.avatar_url || null);

                  return {
                    id: msg.id,
                    user: senderName,
                    userId: msg.sender_id,
                    avatar_url: avatarUrl,
                    action: isMe ? "sent a message" : "sent you a message",
                    time: msg.created_at,
                    type: msg.message_type || "text",
                    content: msg.content?.substring(0, 30) + (msg.content?.length > 30 ? "..." : ""),
                  };
                });
              }
            } catch (e) {}
          }
        } catch (e) {}

        processDashboardData(usersList, messagesList);
        setRecentActivities(activitiesList);
        setRawMessages(messagesList);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
        setLastUpdated(new Date());
      }
    };

    useEffect(() => { if (user) loadDashboardData(); }, [user]);

    useEffect(() => {
      if (!user) return;
      try {
        const messageSubscription = supabase
          .channel("dashboard-messages")
          .on("postgres_changes",
            { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
            () => loadDashboardData())
          .subscribe();

        const statusSubscription = supabase
          .channel("dashboard-status")
          .on("postgres_changes",
            { event: "*", schema: "public", table: "user_status" },
            () => loadDashboardData())
          .subscribe();

        return () => {
          messageSubscription.unsubscribe();
          statusSubscription.unsubscribe();
        };
      } catch (e) {}
    }, [user]);

    const formatTime = (date) => {
      if (!date) return "";
      const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
      if (diff < 60) return "Just now";
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    };

    const onlineUsers = allUsers.filter((u) => u.online);
    const offlineUsers = allUsers.filter((u) => !u.online);
    const approvedUsers = allUsers.filter((u) => u.isApproved);
    const pendingRequestsList = allUsers.filter((u) => u.hasPendingRequest);
    const incomingRequestsList = allUsers.filter((u) => u.hasIncomingRequest);

    const getUserInitial = (name) => (name ? name.charAt(0).toUpperCase() : "U");

    const CHART_W = 640;
    const CHART_H = 200;
    const CHART_TOP = 14;
    const CHART_BOTTOM = 165;
    const CHART_LEFT = 10;
    const CHART_RIGHT = 630;

    const activeSeries = metricTab === "messages" ? chartData.messages : chartData.activeUsers;
    const maxChartValue = Math.max(...chartData.messages, ...chartData.activeUsers, 5);
    const stepX = (CHART_RIGHT - CHART_LEFT) / (chartData.labels.length - 1);

    const toPoints = (series) =>
      series.map((v, i) => [CHART_LEFT + i * stepX, CHART_BOTTOM - (v / maxChartValue) * (CHART_BOTTOM - CHART_TOP)]);

    const seriesPoints = toPoints(activeSeries);
    const areaPath = smoothAreaPath(seriesPoints, CHART_BOTTOM);
    const linePath = smoothLinePath(seriesPoints);
    const lastPoint = seriesPoints[seriesPoints.length - 1];
    const lastLabel = chartData.labels[chartData.labels.length - 1];
    const lastValue = activeSeries[activeSeries.length - 1];

    const totalRequestsCount = allUsers.length || 1;
    const ringData = [
      { label: "Approved", value: approvedUsers.length, color: "var(--db-accent)" },
      { label: "Pending", value: pendingRequestsList.length, color: "var(--db-primary-3)" },
      { label: "Incoming", value: incomingRequestsList.length, color: "var(--db-neutral-2)" },
      { label: "Offline", value: offlineUsers.length, color: "var(--db-neutral)" },
    ];

    const displayName = user?.email?.split("@")[0] || "there";
    const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    const iconColor = isDarkMode ? "rgba(255,255,255,0.55)" : "rgba(15,20,25,0.6)";
    const mutedIconColor = isDarkMode ? "rgba(255,255,255,0.42)" : "rgba(15,20,25,0.45)";
    const softBg = isDarkMode ? "rgba(255,255,255,0.06)" : "var(--db-soft)";

    if (isLoading) {
      return (
        <div className="min-h-screen db-bg flex items-center justify-center relative db-no-overflow">
          <DashboardStyles />
          <div className="relative text-center px-4">
            <FaSpinner className="text-4xl animate-spin mx-auto mb-3" style={{ color: "var(--db-accent)" }} />
            <p className="font-ticket-body text-sm" style={{ color: "var(--db-txt-soft)" }}>
              Loading dashboard...
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen db-bg text-sm relative db-no-overflow">
        <DashboardStyles />

        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-0">

          {/* LEFT COLUMN */}
          <div className="min-w-0 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={capitalizedName} src={myAvatar} size={44} ring />
                <div className="min-w-0">
                  <h1
                    className="font-ticket-display text-xl sm:text-2xl font-bold tracking-tight leading-tight truncate"
                    style={{ color: "var(--db-txt)" }}
                  >
                    Welcome, {capitalizedName}
                  </h1>
                  <p className="font-ticket-body text-[11px] sm:text-xs mt-0.5" style={{ color: "var(--db-txt-soft)" }}>
                    Your personal dashboard overview
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="hidden sm:flex items-center gap-2 db-input rounded-full px-4 py-2 w-[220px]">
                  <FaSearch className="text-[11px]" style={{ color: mutedIconColor }} />
                  <input
                    type="text"
                    placeholder="Search"
                    className="font-ticket-body bg-transparent outline-none text-xs flex-1"
                  />
                </div>
                <button className="h-10 w-10 rounded-full db-input flex items-center justify-center" aria-label="Profile">
                  <FaUser className="text-[12px]" style={{ color: iconColor }} />
                </button>
              </div>
            </div>

            {/* Profile + tiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Profile card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="db-panel rounded-3xl p-5 flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="font-ticket-display text-base font-bold" style={{ color: "var(--db-txt)" }}>
                    Profile
                  </p>
                  <button onClick={loadDashboardData} className="p-1 rounded-lg" aria-label="Refresh">
                    <FaSyncAlt className="text-[12px]" style={{ color: mutedIconColor }} />
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center py-3">
                  <div className="relative mb-3">
                    <div className="relative h-24 w-24">
                      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full db-ring">
                        <circle cx="50" cy="50" r="46" fill="none" stroke="var(--db-line)" strokeWidth="3" />
                        <circle
                          cx="50" cy="50" r="46" fill="none"
                          stroke="url(#profileRingGrad)" strokeWidth="3"
                          strokeDasharray="200 100" strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="profileRingGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="var(--db-accent)" />
                            <stop offset="100%" stopColor="var(--db-primary-3)" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-2 rounded-full overflow-hidden flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, var(--db-accent) 0%, var(--db-primary-3) 100%)" }}
                      >
                        {myAvatar ? (
                          <img
                            src={myAvatar}
                            alt={capitalizedName}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        ) : (
                          <span className="font-ticket-display text-3xl font-bold" style={{ color: "#1A1613" }}>
                            {getUserInitial(capitalizedName)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className="absolute bottom-0 right-0 h-7 w-7 rounded-full flex items-center justify-center"
                      style={{
                        background: "var(--db-txt)",
                        border: "2px solid var(--db-card)",
                      }}
                      aria-label="Edit avatar"
                    >
                      <FaUser className="text-[9px]" style={{ color: "var(--db-bg-1)" }} />
                    </button>
                  </div>
                  <p className="font-ticket-display text-lg font-bold text-center leading-tight" style={{ color: "var(--db-txt)" }}>
                    {capitalizedName}
                  </p>
                  <p className="font-ticket-body text-xs mt-0.5 text-center" style={{ color: "var(--db-txt-soft)" }}>
                    Premium Member
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-auto pt-3">
                  {[
                    { icon: FaUsers, value: allUsers.length, color: "var(--db-accent)" },
                    { icon: FaCommentDots, value: activityMetrics.totalMessages, color: "var(--db-danger)" },
                    { icon: FaTrophy, value: approvedUsers.length, color: "var(--db-primary-3)" },
                  ].map((chip, i) => {
                    const Icon = chip.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl"
                        style={{ background: softBg }}
                      >
                        <Icon
                          className="text-[10px]"
                          style={{ color: isDarkMode ? mutedIconColor : chip.color }}
                        />
                        <span
                          className="font-ticket-body text-[12px] font-bold tabular-nums"
                          style={{ color: isDarkMode ? "rgba(255,255,255,0.8)" : "var(--db-txt)" }}
                        >
                          {chip.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Tile 1 — Messages */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className={`rounded-3xl p-5 flex flex-col ${isDarkMode ? "db-tile-1-dark" : "db-tile-1"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="font-ticket-display text-base font-bold" style={{ color: isDarkMode ? "#fff" : "#1A1613" }}>
                    Messages
                  </p>
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center"
                    style={{ background: isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.6)" }}
                  >
                    <FaCommentDots
                      className="text-[12px]"
                      style={{ color: isDarkMode ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.7)" }}
                    />
                  </div>
                </div>
                <div className="mt-auto">
                  <p className="font-ticket-display text-4xl sm:text-5xl font-bold tabular-nums leading-none"
                    style={{ color: isDarkMode ? "#fff" : "#1A1613" }}>
                    {activityMetrics.engagementRate}%
                  </p>
                  <p className="font-ticket-body text-[11px] font-semibold mt-1"
                    style={{ color: isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(26,22,19,0.6)" }}>
                    Engagement rate
                  </p>
                </div>
              </motion.div>

              {/* Tile 2 — Active Users */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className={`rounded-3xl p-5 flex flex-col ${isDarkMode ? "db-tile-2-dark" : "db-tile-2"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="font-ticket-display text-base font-bold" style={{ color: isDarkMode ? "#fff" : "#1A1613" }}>
                    Active Users
                  </p>
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center"
                    style={{ background: isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.6)" }}
                  >
                    <FaCheckCircle
                      className="text-[12px]"
                      style={{ color: isDarkMode ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.7)" }}
                    />
                  </div>
                </div>
                <div className="mt-auto">
                  <p className="font-ticket-display text-4xl sm:text-5xl font-bold tabular-nums leading-none"
                    style={{ color: isDarkMode ? "#fff" : "#1A1613" }}>
                    {onlineUsers.length}
                  </p>
                  <p className="font-ticket-body text-[11px] font-semibold mt-1"
                    style={{ color: isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(26,22,19,0.6)" }}>
                    Online right now
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Trackers */}
            <div className="db-panel rounded-3xl px-5 py-4 flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="min-w-0">
                <p className="font-ticket-display text-base font-bold" style={{ color: "var(--db-txt)" }}>
                  Trackers connected
                </p>
                <p className="font-ticket-body text-[11px]" style={{ color: "var(--db-txt-soft)" }}>
                  {approvedUsers.length} active connections
                </p>
              </div>
              <div className="flex items-center gap-2">
                {approvedUsers.slice(0, 3).map((u) => (
                  <Avatar key={u.id} name={u.full_name} src={u.avatar_url} size={36} online={u.online} />
                ))}
                {approvedUsers.length === 0 && (
                  <p className="font-ticket-body text-[11px]" style={{ color: "var(--db-txt-soft)" }}>
                    No active trackers yet
                  </p>
                )}
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{
                    background: softBg,
                    color: mutedIconColor,
                  }}
                >
                  ⋯
                </div>
              </div>
            </div>

            {/* Focusing chart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="db-panel rounded-3xl p-5 sm:p-6"
            >
              <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                <div className="min-w-0">
                  <h2 className="font-ticket-display text-lg font-bold tracking-tight" style={{ color: "var(--db-txt)" }}>
                    Focusing
                  </h2>
                  <p className="font-ticket-body text-[11px] mt-0.5" style={{ color: "var(--db-txt-soft)" }}>
                    Productivity analytics
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-1 db-input rounded-xl p-1">
                    {["messages", "users"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setMetricTab(m)}
                        className="font-ticket-body px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                        style={
                          metricTab === m
                            ? { background: "var(--db-accent)", color: "#1A1613" }
                            : { color: isDarkMode ? "rgba(255,255,255,0.55)" : "var(--db-txt-soft)" }
                        }
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-1 db-input rounded-xl p-1">
                    <button
                      onClick={() => setChartStyle("area")}
                      className="p-2 rounded-lg transition-colors"
                      style={
                        chartStyle === "area"
                          ? { background: "var(--db-accent)", color: "#1A1613" }
                          : { color: isDarkMode ? "rgba(255,255,255,0.55)" : "var(--db-txt-soft)" }
                      }
                      aria-label="Area chart"
                    >
                      <FaChartLine className="text-[10px]" />
                    </button>
                    <button
                      onClick={() => setChartStyle("bar")}
                      className="p-2 rounded-lg transition-colors"
                      style={
                        chartStyle === "bar"
                          ? { background: "var(--db-accent)", color: "#1A1613" }
                          : { color: isDarkMode ? "rgba(255,255,255,0.55)" : "var(--db-txt-soft)" }
                      }
                      aria-label="Bar chart"
                    >
                      <FaChartBar className="text-[10px]" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
                <div className="relative min-h-[200px]">
                  {lastPoint && (
                    <div
                      className="absolute -translate-x-1/2 -translate-y-full rounded-2xl px-3 py-2 shadow-lg hidden sm:block z-10"
                      style={{
                        left: `${(lastPoint[0] / CHART_W) * 100}%`,
                        top: `${(lastPoint[1] / CHART_H) * 100}%`,
                        background: "var(--db-card)",
                        border: "1px solid var(--db-line)",
                      }}
                    >
                      <p className="font-ticket-body text-[10px]" style={{ color: "var(--db-txt-soft)" }}>
                        {lastLabel}
                      </p>
                      <p className="font-ticket-body text-xs font-bold tabular-nums" style={{ color: "var(--db-txt)" }}>
                        {lastValue}
                      </p>
                    </div>
                  )}
                  <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-44 sm:h-48 md:h-52 overflow-visible">
                    <defs>
                      <linearGradient id="areaFill2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--db-accent)" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="var(--db-accent)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[0, 0.5, 1].map((f) => (
                      <line
                        key={f}
                        x1={CHART_LEFT} x2={CHART_RIGHT}
                        y1={CHART_TOP + f * (CHART_BOTTOM - CHART_TOP)}
                        y2={CHART_TOP + f * (CHART_BOTTOM - CHART_TOP)}
                        stroke={isDarkMode ? "#ffffff" : "#000000"}
                        strokeOpacity="0.06" strokeDasharray="4 4"
                      />
                    ))}
                    {chartStyle === "area" ? (
                      <>
                        <path d={areaPath} fill="url(#areaFill2)" />
                        <path d={linePath} fill="none" stroke="var(--db-accent)" strokeWidth="2.5" strokeLinecap="round" />
                      </>
                    ) : (
                      seriesPoints.map(([x, y], i) => (
                        <rect key={i} x={x - 12} y={y} width="24" height={CHART_BOTTOM - y} rx="6"
                          fill="var(--db-accent)" fillOpacity="0.85" />
                      ))
                    )}
                    {seriesPoints.map(([x, y], i) => (
                      <circle key={i} cx={x} cy={y} r="4"
                        fill={isDarkMode ? "#0A0A0A" : "#ffffff"}
                        stroke="var(--db-accent)" strokeWidth="2" />
                    ))}
                    {chartData.labels.map((day, i) => (
                      <text
                        key={day}
                        x={CHART_LEFT + i * stepX}
                        y={CHART_H - 2}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="700"
                        style={{ fill: isDarkMode ? "#999" : "#666" }}
                      >
                        {day}
                      </text>
                    ))}
                  </svg>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="text-right">
                    <p className="font-ticket-display text-4xl sm:text-5xl font-bold tabular-nums leading-none" style={{ color: "var(--db-txt)" }}>
                      {metricTab === "messages" ? activityMetrics.totalMessages : activityMetrics.activeUsers}
                    </p>
                    <p className="font-ticket-body text-[10px] uppercase tracking-widest font-bold mt-1" style={{ color: "var(--db-txt-soft)" }}>
                      {metricTab === "messages" ? "Messages" : "Active users"}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t" style={{ borderColor: "var(--db-line)" }}>
                    {[
                      { label: "Peak hour", value: activityMetrics.peakHour },
                      { label: "Most active", value: activityMetrics.mostActiveUser, truncate: true },
                      { label: "Response rate", value: `${activityMetrics.responseRate}%` },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between items-center gap-3">
                        <span className="font-ticket-body text-[10px] uppercase tracking-wider font-bold shrink-0" style={{ color: "var(--db-txt-soft)" }}>
                          {row.label}
                        </span>
                        <span className={`font-ticket-body text-[11px] font-bold text-right ${row.truncate ? "truncate max-w-[120px]" : ""}`} style={{ color: "var(--db-txt)" }}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 pt-3 border-t" style={{ borderColor: "var(--db-line)" }}>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--db-accent)" }} />
                      <span className="font-ticket-body text-[10px]" style={{ color: "var(--db-txt-soft)" }}>Peak</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--db-primary-3)" }} />
                      <span className="font-ticket-body text-[10px]" style={{ color: "var(--db-txt-soft)" }}>Low</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <aside
            className="min-w-0 p-4 sm:p-6 lg:p-8 xl:border-l"
            style={{ borderColor: "var(--db-line)", background: "var(--db-card)" }}
          >
            <div className="flex items-center justify-between gap-3 mb-5">
              <h2 className="font-ticket-display text-xl font-bold tracking-tight" style={{ color: "var(--db-txt)" }}>
                My activity
              </h2>
              <button
                className="h-9 w-9 rounded-full db-input flex items-center justify-center"
                aria-label="Calendar"
              >
                <FaRegCalendarAlt className="text-[12px]" style={{ color: iconColor }} />
              </button>
            </div>

            <div className="space-y-1">
              {recentActivities.length === 0 ? (
                <p className="font-ticket-body text-xs py-6 text-center" style={{ color: "var(--db-txt-soft)" }}>
                  No activity yet
                </p>
              ) : (
                recentActivities.slice(0, 4).map((act, i) => (
                  <motion.div
                    key={act.id || i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      if (!act.userId || act.user === "You") return;
                      navigate(`/chat?user=${act.userId}`);
                    }}
                    className="flex items-start gap-3 py-3 border-b rounded-lg transition-colors cursor-pointer db-hover px-2 -mx-2"
                    style={{ borderColor: "var(--db-line)" }}
                  >
                    <Avatar
                      name={act.user}
                      src={act.avatar_url}
                      size={36}
                      online={false}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-ticket-body text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--db-txt-soft)" }}>
                        {formatTime(act.time)}
                      </p>
                      <p className="font-ticket-display text-sm font-bold mt-0.5 truncate" style={{ color: "var(--db-txt)" }}>
                        {act.user}
                      </p>
                      <p className="font-ticket-body text-[11px] truncate flex items-center gap-1.5 mt-0.5" style={{ color: "var(--db-txt-soft)" }}>
                        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--db-accent)" }} />
                        {act.action}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!act.userId || act.user === "You") return;
                        navigate(`/chat?user=${act.userId}`);
                      }}
                      className="flex-shrink-0 mt-1 p-1 rounded-md transition-colors"
                      aria-label="Open chat"
                    >
                      <FaArrowUp className="text-[10px] rotate-45" style={{ color: mutedIconColor }} />
                    </button>
                  </motion.div>
                ))
              )}
              {recentActivities.length > 4 && (
                <button
                  className="w-full flex items-center justify-end gap-1.5 py-3 font-ticket-body text-[11px] font-bold"
                  style={{ color: "var(--db-txt-soft)" }}
                >
                  See all activity <FaChevronRight className="text-[9px]" style={{ color: mutedIconColor }} />
                </button>
              )}
            </div>

            <div className="mt-6">
              <h2 className="font-ticket-display text-xl font-bold tracking-tight mb-1" style={{ color: "var(--db-txt)" }}>
                Activity breakdown
              </h2>
              <p className="font-ticket-body text-[11px] mb-4" style={{ color: "var(--db-txt-soft)" }}>
                Most common user states
              </p>

              <div className="space-y-4">
                {ringData.map((row) => {
                  const pct = totalRequestsCount > 0 ? Math.round((row.value / totalRequestsCount) * 100) : 0;
                  return (
                    <div key={row.label}>
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <span className="font-ticket-body text-[12px] font-bold" style={{ color: "var(--db-txt)" }}>
                          {row.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-ticket-body text-[11px] font-bold tabular-nums" style={{ color: "var(--db-txt-soft)" }}>
                            {pct}%
                          </span>
                          <span
                            className="inline-flex items-center justify-center h-5 w-5 rounded-full"
                            style={{ background: `${row.color}22`, color: row.color }}
                          >
                            <FaArrowUp className={`text-[7px] ${pct > 50 ? "" : "rotate-180"}`} />
                          </span>
                        </div>
                      </div>
                      <div className="db-progress">
                        <div className="db-progress-fill" style={{ width: `${pct}%`, background: row.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--db-line)" }}>
              <h2 className="font-ticket-display text-xl font-bold tracking-tight mb-4" style={{ color: "var(--db-txt)" }}>
                Requests
              </h2>

              <div className="flex items-center gap-5">
                <svg viewBox="0 0 140 140" className="w-28 sm:w-32 h-28 sm:h-32 shrink-0">
                  {ringData.map((ring, i) => {
                    const radius = 58 - i * 12;
                    const circumference = 2 * Math.PI * radius;
                    const pct = totalRequestsCount > 0 ? ring.value / totalRequestsCount : 0;
                    const dash = Math.max(pct * circumference, pct > 0 ? 4 : 0);
                    return (
                      <g key={ring.label} transform="rotate(-90 70 70)">
                        <circle cx="70" cy="70" r={radius} fill="none"
                          stroke={isDarkMode ? "#ffffff" : "#000000"}
                          strokeOpacity="0.08" strokeWidth="8" />
                        <circle cx="70" cy="70" r={radius} fill="none"
                          stroke={ring.color} strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={`${dash} ${circumference}`} />
                      </g>
                    );
                  })}
                </svg>
                <div className="space-y-2.5 flex-1 min-w-0">
                  {ringData.map((ring) => (
                    <div key={ring.label} className="flex items-center gap-2 font-ticket-body text-xs">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: ring.color }} />
                      <span className="truncate" style={{ color: "var(--db-txt-soft)" }}>{ring.label}</span>
                      <span className="font-bold ml-auto tabular-nums" style={{ color: "var(--db-txt)" }}>{ring.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--db-line)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-ticket-display text-xl font-bold tracking-tight" style={{ color: "var(--db-txt)" }}>
                  Users
                </h2>
                <Link to="/chat" className="font-ticket-body text-[11px] font-bold" style={{ color: "var(--db-accent)" }}>
                  View all →
                </Link>
              </div>

              <div className="space-y-1">
                {allUsers.length === 0 ? (
                  <p className="font-ticket-body text-xs text-center py-4" style={{ color: "var(--db-txt-soft)" }}>
                    No users found
                  </p>
                ) : (
                  allUsers.slice(0, 5).map((u) => (
                    <div
                      key={u.id}
                      onMouseEnter={() => setHoveredUser(u.id)}
                      onMouseLeave={() => setHoveredUser(null)}
                      className="relative flex items-center gap-3 py-2 rounded-xl transition-colors db-hover px-2 -mx-2 cursor-pointer"
                    >
                      <Avatar name={u.full_name} src={u.avatar_url} size={36} online={u.online} />
                      <div className="min-w-0 flex-1">
                        <p className="font-ticket-body text-xs font-bold truncate" style={{ color: "var(--db-txt)" }}>
                          {u.full_name}
                        </p>
                        <p className="font-ticket-body text-[10px] truncate" style={{ color: "var(--db-txt-soft)" }}>
                          {u.online ? "🟢 Online now" : "⚫ Offline"}
                        </p>
                      </div>
                      <span
                        className="font-ticket-body text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={
                          u.isApproved
                            ? { background: "var(--db-accent-soft)", color: "var(--db-accent)" }
                            : u.hasPendingRequest
                            ? { background: "var(--db-accent-soft)", color: "var(--db-primary-3)" }
                            : u.hasIncomingRequest
                            ? { background: "rgba(178,58,46,0.1)", color: "var(--db-danger)" }
                            : { background: softBg, color: mutedIconColor }
                        }
                      > 
                        {u.isApproved ? "Approved" : u.hasPendingRequest ? "Pending" : u.hasIncomingRequest ? "Request" : "New"}
                      </span>

                      <AnimatePresence>
                        {hoveredUser === u.id && (
                          <ChatHoverCard
                            user={u}
                            onChat={(usr) => {
                              window.location.href = `/chat?user=${usr.id}`;
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  };

  export default DashboardPage;