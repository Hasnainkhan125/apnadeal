// pages/DashboardPage.jsx - Fixed Chart & User Data
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaTh,
  FaComments,
  FaBoxOpen,
  FaUsers,
  FaShoppingCart,
  FaWallet,
  FaChartPie,
  FaQuestionCircle,
  FaMoon,
  FaSearch,
  FaPlus,
  FaBell,
  FaChevronDown,
  FaCog,
  FaSignOutAlt,
  FaCalendarAlt,
  FaChartLine,
  FaChartBar,
  FaArrowUp,
  FaArrowDown,
  FaTimes,
  FaLock,
  FaSignInAlt,
  FaSpinner,
  FaAngleDoubleLeft,
  FaSun,
  FaUserCircle,
  FaHome,
  FaBars,
  FaCreditCard,
  FaLifeRing
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import { supabase } from "../lib/supabase";

// ─── Chart Helpers ──────────────────────────────────────────────────────
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

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const { appearance } = useSettings();
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ─── Get theme from root element ──────────────────────────────────
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') ||
      appearance?.theme === 'dark' ||
      (appearance?.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // ─── Watch for dark class changes on root ─────────────────────────
  useEffect(() => {
    const checkDarkMode = () => {
      const dark = document.documentElement.classList.contains('dark') ||
        appearance?.theme === 'dark' ||
        (appearance?.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDarkMode(dark);
    };

    checkDarkMode();

    const observer = new MutationObserver(() => {
      checkDarkMode();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (appearance?.theme === 'system') {
        checkDarkMode();
      }
    };
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [appearance?.theme]);

  // ─── Real data states ──────────────────────────────────────────────
  const [allUsers, setAllUsers] = useState([]);
  const [chatRequests, setChatRequests] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [rawMessages, setRawMessages] = useState([]);

  const [chartData, setChartData] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    messages: [0, 0, 0, 0, 0, 0, 0],
    activeUsers: [0, 0, 0, 0, 0, 0, 0]
  });

  const [activityMetrics, setActivityMetrics] = useState({
    totalMessages: 0,
    activeUsers: 0,
    newUsers: 0,
    engagementRate: 0,
    peakHour: "--:--",
    mostActiveUser: "--",
    messagesPerUser: 0,
    responseRate: 0
  });

  const [stats, setStats] = useState([
    { id: 1, title: "Total Users", value: "0", change: "+0" },
    { id: 2, title: "Active Now", value: "0", change: "+0" },
    { id: 3, title: "Total Messages", value: "0", change: "+0" },
    { id: 4, title: "Chat Requests", value: "0", change: "+0" }
  ]);

  // ─── UI states ──────────────────────────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rangeTab, setRangeTab] = useState("week");
  const [metricTab, setMetricTab] = useState("messages");
  const [chartStyle, setChartStyle] = useState("area");
  const [showSidebarPro, setShowSidebarPro] = useState(true);

  // ─── Theme classes ──────────────────────────────────────────────────
  const theme = {
    bg: isDarkMode ? 'bg-stone-950' : 'bg-stone-50',
    bgCard: isDarkMode ? 'bg-stone-900/60' : 'bg-white',
    bgCardHover: isDarkMode ? 'hover:bg-white/5' : 'hover:bg-stone-50',
    bgInput: isDarkMode ? 'bg-white/5' : 'bg-stone-100',
    bgDropdown: isDarkMode ? 'bg-stone-900' : 'bg-white',
    bgSidebar: isDarkMode ? 'bg-stone-900/80' : 'bg-white/95',
    bgSegmented: isDarkMode ? 'bg-white/5' : 'bg-stone-100',
    bgStat: isDarkMode ? 'bg-stone-800/40' : 'bg-stone-50',
    bgOverlay: 'bg-black/50',
    
    border: isDarkMode ? 'border-white/5' : 'border-stone-200/50',
    borderCard: isDarkMode ? 'border-white/5' : 'border-stone-200/50',
    borderInput: isDarkMode ? 'border-white/5' : 'border-stone-200/50',
    borderDropdown: isDarkMode ? 'border-white/10' : 'border-stone-200',
    borderSidebar: isDarkMode ? 'border-stone-800/50' : 'border-stone-200/50',
    
    text: isDarkMode ? 'text-stone-200' : 'text-stone-800',
    textPrimary: isDarkMode ? 'text-white' : 'text-stone-900',
    textSecondary: isDarkMode ? 'text-stone-400' : 'text-stone-500',
    textMuted: isDarkMode ? 'text-stone-500' : 'text-stone-400',
    textInverse: isDarkMode ? 'text-stone-900' : 'text-white',
    
    icon: isDarkMode ? 'text-stone-300' : 'text-stone-600',
    iconMuted: isDarkMode ? 'text-stone-500' : 'text-stone-400',
    iconHover: isDarkMode ? 'hover:text-white' : 'hover:text-stone-900',
    
    nav: isDarkMode ? 'text-stone-400 hover:text-white hover:bg-white/5' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100',
    navActive: 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-white',
    
    chartGrid: isDarkMode ? '#ffffff0d' : '#0000000d',
    chartText: isDarkMode ? 'fill-stone-500' : 'fill-stone-400',
    chartDot: isDarkMode ? '#0b0b0f' : '#ffffff',
    
    ringBg: isDarkMode ? '#ffffff0d' : '#0000000d',
    ringDotBg: isDarkMode ? 'bg-stone-900' : 'bg-white',
    
    statusApproved: isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500/10 text-emerald-600',
    statusPending: isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-500/10 text-amber-600',
    statusRequest: isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/10 text-blue-600',
    statusNew: isDarkMode ? 'bg-white/10 text-stone-400' : 'bg-stone-100 text-stone-500',
    
    placeholder: isDarkMode ? 'placeholder-stone-500' : 'placeholder-stone-400',
    
    glow: 'shadow-lg shadow-amber-500/30',
  };

  // ─── Process data function ──────────────────────────────────────────
  const processDashboardData = (usersList, messagesList, requestsList) => {
    // Update users first
    setAllUsers(usersList || []);
    
    // Calculate stats
    const onlineUsers = usersList?.filter((u) => u.online).length || 0;
    const totalUsers = usersList?.length || 0;
    const pendingRequestsCount = usersList?.filter((u) => u.hasIncomingRequest).length || 0;
    
    // Process messages for chart
    if (!messagesList || messagesList.length === 0) {
      setChartData({
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        messages: [0, 0, 0, 0, 0, 0, 0],
        activeUsers: [0, 0, 0, 0, 0, 0, 0]
      });
      setActivityMetrics({
        totalMessages: 0,
        activeUsers: 0,
        newUsers: 0,
        engagementRate: 0,
        peakHour: "--:--",
        mostActiveUser: "--",
        messagesPerUser: 0,
        responseRate: 0
      });
      setStats([
        { id: 1, title: "Total Users", value: totalUsers.toString(), change: `+${totalUsers}` },
        { id: 2, title: "Active Now", value: onlineUsers.toString(), change: `+${onlineUsers}` },
        { id: 3, title: "Total Messages", value: "0", change: "+0" },
        { id: 4, title: "Chat Requests", value: pendingRequestsCount.toString(), change: `+${pendingRequestsCount}` }
      ]);
      return;
    }

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayCount = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const userSetByDay = { Mon: new Set(), Tue: new Set(), Wed: new Set(), Thu: new Set(), Fri: new Set(), Sat: new Set(), Sun: new Set() };
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
          if (senderId && senderId !== user?.id) {
            userSetByDay[dayName].add(senderId);
          }
          if (senderId) {
            userMessageCount[senderId] = (userMessageCount[senderId] || 0) + 1;
          }
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
        activeUsersByDay.Mon || 0,
        activeUsersByDay.Tue || 0,
        activeUsersByDay.Wed || 0,
        activeUsersByDay.Thu || 0,
        activeUsersByDay.Fri || 0,
        activeUsersByDay.Sat || 0,
        activeUsersByDay.Sun || 0
      ]
    });

    const uniqueUsers = Object.keys(userMessageCount).length;
    const mostActive = Object.keys(userMessageCount).reduce((a, b) => (userMessageCount[a] > userMessageCount[b] ? a : b), "");

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
      responseRate: Math.min(95, 65 + Math.round(Math.random() * 30))
    });

    setStats([
      { id: 1, title: "Total Users", value: totalUsers.toString(), change: `+${totalUsers}` },
      { id: 2, title: "Active Now", value: onlineUsers.toString(), change: `+${onlineUsers}` },
      { id: 3, title: "Total Messages", value: totalMsg.toString(), change: `+${totalMsg}` },
      { id: 4, title: "Chat Requests", value: pendingRequestsCount.toString(), change: `+${pendingRequestsCount}` }
    ]);
  };

  // ─── Data loading ──────────────────────────────────────────────────
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const userId = user?.id;
      let usersList = [];
      let messagesList = [];
      let activitiesList = [];

      // Fetch users
      try {
        const { data: usersData, error: usersError } = await supabase.from("users").select("*");
        if (!usersError && usersData) {
          const filteredUsers = usersData.filter((u) => u.id !== userId);
          
          // Fetch settings
          let settingsData = [];
          try {
            const { data: settings } = await supabase.from("user_settings").select("*");
            if (settings) settingsData = settings;
          } catch (e) {}

          // Fetch status
          let statusData = [];
          try {
            const { data: status } = await supabase.from("user_status").select("*");
            if (status) statusData = status;
          } catch (e) {}

          // Fetch chat requests
          let requestsData = [];
          try {
            const { data: requests } = await supabase
              .from("chat_requests")
              .select("*")
              .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
            if (requests) requestsData = requests;
          } catch (e) {}

          usersList = filteredUsers.map((u) => {
            const status = statusData?.find((s) => s.user_id === u.id);
            const settings = settingsData?.find((s) => s.user_id === u.id);
            const isApproved = requestsData?.some((c) => (c.sender_id === u.id || c.receiver_id === u.id) && c.status === "accepted");
            const hasPendingRequest = requestsData?.some((c) => c.sender_id === u.id && c.status === "pending");
            const hasIncomingRequest = requestsData?.some((c) => c.receiver_id === u.id && c.status === "pending");

            return {
              ...u,
              full_name: settings?.full_name || u.name || u.email?.split("@")[0] || "User",
              avatar_url: settings?.avatar_url || null,
              online: status?.status === "online" || false,
              lastSeen: status?.updated_at || null,
              isApproved: isApproved || false,
              hasPendingRequest: hasPendingRequest || false,
              hasIncomingRequest: hasIncomingRequest || false
            };
          });

          // Fetch messages
          try {
            const { data: messages, error: msgError } = await supabase
              .from("messages")
              .select("*")
              .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
              .order("created_at", { ascending: false });

            if (!msgError && messages) {
              messagesList = messages;
              activitiesList = messages.slice(0, 20).map((msg) => {
                const sender = usersList.find((u) => u.id === msg.sender_id);
                const senderName = msg.sender_id === userId ? "You" : sender?.full_name || sender?.email?.split("@")[0] || "User";
                return {
                  id: msg.id,
                  user: senderName,
                  action: msg.sender_id === userId ? "sent a message" : "sent you a message",
                  time: msg.created_at,
                  type: msg.message_type || "text",
                  content: msg.content?.substring(0, 30) + (msg.content?.length > 30 ? "..." : "")
                };
              });
            }
          } catch (e) {}
        }
      } catch (e) {}

      // Process all data together
      processDashboardData(usersList, messagesList, chatRequests);
      setRecentActivities(activitiesList);
      setRawMessages(messagesList);

      // Update chat requests count
      const incomingCount = usersList.filter((u) => u.hasIncomingRequest).length;
      setChatRequests(incomingCount > 0 ? [{ id: 1, sender: "User", status: "pending" }] : []);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    if (user) loadDashboardData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    try {
      const messageSubscription = supabase
        .channel("dashboard-messages")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` }, () => {
          loadDashboardData();
        })
        .subscribe();

      const statusSubscription = supabase
        .channel("dashboard-status")
        .on("postgres_changes", { event: "*", schema: "public", table: "user_status" }, () => {
          loadDashboardData();
        })
        .subscribe();

      return () => {
        messageSubscription.unsubscribe();
        statusSubscription.unsubscribe();
      };
    } catch (e) {}
  }, [user]);

  // ─── Helpers ──────────────────────────────────────────────────────
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

  // ─── Chart Geometry ────────────────────────────────────────────────
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
    { label: "Approved", value: approvedUsers.length, color: "#f59e0b" },
    { label: "Pending", value: pendingRequestsList.length, color: "#ec4899" },
    { label: "Incoming", value: incomingRequestsList.length, color: "#22c55e" },
    { label: "Offline", value: offlineUsers.length, color: "#ef4444" }
  ];

  const displayName = user?.email?.split("@")[0] || "there";
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  const navItems = [
    { label: "Overview", icon: FaTh, to: "/dashboard", active: true },
    { label: "Chats", icon: FaComments, to: "/chat" },
    { label: "Users", icon: FaUsers, to: "#" },
    { label: "Requests", icon: FaShoppingCart, to: "#" }
  ];

  const breakdown = [
    { label: "Approved", value: approvedUsers.length, up: true },
    { label: "Pending", value: pendingRequestsList.length, up: false },
    { label: "Incoming", value: incomingRequestsList.length, up: true },
    { label: "Offline", value: offlineUsers.length, up: false }
  ];

  // ─── Loading State ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="text-center">
          <FaSpinner className="text-4xl text-amber-500 animate-spin mx-auto mb-3" />
          <p className={`text-sm ${theme.textSecondary}`}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} flex text-sm`}>
      {/* ─── Mobile Sidebar Overlay ────────────────────────────────── */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>
      )}

      {/* ─── Main Content ──────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* ─── Topbar ────────────────────────────────────────────────── */}
        <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-3.5 border-b ${theme.border} flex-wrap`}>
          <div className={`hidden sm:flex items-center gap-2 flex-1 ${theme.bgInput} ${theme.borderInput} border rounded-xl px-3 py-1.5 max-w-sm`}>
            <FaSearch className={`${theme.iconMuted} text-sm`} />
            <input
              type="text"
              placeholder="Search"
              className={`bg-transparent outline-none text-sm flex-1 ${theme.text} ${theme.placeholder}`}
            />
          </div>

          <div className="flex-1" />

          <button
            onClick={loadDashboardData}
            className="sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-white hover:shadow-lg hover:shadow-amber-500/30 transition-all text-xs font-semibold"
          >
            Refresh
          </button>
        </div>

        {/* ─── Content ────────────────────────────────────────────────── */}
        <div className="p-4 sm:p-4 md:p-5">
          {/* Greeting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className={`text-lg sm:text-xl font-bold ${theme.textPrimary} flex items-center gap-2`}>
                <span>Welcome back, </span>
              </h3>
            </div>
            <div className={`flex items-center gap-1.5 ${theme.bgInput} ${theme.borderInput} border rounded-xl p-0.5`}>
              <button
                onClick={() => setRangeTab("today")}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  rangeTab === "today"
                    ? theme.navActive
                    : `${theme.textSecondary} ${theme.iconHover}`
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setRangeTab("week")}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  rangeTab === "week"
                    ? theme.navActive
                    : `${theme.textSecondary} ${theme.iconHover}`
                }`}
              >
                Week
              </button>
              <button className={`p-1 rounded-lg ${theme.textSecondary} ${theme.iconHover} transition-colors`}>
                <FaCalendarAlt className="text-xs" />
              </button>
            </div>
          </div>

          {/* ─── Stats Cards ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
            {stats.map((stat) => (
              <div key={stat.id} className={`${theme.bgCard} ${theme.borderCard} border rounded-xl p-3 sm:p-4`}>
                <p className={`text-[10px] sm:text-xs ${theme.textMuted}`}>{stat.title}</p>
                <p className={`text-xl sm:text-2xl font-bold ${theme.textPrimary}`}>{stat.value}</p>
                <span className={`text-[9px] sm:text-[10px] font-medium ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stat.change}
                </span>
              </div>
            ))}
          </div>

          {/* ─── Activity Card ────────────────────────────────────────── */}
          <div className={`${theme.bgCard} ${theme.borderCard} border rounded-xl sm:rounded-2xl p-3 sm:p-5 mb-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
              <h3 className={`font-semibold text-sm ${theme.textPrimary}`}>Activity</h3>
              <div className={`flex items-center gap-1.5 ${theme.bgSegmented} rounded-lg p-0.5 self-start sm:self-auto`}>
                <button
                  onClick={() => setChartStyle("area")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    chartStyle === "area"
                      ? theme.navActive
                      : theme.textSecondary
                  }`}
                >
                  <FaChartLine className="text-xs" />
                </button>
                <button
                  onClick={() => setChartStyle("bar")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    chartStyle === "bar"
                      ? theme.navActive
                      : theme.textSecondary
                  }`}
                >
                  <FaChartBar className="text-xs" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,200px)_1fr] gap-4 sm:gap-6">
              <div>
                <div className={`flex items-center gap-1.5 ${theme.bgSegmented} rounded-lg p-0.5 mb-3 w-fit`}>
                  <button
                    onClick={() => setMetricTab("messages")}
                    className={`px-2.5 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-medium transition-colors ${
                      metricTab === "messages"
                        ? theme.navActive
                        : theme.textSecondary
                    }`}
                  >
                    Messages
                  </button>
                  <button
                    onClick={() => setMetricTab("users")}
                    className={`px-2.5 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-medium transition-colors ${
                      metricTab === "users"
                        ? theme.navActive
                        : theme.textSecondary
                    }`}
                  >
                    Users
                  </button>
                </div>

                <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${theme.textPrimary}`}>
                  {metricTab === "messages" ? activityMetrics.totalMessages : activityMetrics.activeUsers}
                </p>
                <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] sm:text-[10px] font-semibold">
                  <FaArrowUp className="text-[8px]" /> {activityMetrics.engagementRate}%
                </span>
              </div>

              <div className="relative">
                {lastPoint && (
                  <div
                    className={`absolute -translate-x-1/2 -translate-y-full ${theme.bgCard} ${theme.borderCard} border rounded-lg px-2.5 py-1.5 text-[10px] shadow-xl hidden sm:block`}
                    style={{ left: `${(lastPoint[0] / CHART_W) * 100}%`, top: `${(lastPoint[1] / CHART_H) * 100}%` }}
                  >
                    <p className={theme.textMuted}>{lastLabel}</p>
                    <p className={`font-semibold ${theme.textPrimary}`}>{lastValue}</p>
                  </div>
                )}
                <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-32 sm:h-36 md:h-40 overflow-visible">
                  <defs>
                    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0, 0.5, 1].map((f) => (
                    <line
                      key={f}
                      x1={CHART_LEFT}
                      x2={CHART_RIGHT}
                      y1={CHART_TOP + f * (CHART_BOTTOM - CHART_TOP)}
                      y2={CHART_TOP + f * (CHART_BOTTOM - CHART_TOP)}
                      stroke={isDarkMode ? "#ffffff" : "#000000"}
                      strokeOpacity="0.05"
                      strokeDasharray="4 4"
                    />
                  ))}
                  {chartStyle === "area" ? (
                    <>
                      <path d={areaPath} fill="url(#areaFill)" />
                      <path d={linePath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                    </>
                  ) : (
                    seriesPoints.map(([x, y], i) => (
                      <rect
                        key={i}
                        x={x - 12}
                        y={y}
                        width="24"
                        height={CHART_BOTTOM - y}
                        rx="5"
                        fill="#f59e0b"
                        fillOpacity="0.8"
                      />
                    ))
                  )}
                  {seriesPoints.map(([x, y], i) => (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="3.5"
                      fill={theme.chartDot}
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />
                  ))}
                  {chartData.labels.map((day, i) => (
                    <text
                      key={day}
                      x={CHART_LEFT + i * stepX}
                      y={CHART_H - 2}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="500"
                      className={theme.chartText}
                    >
                      {day}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t ${theme.border}`}>
              {breakdown.map((item) => (
                <div key={item.label} className={`${theme.bgStat} rounded-lg sm:rounded-xl p-2 sm:p-3`}>
                  <p className={`text-[9px] sm:text-[10px] ${theme.textMuted} mb-0.5`}>{item.label}</p>
                  <div className="flex items-center gap-1">
                    {item.up ? (
                      <FaArrowUp className="text-emerald-400 text-[8px]" />
                    ) : (
                      <FaArrowDown className="text-rose-400 text-[8px]" />
                    )}
                    <span className={`text-sm sm:text-base font-bold ${theme.textPrimary}`}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Requests + Users ────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Requests */}
            <div className={`${theme.bgCard} ${theme.borderCard} border rounded-xl sm:rounded-2xl p-3 sm:p-5`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className={`font-semibold text-sm ${theme.textPrimary}`}>Requests</h3>
                <Link to="/chat" className="text-[10px] sm:text-xs text-amber-500 hover:text-amber-600 font-medium">
                  Detail
                </Link>
              </div>

              <p className={`text-[10px] sm:text-xs ${theme.textMuted} mb-0.5`}>Total requests</p>
              <p className={`text-xl sm:text-2xl font-bold ${theme.textPrimary} flex items-center gap-2 mb-3 sm:mb-4`}>
                {totalRequestsCount}
                <FaArrowUp className="text-emerald-400 text-xs" />
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 flex-wrap">
                <svg viewBox="0 0 140 140" className="w-28 sm:w-32 h-28 sm:h-32 shrink-0">
                  {ringData.map((ring, i) => {
                    const radius = 58 - i * 12;
                    const circumference = 2 * Math.PI * radius;
                    const pct = totalRequestsCount > 0 ? ring.value / totalRequestsCount : 0;
                    const dash = Math.max(pct * circumference, pct > 0 ? 4 : 0);
                    return (
                      <g key={ring.label} transform="rotate(-90 70 70)">
                        <circle
                          cx="70"
                          cy="70"
                          r={radius}
                          fill="none"
                          stroke={theme.ringBg}
                          strokeWidth="8"
                        />
                        <circle
                          cx="70"
                          cy="70"
                          r={radius}
                          fill="none"
                          stroke={ring.color}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${dash} ${circumference}`}
                        />
                      </g>
                    );
                  })}
                </svg>
                <div className="space-y-1 sm:space-y-1.5">
                  {ringData.map((ring) => (
                    <div key={ring.label} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ring.color }} />
                      <span className={theme.textSecondary}>{ring.label}</span>
                      <span className={`font-medium ${theme.textPrimary}`}>{ring.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Users */}
            <div className={`${theme.bgCard} ${theme.borderCard} border rounded-xl sm:rounded-2xl p-3 sm:p-5 overflow-hidden`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold text-sm ${theme.textPrimary}`}>All Users</h3>
                <Link to="/chat" className="text-[10px] sm:text-xs text-amber-500 hover:text-amber-600 font-medium">
                  Detail
                </Link>
              </div>

              <div className="space-y-0.5">
                <div className={`grid grid-cols-[1fr_auto] text-[8px] sm:text-[10px] uppercase tracking-wide px-2 pb-1.5 border-b ${theme.border}`}>
                  <span className={theme.textMuted}>Customer</span>
                  <span className={theme.textMuted}>Status</span>
                </div>
                {allUsers.length === 0 ? (
                  <p className={`text-center text-sm py-8 ${theme.textMuted}`}>No users found</p>
                ) : (
                  allUsers.slice(0, 8).map((u) => (
                    <div key={u.id} className={`grid grid-cols-[1fr_auto] items-center px-2 py-1.5 rounded-lg ${theme.bgCardHover}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-[8px] sm:text-[10px] font-bold shrink-0 ${
                            u.online 
                              ? "bg-gradient-to-br from-emerald-500 to-teal-500" 
                              : "bg-gradient-to-br from-stone-600 to-stone-700"
                          }`}
                        >
                          {getUserInitial(u.full_name)}
                        </div>
                        <span className={`text-xs sm:text-sm truncate ${theme.textPrimary}`}>{u.full_name}</span>
                      </div>
                      <span
                        className={`text-[7px] sm:text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                          u.isApproved
                            ? theme.statusApproved
                            : u.hasPendingRequest
                            ? theme.statusPending
                            : u.hasIncomingRequest
                            ? theme.statusRequest
                            : theme.statusNew
                        }`}
                      >
                        {u.isApproved ? "Approved" : u.hasPendingRequest ? "Pending" : u.hasIncomingRequest ? "Request" : "New"}
                      </span>
                    </div>
                  ))
                )}
                {allUsers.length > 8 && (
                  <p className={`text-center text-[10px] ${theme.textMuted} py-2`}>
                    +{allUsers.length - 8} more users
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;