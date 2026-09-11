// components/SidebarLayout.jsx - Modern Design (Whop-style + User Profile)
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  FaHome,
  FaChartBar,
  FaServicestack,
  FaGraduationCap,
  FaLayerGroup,
  FaCommentDots,
  FaCog,
  FaNewspaper,
  FaUsers,
  FaUserFriends,
  FaSignOutAlt,
  FaCrown,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
} from 'react-icons/fa';

const SidebarLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [userAvatar, setUserAvatar] = useState(null);
  const [userFullName, setUserFullName] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: FaChartBar, label: 'Analytics' },
    { path: '/Services', icon: FaServicestack, label: 'Services' },
    { path: '/quiz-generator', icon: FaGraduationCap, label: 'StudentHub' },
    { path: '/flashcards', icon: FaLayerGroup, label: 'Flashcards' },
    { path: '/chat', icon: FaCommentDots, label: 'Chat' },
    { path: '/study-posts', icon: FaNewspaper, label: 'Feed', badge: 'New' },
    { path: '/study-groups', icon: FaUsers, label: 'Study Groups' },
    { path: '/settings', icon: FaCog, label: 'Settings' },
  ];

  const publicPages = ['/', '/premium', '/signin', '/signup', '/reset-password'];
  const isPublicPage = publicPages.includes(location.pathname);

  // ─── Load user data (supports multiple avatar field names) ──────────
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          // Select * to be safe — works with any column name
          const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

          console.log('🔍 Sidebar: user_settings data →', data);
          console.log('🔍 Sidebar: error →', error);

          if (error) {
            console.log('Error loading user data:', error);
            return;
          }

          if (data) {
            // ✅ Try every possible field name for the avatar
            const avatarUrl =
              data.avatar_url ||
              data.avatar ||
              data.profile_picture ||
              data.profile_image ||
              data.profile_pic ||
              data.image ||
              data.image_url ||
              data.photo_url ||
              data.photo ||
              null;

            console.log('✅ Sidebar: resolved avatar URL →', avatarUrl);

            setUserAvatar(avatarUrl);
            setUserFullName(data.full_name || data.name || '');
          }
        } catch (e) {
          console.log('Error loading user data:', e);
        }
      }
    };
    loadUserData();
  }, [user]);

  // ─── Auth check ──────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    if (!user && !isPublicPage) {
      navigate('/signin', { state: { from: location.pathname } });
    }
  }, [user, loading, navigate, location.pathname, isPublicPage]);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-stone-950">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 dark:text-stone-500 text-sm mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !isPublicPage) return null;

  const getUserInitial = () => {
    if (userFullName) return userFullName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const getUserName = () => {
    return userFullName || user?.email?.split('@')[0] || 'User';
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/study-posts') return location.pathname === '/study-posts';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-stone-50 dark:bg-stone-950">
      {/* Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 sticky top-16 h-[calc(100vh-4rem)] transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* ─── LOGO HEADER ─── */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-4 border-b border-stone-200 dark:border-stone-800`}>
          <Link
            to={user ? '/dashboard' : '/'}
            className="flex items-center group flex-shrink-0"
          >
            <div className="h-9 w-9 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 shadow-md shadow-amber-500/20">
              <FaGraduationCap className="text-white text-[25px] sm:text-[26px]" />
            </div>
            {!collapsed && (
              <div className="ml-2.5">
                <span className="text-base sm:text-lg md:text-xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">AI</span>
                  <span className="text-stone-900 dark:text-white">Study</span>
                </span>
                <span className="block text-[8px] sm:text-[9px] md:text-[10px] font-medium text-stone-400 dark:text-stone-500 -mt-0.5 tracking-wider">
                  ASSISTANT
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* ─── USER PROFILE ─── */}
        <div className={`${collapsed ? 'px-2' : 'px-4'} py-3 border-b border-stone-200 dark:border-stone-800`}>
          {collapsed ? (
            // Collapsed: show only avatar centered
            <div className="flex justify-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden shadow-md shadow-amber-500/20">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={getUserName()}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      console.log('❌ Avatar image failed to load:', userAvatar);
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span
                  className="items-center justify-center w-full h-full"
                  style={{ display: userAvatar ? 'none' : 'flex' }}
                >
                  {getUserInitial()}
                </span>
              </div>
            </div>
          ) : (
            // Expanded: full profile row
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden shadow-md shadow-amber-500/20">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={getUserName()}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      console.log('❌ Avatar image failed to load:', userAvatar);
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span
                  className="items-center justify-center w-full h-full"
                  style={{ display: userAvatar ? 'none' : 'flex' }}
                >
                  {getUserInitial()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-900 dark:text-white truncate">
                  {getUserName()}
                </p>
                <p className="text-[10px] text-stone-400 dark:text-stone-400 truncate">
                  {user?.email || 'user@email.com'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ─── NAVIGATION ─── */}
        <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-3'} py-3 overflow-y-auto`}>
          {/* Section label */}
          {!collapsed && (
            <p className="px-3 pt-2 pb-2 text-[11px] uppercase tracking-wider font-bold text-stone-400 dark:text-stone-500">
              Main Menu
            </p>
          )}

          {/* Main nav items */}
          <div className="space-y-1">
            {navItems.slice(0, 8).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={`group flex items-center ${
                    collapsed ? 'justify-center' : 'gap-3 px-3.5'
                  } py-2.5 rounded-xl text-[15px] font-medium transition-all duration-200 relative ${
                    active
                      ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white'
                      : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Icon
                    className={`text-[18px] flex-shrink-0 transition-colors ${
                      active
                        ? 'text-stone-900 dark:text-white'
                        : 'text-stone-400 dark:text-stone-500 group-hover:text-stone-700 dark:group-hover:text-stone-200'
                    }`}
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-md font-bold uppercase">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Operations label */}
          {!collapsed && (
            <p className="px-3 pt-5 pb-2 text-[11px] uppercase tracking-wider font-bold text-stone-400 dark:text-stone-500">
              Operations
            </p>
          )}
          {collapsed && <div className="my-3 border-t border-stone-200 dark:border-stone-800" />}

          {/* Settings */}
          <div className="space-y-1 mt-1">
            {navItems.slice(8).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={`group flex items-center ${
                    collapsed ? 'justify-center' : 'gap-3 px-3.5'
                  } py-2.5 rounded-xl text-[15px] font-medium transition-all duration-200 ${
                    active
                      ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white'
                      : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <Icon
                    className={`text-[18px] flex-shrink-0 transition-colors ${
                      active
                        ? 'text-stone-900 dark:text-white'
                        : 'text-stone-400 dark:text-stone-500 group-hover:text-stone-700 dark:group-hover:text-stone-200'
                    }`}
                  />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ─── FOOTER ─── */}
        <div className={`${collapsed ? 'px-2' : 'px-3'} py-3 border-t border-stone-200 dark:border-stone-800`}>
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand' : 'Collapse'}
            className={`flex items-center ${
              collapsed ? 'justify-center' : 'gap-3 px-3.5'
            } py-2.5 w-full rounded-xl text-[14px] font-medium text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition-all duration-200`}
          >
            {collapsed ? (
              <FaChevronRight className="text-[13px]" />
            ) : (
              <>
                <FaChevronLeft className="text-[13px]" />
                <span>Collapse</span>
              </>
            )}
          </button>

          {/* Logout */}
          {user && (
            <button
              onClick={handleLogout}
              title={collapsed ? 'Logout' : undefined}
              className={`flex items-center ${
                collapsed ? 'justify-center' : 'gap-3 px-3.5'
              } py-2.5 w-full rounded-xl text-[14px] font-medium text-stone-600 dark:text-stone-300 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group`}
            >
              <FaSignOutAlt className="text-[16px] text-stone-400 dark:text-stone-500 group-hover:text-red-500 transition-colors flex-shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-[calc(100vh-4rem)] bg-white dark:bg-stone-950">
        {children}
      </main>
    </div>
  );
};

export default SidebarLayout;