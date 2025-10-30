import { useState, useEffect } from 'react';
import { toggleThemeMode, getThemeMode } from '../utils/themes.js';

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

  // Get icon based on current mode - recalculates when currentMode changes
  const iconData = currentMode === 'light' 
    ? {
        className: 'w-5 h-5 text-yellow-500',
        fill: 'currentColor',
        viewBox: '0 0 20 20',
        path: {
          fillRule: 'evenodd',
          d: 'M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z'
        }
      }
    : {
        className: 'w-5 h-5 text-blue-300',
        fill: 'currentColor',
        viewBox: '0 0 20 20',
        path: {
          d: 'M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z'
        }
      };

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
