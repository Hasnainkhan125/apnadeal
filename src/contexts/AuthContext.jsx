// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [passkeys, setPasskeys] = useState([]);

  // ─── Check if Passkey is Supported ─────────────────────────────────
  const isPasskeySupported = () => {
    return window.PublicKeyCredential !== undefined;
  };

  // ─── Load Passkeys ─────────────────────────────────────────────────
  const loadPasskeys = async () => {
    try {
      const { data, error } = await supabase.auth.passkey.list();
      if (error) {
        console.error('Error loading passkeys:', error);
        return;
      }
      setPasskeys(data || []);
    } catch (error) {
      console.error('Error loading passkeys:', error);
    }
  };

  // ─── Register Passkey ──────────────────────────────────────────────
  const registerPasskey = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { data: null, error: 'Please sign in first before registering a passkey.' };
      }

      const { data, error } = await supabase.auth.registerPasskey();
      
      if (error) {
        if (error.message.includes('already registered')) {
          return { data: null, error: 'A passkey is already registered for this device.' };
        }
        if (error.message.includes('not supported')) {
          return { data: null, error: 'Passkeys are not supported on this device or browser.' };
        }
        return { data: null, error: error.message };
      }
      
      await loadPasskeys();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to register passkey. Please try again.' };
    }
  };

  // ─── Sign In with Passkey ──────────────────────────────────────────
  const signInWithPasskey = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPasskey();
      
      if (error) {
        if (error.message.includes('not supported')) {
          return { data: null, error: 'Passkeys are not supported on this device or browser.' };
        }
        if (error.message.includes('cancelled')) {
          return { data: null, error: 'Passkey authentication was cancelled.' };
        }
        return { data: null, error: error.message };
      }
      
      if (data?.user) {
        await ensureUserExists(data.user);
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Failed to sign in with passkey. Please try again.' };
    }
  };

  // ─── Delete Passkey ─────────────────────────────────────────────────
  const deletePasskey = async (passkeyId) => {
    try {
      const { error } = await supabase.auth.passkey.delete({ passkeyId });
      
      if (error) {
        return { error: error.message };
      }
      
      await loadPasskeys();
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  // ─── Fetch User from Database ──────────────────────────────────────
  const fetchUserFromDB = async (userId) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching user from DB:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Error in fetchUserFromDB:', error);
      return null;
    }
  };

  // ─── Ensure User Exists in Public Tables ───────────────────────────
  const ensureUserExists = async (authUser) => {
    if (!authUser) return null;

    try {
      console.log('🔍 Checking if user exists in public.users:', authUser.id);

      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error fetching user:', fetchError);
        return null;
      }

      if (existingUser) {
        console.log('✅ User found in public.users:', existingUser.id);
        setUser(existingUser);
        return existingUser;
      }

      console.log('🔄 Creating user in public.users...');

      const userName = authUser.user_metadata?.full_name || 
                       authUser.user_metadata?.name || 
                       authUser.email?.split('@')[0] || 
                       'User';

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          name: userName,
          email: authUser.email,
          avatar_url: authUser.user_metadata?.avatar_url || null,
          is_premium: false,
          premium_since: null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating user:', insertError);
        return null;
      }

      console.log('✅ User created in public.users:', newUser.id);

      // Create user_settings
      await supabase
        .from('user_settings')
        .insert({
          user_id: newUser.id,
          full_name: userName,
          email: authUser.email,
          phone: null,
          bio: null,
          location: null,
          website: null,
          avatar: authUser.user_metadata?.avatar_url || null,
        });

      // Create user_status
      await supabase
        .from('user_status')
        .insert({
          user_id: newUser.id,
          status: 'online',
        });

      setUser(newUser);
      return newUser;

    } catch (error) {
      console.error('❌ Unexpected error in ensureUserExists:', error);
      return null;
    }
  };

  // ─── Initialize Auth ─────────────────────────────────────────────────
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      setAuthError(null);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session?.user) {
          const dbUser = await ensureUserExists(session.user);
          if (dbUser) {
            setUser(dbUser);
          } else {
            setUser(session.user);
          }
          await loadPasskeys();
        } else {
          setUser(null);
          setPasskeys([]);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        setAuthError(error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        setSession(session);

        if (session?.user) {
          const dbUser = await ensureUserExists(session.user);
          if (dbUser) {
            setUser(dbUser);
          } else {
            setUser(session.user);
          }
          await loadPasskeys();
        } else {
          setUser(null);
          setPasskeys([]);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ─── Sign In ──────────────────────────────────────────────────────────
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { data: null, error: 'Invalid email or password' };
        }
        if (error.message.includes('Email not confirmed')) {
          return { data: null, error: 'Please confirm your email address' };
        }
        return { data: null, error: error.message };
      }

      if (data?.user) {
        await ensureUserExists(data.user);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Network error. Please try again.' };
    }
  };

  // ─── Sign Up ──────────────────────────────────────────────────────────
  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          return { data: null, error: 'This email is already registered' };
        }
        return { data: null, error: error.message };
      }

      if (data?.user) {
        await ensureUserExists(data.user);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Network error. Please try again.' };
    }
  };

  // ─── Sign In with Google ─────────────────────────────────────────────
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Network error. Please try again.' };
    }
  };

  // ─── Sign In with GitHub ─────────────────────────────────────────────
  const signInWithGitHub = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Network error. Please try again.' };
    }
  };

  // ─── Sign Out ──────────────────────────────────────────────────────────
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      setUser(null);
      setSession(null);
      setPasskeys([]);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  // ─── Reset Password ──────────────────────────────────────────────────
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/update`,
      });

      if (error) {
        if (error.message.includes('User not found')) {
          return { data: null, error: 'No account found with this email address' };
        }
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Network error. Please try again.' };
    }
  };

  // ─── Update Password ──────────────────────────────────────────────────
  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: 'Network error. Please try again.' };
    }
  };

  // ─── Get Current User ────────────────────────────────────────────────
  const getUser = () => {
    return user;
  };

  // ─── Check if User is Authenticated ──────────────────────────────────
  const isAuthenticated = () => {
    return !!user;
  };

  // ─── Check if User is Premium ──────────────────────────────────────
  const isPremium = () => {
    return user?.is_premium === true;
  };

  // ─── UPGRADE TO PREMIUM ─────────────────────────────────────────────
  const upgradeToPremium = async () => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      console.log('🔄 Upgrading user to premium:', user.id);

      // Update in database
      const { data, error } = await supabase
        .from('users')
        .update({
          is_premium: true,
          premium_since: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error upgrading to premium:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Premium activated in database:', data);

      // ✅ IMPORTANT: Update local user state with fresh data from database
      setUser(data);

      // Also update settings if needed
      await supabase
        .from('user_settings')
        .update({
          is_premium: true,
        })
        .eq('user_id', user.id);

      console.log('✅ Premium activated for user:', user.id);
      return { success: true, data };

    } catch (error) {
      console.error('❌ Error in upgradeToPremium:', error);
      return { success: false, error: error.message };
    }
  };

  // ─── UPGRADE WITH CODE ──────────────────────────────────────────────
  const upgradeWithCode = async (code) => {
    // Check if code is valid
    if (code === '12345') {
      return await upgradeToPremium();
    } else {
      return { success: false, error: 'Invalid upgrade code. Please use the correct code.' };
    }
  };

  // ─── REFRESH USER DATA ──────────────────────────────────────────────
  const refreshUser = async () => {
    if (!user) return null;
    
    try {
      console.log('🔄 Refreshing user data...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Error refreshing user:', error);
        return null;
      }

      console.log('✅ User data refreshed:', data);
      setUser(data);
      return data;
    } catch (error) {
      console.error('❌ Error in refreshUser:', error);
      return null;
    }
  };

  // ─── Get User Settings ───────────────────────────────────────────────
  const getUserSettings = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserSettings:', error);
      return null;
    }
  };

  const value = {
    user,
    session,
    loading,
    authError,
    passkeys,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    signInWithGitHub,
    signInWithPasskey,
    registerPasskey,
    deletePasskey,
    loadPasskeys,
    resetPassword,
    updatePassword,
    getUser,
    isAuthenticated,
    isPasskeySupported,
    getUserSettings,
    ensureUserExists,
    supabase,
    // ✅ PREMIUM FUNCTIONS
    isPremium,
    upgradeToPremium,
    upgradeWithCode,
    refreshUser, // ✅ NEW: Refresh user data
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};