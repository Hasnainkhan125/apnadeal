// contexts/TimerContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TimerContext = createContext({});

export const useTimer = () => useContext(TimerContext);

export const TimerProvider = ({ children }) => {
  const { user, isPremium } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState(60); // 60 seconds = 1 minute
  const [isLocked, setIsLocked] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);

  // ─── Check if user is premium ──────────────────────────────────────
  const userIsPremium = isPremium();

  // ─── Load timer state from localStorage ────────────────────────────
  useEffect(() => {
    const savedTime = localStorage.getItem('timer_remaining');
    const savedLocked = localStorage.getItem('timer_locked');
    const savedStarted = localStorage.getItem('timer_started');
    const savedTimestamp = localStorage.getItem('timer_timestamp');

    if (savedStarted === 'true' && savedTimestamp) {
      const elapsed = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      
      if (remaining <= 0) {
        setIsLocked(true);
        setTimeRemaining(0);
        localStorage.setItem('timer_locked', 'true');
      } else {
        setTimeRemaining(remaining);
        setIsLocked(false);
        setTimerStarted(true);
      }
    } else if (savedLocked === 'true') {
      setIsLocked(true);
      setTimeRemaining(0);
    } else {
      setTimeRemaining(60);
      setIsLocked(false);
      setTimerStarted(false);
    }
  }, []);

  // ─── Timer countdown ─────────────────────────────────────────────────
  useEffect(() => {
    if (userIsPremium) {
      setIsLocked(false);
      setTimeRemaining(0);
      setTimerStarted(false);
      localStorage.removeItem('timer_remaining');
      localStorage.removeItem('timer_locked');
      localStorage.removeItem('timer_started');
      localStorage.removeItem('timer_timestamp');
      return;
    }

    if (!timerStarted || isLocked) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setIsLocked(true);
          setTimerStarted(false);
          localStorage.setItem('timer_locked', 'true');
          localStorage.removeItem('timer_timestamp');
          clearInterval(interval);
          return 0;
        }
        localStorage.setItem('timer_remaining', newTime.toString());
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStarted, isLocked, userIsPremium]);

  // ─── Start timer ──────────────────────────────────────────────────────
  const startTimer = () => {
    if (userIsPremium || isLocked) return;
    
    setTimerStarted(true);
    setTimeRemaining(60);
    setIsLocked(false);
    localStorage.setItem('timer_started', 'true');
    localStorage.setItem('timer_timestamp', Date.now().toString());
    localStorage.setItem('timer_remaining', '60');
    localStorage.removeItem('timer_locked');
  };

  // ─── Reset timer ──────────────────────────────────────────────────────
  const resetTimer = () => {
    setTimeRemaining(60);
    setIsLocked(false);
    setTimerStarted(false);
    localStorage.removeItem('timer_remaining');
    localStorage.removeItem('timer_locked');
    localStorage.removeItem('timer_started');
    localStorage.removeItem('timer_timestamp');
  };

  // ─── Format time as MM:SS ────────────────────────────────────────────
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const value = {
    timeRemaining,
    isLocked,
    timerStarted,
    userIsPremium,
    startTimer,
    resetTimer,
    formatTime,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};