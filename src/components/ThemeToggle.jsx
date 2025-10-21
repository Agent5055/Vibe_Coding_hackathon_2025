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
  }, []);

  const cycleTheme = () => {
    const nextTheme = getNextTheme(currentTheme.id);
    setCurrentTheme(nextTheme);
    applyTheme(nextTheme.id);
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-200 group"
      aria-label={`Switch to ${currentTheme.name}`}
      title={`Current: ${currentTheme.name} - Click to cycle themes`}
    >
      {(() => {
        const iconData = getThemeIconData(currentTheme);
        return (
          <svg className={iconData.className} fill={iconData.fill} viewBox={iconData.viewBox}>
            <path {...iconData.path} />
          </svg>
        );
      })()}
      
      {/* Theme name tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        {currentTheme.name}
      </div>
    </button>
  );
};

export default ThemeToggle;
