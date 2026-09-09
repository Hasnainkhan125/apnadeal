import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext({});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  // ─── Load settings from localStorage ──────────────────────────────
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('appearanceSettings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return {
      theme: 'light',
      fontSize: 'medium',
      compactMode: false,
      animations: true,
      accentColor: 'amber',
      sidebarStyle: 'modern'
    };
  };

  const [appearance, setAppearance] = useState(loadSettings);

  // ─── Save to localStorage ──────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem('appearanceSettings', JSON.stringify(appearance));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [appearance]);

  // ─── Apply settings to document ────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply accent color
    root.setAttribute('data-accent', appearance.accentColor);
    
    // Apply font size
    root.setAttribute('data-font-size', appearance.fontSize);
    
    // Apply theme
    if (appearance.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (appearance.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      // System theme
      root.classList.remove('light');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
    
    // Compact mode
    if (appearance.compactMode) {
      root.classList.add('compact');
    } else {
      root.classList.remove('compact');
    }
    
    // Animations
    if (!appearance.animations) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [appearance]);

  // ─── Listen for system theme changes ──────────────────────────────
  useEffect(() => {
    if (appearance.theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Re-apply system theme
      const root = document.documentElement;
      if (mediaQuery.matches) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [appearance.theme]);

  const updateAppearance = (newSettings) => {
    setAppearance(prev => ({ ...prev, ...newSettings }));
  };

  const resetAppearance = () => {
    setAppearance({
      theme: 'light',
      fontSize: 'medium',
      compactMode: false,
      animations: true,
      accentColor: 'amber',
      sidebarStyle: 'modern'
    });
  };

  return (
    <SettingsContext.Provider value={{ appearance, updateAppearance, resetAppearance }}>
      {children}
    </SettingsContext.Provider>
  );
};