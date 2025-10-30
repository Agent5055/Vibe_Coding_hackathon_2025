import { useState, useEffect } from 'react';
import { toggleThemeMode, getThemeMode, getThemeIcon } from '../utils/themes.js';

const ThemeToggle = () => {
  const [currentMode, setCurrentMode] = useState('light');

  useEffect(() => {
    // Check for saved theme mode
    const savedMode = getThemeMode();
    setCurrentMode(savedMode);
    
    // Listen for theme mode changes from other components (e.g., settings panel)
    const handleThemeModeChange = (event) => {
      const mode = event.detail?.mode;
      if (mode) {
        setCurrentMode(mode);
      }
    };
    
    window.addEventListener('themeModeChange', handleThemeModeChange);
    
    return () => {
      window.removeEventListener('themeModeChange', handleThemeModeChange);
    };
  }, []);

  const handleToggle = () => {
    const newMode = toggleThemeMode();
    setCurrentMode(newMode);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('themeModeChange', { detail: { mode: newMode } }));
  };

  const iconData = getThemeIcon();

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-200"
      aria-label={`Switch to ${currentMode === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${currentMode === 'light' ? 'dark' : 'light'} mode`}
    >
      <svg className={iconData.className} fill={iconData.fill} viewBox={iconData.viewBox}>
        <path {...iconData.path} />
      </svg>
    </button>
  );
};

export default ThemeToggle;
