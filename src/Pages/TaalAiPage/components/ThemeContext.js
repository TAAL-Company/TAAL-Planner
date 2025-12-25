import React, { createContext, useContext, useState, useEffect } from 'react';

// Define theme colors for light and dark modes
export const themes = {
  dark: {
    mode: 'dark',
    background: '#1e1e1e',
    backgroundSecondary: '#2b2b2b',
    backgroundTertiary: '#3a3a3a',
    text: '#ffffff',
    textSecondary: '#cccccc',
    textMuted: 'gray',
    border: '#4a4a4a',
    borderHover: '#6a6a6a',
    primary: '#4a9eff',
    primaryHover: '#3a8eef',
    accent: '#ff6b35',
    codeBackground: '#1a1a1a',
    shadow: 'rgba(0,0,0,0.3)',
    inputBackground: '#2b2b2b',
    chipBackground: '#3a3a3a',
    userMessage: '#4a9eff',
    assistantMessage: '#3a3a3a',
  },
  light: {
    mode: 'light',
    background: '#f5f5f5',
    backgroundSecondary: '#ffffff',
    backgroundTertiary: '#e8e8e8',
    text: '#1a1a1a',
    textSecondary: '#444444',
    textMuted: '#888888',
    border: '#d0d0d0',
    borderHover: '#b0b0b0',
    primary: '#1976d2',
    primaryHover: '#1565c0',
    accent: '#e65100',
    codeBackground: '#f0f0f0',
    shadow: 'rgba(0,0,0,0.1)',
    inputBackground: '#ffffff',
    chipBackground: '#e0e0e0',
    userMessage: '#1976d2',
    assistantMessage: '#e8e8e8',
  }
};

const ThemeContext = createContext();

export function TaalAiThemeProvider({ children }) {
  // Check for saved preference or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('taalAiTheme');
    if (saved !== null) {
      return saved === 'dark';
    }
    // Default to dark mode (current behavior)
    return true;
  });

  const theme = isDarkMode ? themes.dark : themes.light;

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Save preference to localStorage
  useEffect(() => {
    localStorage.setItem('taalAiTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTaalAiTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTaalAiTheme must be used within a TaalAiThemeProvider');
  }
  return context;
}
