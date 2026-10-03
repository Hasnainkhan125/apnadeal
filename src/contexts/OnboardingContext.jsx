// src/contexts/OnboardingContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  fetchOnboardingConfig,
  hasUserSeenOnboarding,
  markUserSeenOnboarding,
  DEFAULT_CONFIG,
} from "../lib/onboarding";
import { useAuth } from "./AuthContext";

const OnboardingContext = createContext(null);

export const OnboardingProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [showModal, setShowModal] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [userStatusLoaded, setUserStatusLoaded] = useState(false);
  const [userHasSeen, setUserHasSeen] = useState(false);
  const [forceMode, setForceMode] = useState(false);

  // Timer ref so we can clear pending timers on re-run
  const showTimerRef = useRef(null);

  // ─── Load config ───
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = await fetchOnboardingConfig();
      if (cancelled) return;
      setConfig(c);
      setConfigLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Check if this user has already seen onboarding ───
  useEffect(() => {
    let cancelled = false;

    // Wait for auth to finish loading
    if (authLoading) {
      setUserStatusLoaded(false);
      return;
    }

    // No user → not signed in
    if (!user?.id) {
      setUserHasSeen(false);
      setUserStatusLoaded(true);
      return;
    }

    setUserStatusLoaded(false);
    (async () => {
      const seen = await hasUserSeenOnboarding(user.id);
      if (cancelled) return;
      setUserHasSeen(seen);
      setUserStatusLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading]);

  // ─── Decide whether to auto-show ───
  useEffect(() => {
    // Clear any pending timer from a previous run
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    // Wait until both config and user status are loaded
    if (!configLoaded || !userStatusLoaded) return;

    if (!config?.enabled) {
      setShowModal(false);
      setForceMode(false);
      return;
    }

    // Read local marker (dismissed version)
    const seenVersion = Number(
      localStorage.getItem("apna.onboarding.version") || "0"
    );
    const currentVersion = Number(config.version || 1);
    const versionBumped = seenVersion < currentVersion;

    const isNewUser = !userHasSeen;
    const shouldShow = isNewUser || versionBumped;

    if (!shouldShow) {
      setShowModal(false);
      setForceMode(false);
      return;
    }

    // forceMode = true only when the user has ALREADY seen it once,
    // but the admin bumped the version → skip the wizard on this pass.
    setForceMode(!isNewUser && versionBumped);

    const delay = Math.max(0, Number(config.auto_show_delay) || 3000);
    showTimerRef.current = setTimeout(() => {
      setShowModal(true);
      showTimerRef.current = null;
    }, delay);

    return () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
    };
  }, [configLoaded, userStatusLoaded, config, userHasSeen, user?.id]);

  // ─── Called when user clicks "I Understand" / finishes wizard ───
  const acknowledge = useCallback(async () => {
    try {
      localStorage.setItem(
        "apna.onboarding.version",
        String(config.version || 1)
      );
    } catch {}

    if (user?.id) {
      await markUserSeenOnboarding(user.id, config.version || 1);
      setUserHasSeen(true);
    }

    setForceMode(false);
    setShowModal(false);
  }, [config.version, user?.id]);

  const refresh = useCallback(async () => {
    const c = await fetchOnboardingConfig();
    setConfig(c);
    return c;
  }, []);

  const openManually = useCallback(() => {
    // Preview mode (admin) → forceMode true so no wizard runs after
    setForceMode(true);
    setShowModal(true);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        config,
        showModal,
        acknowledge,
        refresh,
        openManually,
        setShowModal,
        userHasSeen,
        forceMode,
        // expose loading flags (optional)
        configLoaded,
        userStatusLoaded,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    return {
      config: DEFAULT_CONFIG,
      showModal: false,
      acknowledge: () => {},
      refresh: async () => DEFAULT_CONFIG,
      openManually: () => {},
      setShowModal: () => {},
      userHasSeen: false,
      forceMode: false,
      configLoaded: false,
      userStatusLoaded: false,
    };
  }
  return ctx;
};