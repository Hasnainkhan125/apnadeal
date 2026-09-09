// components/SidebarLayout.jsx - Modern Design (No Premium Restrictions)
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
} from 'react-icons/fa';

const SidebarLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [userAvatar, setUserAvatar] = useState(null);
  const [userFullName, setUserFullName] = useState('');

  const navItems = [
    { path: '/', icon: FaHome, label: 'Home' },
    { path: '/dashboard', icon: FaChartBar, label: 'Dashboard' },
    { path: '/Services', icon: FaServicestack, label: 'Services' },
    { path: '/quiz-generator', icon: FaGraduationCap, label: 'StudentHub' },
    { path: '/flashcards', icon: FaLayerGroup, label: 'Flashcards' },
    { path: '/chat', icon: FaCommentDots, label: 'Chat' },
    { path: '/study-posts', icon: FaNewspaper, label: 'Feed' },
    { path: '/study-groups', icon: FaUsers, label: 'Study Groups' },
    { path: '/settings', icon: FaCog, label: 'Settings' },
  ];

  // ─── Pages that are public (no login required) ──────────────────────
  const publicPages = ['/', '/premium', '/signin', '/signup', '/reset-password'];

  const isPublicPage = publicPages.includes(location.pathname);

  // ─── Load user data ──────────────────────────────────────────────────
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const { data } = await supabase
            .from('user_settings')
            .select('avatar, full_name')
            .eq('user_id', user.id)
            .single();
          
          if (data) {
            setUserAvatar(data.avatar);
            setUserFullName(data.full_name);
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
      return;
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

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-stone-50 dark:bg-stone-950">
      {/* Sidebar - Fixed position */}
      <aside className="hidden md:flex md:w-64 flex-shrink-0 flex-col bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        {/* User Profile */}
        <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden shadow-md shadow-amber-500/20">
              {userAvatar ? (
                <img src={userAvatar} alt={getUserName()} className="h-full w-full object-cover" />
              ) : (
                getUserInitial()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-900 dark:text-white truncate">
                {getUserName()}
              </p>
              <p className="text-[10px] text-stone-400 dark:text-stone-400 truncate">
                {user?.email || 'user@email.com'}
              </p>
              {/* Premium badge removed - everyone has access */}
            </div>
          </div>
        </div>

        {/* Navigation - All items accessible */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                           (item.path !== '/' && item.path !== '/study-posts' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                <Icon className={`text-base flex-shrink-0 ${isActive ? 'text-stone-900 dark:text-white' : 'text-stone-400 dark:text-stone-500'}`} />
                <span className="flex-1">{item.label}</span>
                {item.path === '/study-posts' && (
                  <span className="text-[8px] bg-rose-100 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 px-1.5 py-0.5 rounded-full font-medium">New</span>
                )}
                {isActive && (
                  <span className="w-0.5 h-6 rounded-full bg-stone-900 dark:bg-white" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="px-4 py-3 border-t border-stone-200 dark:border-stone-800 space-y-2 mt-auto">
          {/* Premium Upgrade - Removed, all features free */}

          {/* Logout Button */}
          {user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
            >
              <FaSignOutAlt className="text-base text-stone-400 dark:text-stone-500 group-hover:text-red-500 transition-colors" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content - Always takes remaining space */}
      <main className="flex-1 min-h-[calc(100vh-4rem)] bg-white dark:bg-stone-950">
        {children}
      </main>
    </div>
  );
};

export default SidebarLayout;