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
    id: 'midnight', 
    name: 'Midnight Blue', 
    icon: 'moon', 
    color: 'blue',
    bgClass: 'bg-blue-950',
    cardClass: 'bg-blue-900',
    textClass: 'text-blue-100',
    borderClass: 'border-blue-800'
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

// Get custom themes from localStorage
export const getCustomThemes = () => {
  try {
    const customThemesStr = localStorage.getItem('thoughtweaver_custom_themes');
    return customThemesStr ? JSON.parse(customThemesStr) : [];
  } catch (error) {
    console.error('Error loading custom themes:', error);
    return [];
  }
};

// Get all themes (default + custom)
export const getAllThemes = () => {
  return [...THEMES, ...getCustomThemes()];
};

// Get theme by ID (searches both default and custom)
export const getTheme = (themeId) => {
  const allThemes = getAllThemes();
  return allThemes.find(theme => theme.id === themeId) || THEMES[0];
};

// Get next theme in cycle (includes custom themes)
export const getNextTheme = (currentThemeId) => {
  const allThemes = getAllThemes();
  const currentIndex = allThemes.findIndex(theme => theme.id === currentThemeId);
  const nextIndex = (currentIndex + 1) % allThemes.length;
  return allThemes[nextIndex];
};

// Apply theme classes to document
export const applyTheme = (themeId) => {
  const theme = getTheme(themeId);
  
  // Remove all existing theme classes
  const allThemes = getAllThemes();
  allThemes.forEach(t => {
    document.documentElement.classList.remove(`theme-${t.id}`);
  });
  
  // Add current theme class
  document.documentElement.classList.add(`theme-${themeId}`);
  
  // Apply custom CSS variables if theme has them
  if (theme.cssVariables) {
    Object.entries(theme.cssVariables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }
  
  // Store in localStorage
  localStorage.setItem('thoughtweaver_theme', themeId);
};

// Delete a custom theme
export const deleteCustomTheme = (themeId) => {
  try {
    const customThemes = getCustomThemes();
    const filtered = customThemes.filter(t => t.id !== themeId);
    localStorage.setItem('thoughtweaver_custom_themes', JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting custom theme:', error);
    return false;
  }
};

// Get theme icon data
export const getThemeIconData = (theme) => {
  // Map theme colors to explicit Tailwind classes
  const colorClassMap = {
    'orange': 'w-5 h-5 text-orange-500',
    'blue': 'w-5 h-5 text-blue-500',
    'pink': 'w-5 h-5 text-pink-500',
    'yellow': 'w-5 h-5 text-yellow-500',
    'purple': 'w-5 h-5 text-purple-500'
  };
  
  const className = colorClassMap[theme.color] || 'w-5 h-5 text-gray-500';
  
  if (theme.icon === 'sun') {
    return {
      className,
      fill: 'currentColor',
      viewBox: '0 0 20 20',
      path: {
        fillRule: 'evenodd',
        d: 'M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z'
      }
    };
  } else {
    return {
      className,
      fill: 'currentColor',
      viewBox: '0 0 20 20',
      path: {
        d: 'M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z'
      }
    };
  }
};

// Export theme configuration as JSON
export const exportThemeConfig = (theme) => {
  return JSON.stringify(theme, null, 2);
};

// Import and validate theme configuration
export const importThemeConfig = (jsonString) => {
  try {
    const theme = JSON.parse(jsonString);
    return validateThemeConfig(theme) ? theme : null;
  } catch (error) {
    console.error('Error parsing theme config:', error);
    return null;
  }
};

// Validate theme configuration structure
export const validateThemeConfig = (theme) => {
  if (!theme || typeof theme !== 'object') return false;
  
  const requiredFields = ['id', 'name', 'icon', 'color', 'bgClass', 'cardClass', 'textClass', 'borderClass'];
  
  for (const field of requiredFields) {
    if (!(field in theme)) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }
  
  // Validate icon type
  if (!['sun', 'moon'].includes(theme.icon)) {
    console.error('Invalid icon type. Must be "sun" or "moon"');
    return false;
  }
  
  return true;
};
