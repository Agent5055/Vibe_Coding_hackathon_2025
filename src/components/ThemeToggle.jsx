import { useState, useEffect } from 'react';
import { THEMES, getTheme, getNextTheme, applyTheme, getThemeIconData } from '../utils/themes.js';

const ThemeToggle = () => {
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);

  useEffect(() => {
    // Check for saved theme preference or default to first theme
    const savedTheme = localStorage.getItem('thoughtweaver_theme');
    const theme = savedTheme ? getTheme(savedTheme) : THEMES[0];
    
    setCurrentTheme(theme);
    applyTheme(theme.id);
    
    // Listen for theme changes from other components (e.g., settings panel)
    const handleThemeChange = (event) => {
      const themeId = event.detail?.themeId;
      if (themeId) {
        const theme = getTheme(themeId);
        setCurrentTheme(theme);
      }
    };
    
    window.addEventListener('themechange', handleThemeChange);
    
    return () => {
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);

  const cycleTheme = () => {
    const nextTheme = getNextTheme(currentTheme.id);
    setCurrentTheme(nextTheme);
    applyTheme(nextTheme.id);
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-200"
      aria-label={`Switch to ${currentTheme.name}`}
    >
      {(() => {
        const iconData = getThemeIconData(currentTheme);
        return (
          <svg className={iconData.className} fill={iconData.fill} viewBox={iconData.viewBox}>
            <path {...iconData.path} />
          </svg>
        );
      })()}
    </button>
  );
};

export default ThemeToggle;
