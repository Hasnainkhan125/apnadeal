// contexts/ProfileContext.jsx — Real-time profile sync (v2)
// Provides { profile, loading, updateProfile, reload, broadcastRefresh, primaryGroup }
// to any component.
//
// ⭐ Priority chain (highest → lowest):
//    user_settings → users → profiles → auth.user_metadata → email prefix
//
// ⭐ Real-time: subscribes to user_settings changes for this user
// ⭐ Cross-tab: broadcastRefresh() triggers listeners in other tabs
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const ProfileContext = createContext(null);

const EMPTY_PROFILE = {
  fullName: "",
  avatar: null,
  email: "",
  phone: "",
  location: "",
  bio: "",
  statusMessage: "",
  occupation: "",
  username: "",
};

export const ProfileProvider = ({ children }) => {
  const { user } = useAuth();

  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [primaryGroup, setPrimaryGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prevent stale closures when user switches accounts quickly
  const requestIdRef = useRef(0);

  /* ──────────────────────────────────────────────────────────
     LOAD PROFILE — merges all three data sources
     ────────────────────────────────────────────────────────── */
  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(EMPTY_PROFILE);
      setPrimaryGroup(null);
      setLoading(false);
      return;
    }

    const reqId = ++requestIdRef.current;

    try {
      // ⭐ Fetch from all three tables in parallel
      const [usersRes, settingsRes, profilesRes] = await Promise.all([
        supabase
          .from("users")
          .select("id, name, full_name, username, email, avatar_url")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("user_settings")
          .select(
            "user_id, full_name, avatar, avatar_url, email, phone, location, bio, status_message, occupation"
          )
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("id, email, full_name, avatar_url, city")
          .eq("id", user.id)
          .maybeSingle(),
      ]);

      // Ignore stale responses (user switched accounts mid-request)
      if (reqId !== requestIdRef.current) return;

      if (usersRes.error && usersRes.error.code !== "PGRST116") {
        console.warn("users fetch warn:", usersRes.error.message);
      }
      if (settingsRes.error && settingsRes.error.code !== "PGRST116") {
        console.warn("user_settings fetch warn:", settingsRes.error.message);
      }
      if (profilesRes.error && profilesRes.error.code !== "PGRST116") {
        console.warn("profiles fetch warn:", profilesRes.error.message);
      }

      const u = usersRes.data || {};
      const s = settingsRes.data || {};
      const p = profilesRes.data || {};
      const meta = user?.user_metadata || {};

      const mergedProfile = {
        // ⭐ Name priority — user_settings wins, email prefix is the final fallback
        fullName:
          s.full_name ||
          u.full_name ||
          u.name ||
          u.username ||
          p.full_name ||
          meta.full_name ||
          meta.name ||
          (user.email ? user.email.split("@")[0] : "") ||
          "User",

        // ⭐ Avatar priority — user_settings.avatar wins
        avatar:
          s.avatar ||
          s.avatar_url ||
          u.avatar_url ||
          p.avatar_url ||
          meta.avatar_url ||
          meta.avatar ||
          meta.picture ||
          null,

        email: s.email || u.email || p.email || user.email || "",
        phone: s.phone || "",
        location: s.location || p.city || "",
        bio: s.bio || "",
        statusMessage: s.status_message || "",
        occupation: s.occupation || "",
        username: u.username || "",
      };

      setProfile(mergedProfile);

      /* ⭐ Load primary group for brand-style identity (optional use by Chat) */
      const { data: memberships } = await supabase
        .from("study_group_members")
        .select("group_id, role")
        .eq("user_id", user.id);

      if (reqId !== requestIdRef.current) return;

      if (memberships && memberships.length > 0) {
        const groupIds = memberships.map((m) => m.group_id);
        const { data: groups } = await supabase
          .from("study_groups")
          .select("id, name, image_url")
          .in("id", groupIds);

        if (reqId !== requestIdRef.current) return;

        if (groups && groups.length > 0) {
          const roleMap = {};
          memberships.forEach((m) => {
            roleMap[m.group_id] = m.role;
          });
          const enriched = groups.map((g) => ({
            ...g,
            role: roleMap[g.id] || "member",
          }));
          const primary =
            enriched.find((g) => g.role === "admin") || enriched[0];
          setPrimaryGroup(primary);
        } else {
          setPrimaryGroup(null);
        }
      } else {
        setPrimaryGroup(null);
      }
    } catch (err) {
      console.error("ProfileContext load exception:", err);
    } finally {
      if (reqId === requestIdRef.current) setLoading(false);
    }
  }, [user]);

  /* ──────────────────────────────────────────────────────────
     INITIAL LOAD
     ────────────────────────────────────────────────────────── */
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /* ──────────────────────────────────────────────────────────
     REAL-TIME: user_settings changes for THIS user
     ────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`profile-sync-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_settings",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new || payload.old;
          if (!row) return;

          console.log("🔔 user_settings updated → refreshing profile");
          // ⭐ Full reload so users/profiles fallbacks stay consistent
          loadProfile();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${user.id}`,
        },
        () => {
          console.log("🔔 users table updated → refreshing profile");
          loadProfile();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        () => {
          console.log("🔔 profiles table updated → refreshing profile");
          loadProfile();
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("Profile realtime channel error — using polling fallback");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadProfile]);

  /* ──────────────────────────────────────────────────────────
     CROSS-TAB SYNC — another tab writes to localStorage, we reload
     ────────────────────────────────────────────────────────── */
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "profile:refresh") {
        loadProfile();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [loadProfile]);

  /* ──────────────────────────────────────────────────────────
     PUBLIC HELPERS
     ────────────────────────────────────────────────────────── */

  /**
   * Optimistic local update — useful immediately after a save
   * in the same component without waiting for the realtime round-trip.
   */
  const updateProfile = useCallback((partial) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  }, []);

  /**
   * Broadcast a refresh signal to all tabs + reload locally.
   * Call this from Settings after successfully writing to the DB.
   */
  const broadcastRefresh = useCallback(() => {
    try {
      localStorage.setItem("profile:refresh", String(Date.now()));
    } catch {}
    loadProfile();
  }, [loadProfile]);

  /* ──────────────────────────────────────────────────────────
     VALUE
     ────────────────────────────────────────────────────────── */
  const value = useMemo(
    () => ({
      profile,
      primaryGroup,
      loading,
      updateProfile,
      reload: loadProfile,
      broadcastRefresh,
    }),
    [profile, primaryGroup, loading, updateProfile, loadProfile, broadcastRefresh]
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside <ProfileProvider>");
  return ctx;
};