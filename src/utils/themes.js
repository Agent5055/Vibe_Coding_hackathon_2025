// Theme configuration for ThoughtWeaver
export const THEMES = [
  { 
    id: 'light', 
    name: 'Classic Light', 
    icon: 'sun', 
    color: 'orange',
    bgClass: 'bg-gray-50',
    cardClass: 'bg-white',
    textClass: 'text-gray-900',
    borderClass: 'border-gray-200'
  },
  { 
    id: 'sky', 
    name: 'Sky Blue', 
    icon: 'sun', 
    color: 'blue',
    bgClass: 'bg-blue-50',
    cardClass: 'bg-white',
    textClass: 'text-gray-900',
    borderClass: 'border-blue-200'
  },
  { 
    id: 'rose', 
    name: 'Rose Pink', 
    icon: 'sun', 
    color: 'pink',
    bgClass: 'bg-pink-50',
    cardClass: 'bg-white',
    textClass: 'text-gray-900',
    borderClass: 'border-pink-200'
  },
  { 
    id: 'dark', 
    name: 'Slate Dark', 
    icon: 'moon', 
    color: 'yellow',
    bgClass: 'bg-gray-900',
    cardClass: 'bg-gray-800',
    textClass: 'text-white',
    borderClass: 'border-gray-700'
  },
  { 
    id: 'purple', 
    name: 'Deep Purple', 
    icon: 'moon', 
    color: 'purple',
    bgClass: 'bg-purple-950',
    cardClass: 'bg-purple-900',
    textClass: 'text-purple-100',
    borderClass: 'border-purple-800'
  },
  { 
    id: 'pitch', 
    name: 'Pitch Black', 
    icon: 'moon', 
    color: 'orange',
    bgClass: 'bg-black',
    cardClass: 'bg-gray-900',
    textClass: 'text-white',
    borderClass: 'border-gray-800'
  }
];

// Get theme by ID
export const getTheme = (themeId) => {
  return THEMES.find(theme => theme.id === themeId) || THEMES[0];
};

// Get next theme in cycle
export const getNextTheme = (currentThemeId) => {
  const currentIndex = THEMES.findIndex(theme => theme.id === currentThemeId);
  const nextIndex = (currentIndex + 1) % THEMES.length;
  return THEMES[nextIndex];
};

// Apply theme classes to document
export const applyTheme = (themeId) => {
  const theme = getTheme(themeId);
  
  // Remove all theme classes
  document.documentElement.classList.remove(
    'theme-light', 'theme-sky', 'theme-rose', 
    'theme-dark', 'theme-purple', 'theme-pitch'
  );
  
  // Add current theme class
  document.documentElement.classList.add(`theme-${themeId}`);
  
  // Store in localStorage
  localStorage.setItem('thoughtweaver_theme', themeId);
};

// Get theme icon data
export const getThemeIconData = (theme) => {
  if (theme.icon === 'sun') {
    return {
      className: `w-5 h-5 text-${theme.color}-500`,
      fill: 'currentColor',
      viewBox: '0 0 20 20',
      path: {
        fillRule: 'evenodd',
        d: 'M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z'
      }
    };
  } else {
    return {
      className: `w-5 h-5 text-${theme.color}-500`,
      fill: 'currentColor',
      viewBox: '0 0 20 20',
      path: {
        d: 'M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z'
      }
    };
  }
};
