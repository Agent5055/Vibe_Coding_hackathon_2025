// Theme configuration for ThoughtWeaver
// Each theme has both light and dark variants following the pattern: baseThemeName-light and baseThemeName-dark

export const THEME_BASES = [
  {
    id: 'classic',
    name: 'Classic',
    color: 'gray'
  },
  {
    id: 'sky',
    name: 'Sky Blue',
    color: 'blue'
  },
  {
    id: 'rose',
    name: 'Rose Pink',
    color: 'pink'
  }
];

// Get custom theme bases from localStorage
export const getCustomThemeBases = () => {
  try {
    const customThemesStr = localStorage.getItem('thoughtweaver_custom_themes');
    if (!customThemesStr) return [];
    
    const customThemes = JSON.parse(customThemesStr);
    // Group by base name (remove -light or -dark suffix)
    const bases = {};
    customThemes.forEach(theme => {
      const baseId = theme.id.replace(/-light$|-dark$/, '');
      if (!bases[baseId]) {
        bases[baseId] = {
          id: baseId,
          name: theme.name.replace(/ Light$| Dark$/, ''),
          color: theme.color || 'gray'
        };
      }
    });
    return Object.values(bases);
  } catch (error) {
    console.error('Error loading custom themes:', error);
    return [];
  }
};

// Get all theme bases (default + custom)
export const getAllThemeBases = () => {
  return [...THEME_BASES, ...getCustomThemeBases()];
};

// Get theme mode from localStorage (light or dark)
export const getThemeMode = () => {
  return localStorage.getItem('thoughtweaver_theme_mode') || 'light';
};

// Get current theme base from localStorage
export const getCurrentThemeBase = () => {
  return localStorage.getItem('thoughtweaver_theme_base') || 'classic';
};

// Toggle between light and dark mode
export const toggleThemeMode = () => {
  const currentMode = getThemeMode();
  const newMode = currentMode === 'light' ? 'dark' : 'light';
  localStorage.setItem('thoughtweaver_theme_mode', newMode);
  
  const currentBase = getCurrentThemeBase();
  applyTheme(currentBase, newMode);
  
  return newMode;
};

// Apply theme classes to document
export const applyTheme = (baseThemeId, mode) => {
  const themeId = `${baseThemeId}-${mode}`;
  
  // Remove all existing theme classes
  document.documentElement.className = document.documentElement.className
    .split(' ')
    .filter(cls => !cls.startsWith('theme-'))
    .join(' ');
  
  // Add current theme class
  document.documentElement.classList.add(`theme-${themeId}`);
  
  // Store in localStorage
  localStorage.setItem('thoughtweaver_theme_base', baseThemeId);
  localStorage.setItem('thoughtweaver_theme_mode', mode);
  localStorage.setItem('thoughtweaver_theme', themeId); // For backward compatibility
};

// Change theme base (keeps current light/dark mode)
export const changeThemeBase = (baseThemeId) => {
  const currentMode = getThemeMode();
  applyTheme(baseThemeId, currentMode);
};

// Delete a custom theme (both light and dark variants)
export const deleteCustomTheme = (baseThemeId) => {
  try {
    const customThemesStr = localStorage.getItem('thoughtweaver_custom_themes');
    if (!customThemesStr) return true;
    
    const customThemes = JSON.parse(customThemesStr);
    const filtered = customThemes.filter(t => {
      const base = t.id.replace(/-light$|-dark$/, '');
      return base !== baseThemeId;
    });
    
    localStorage.setItem('thoughtweaver_custom_themes', JSON.stringify(filtered));
    
    // Failsafe: If deleting currently active theme, switch to first default theme
    const currentBase = getCurrentThemeBase();
    if (currentBase === baseThemeId) {
      const currentMode = getThemeMode();
      applyTheme('classic', currentMode);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting custom theme:', error);
    return false;
  }
};

// Get theme icon (sun for light mode, moon for dark mode)
export const getThemeIcon = () => {
  const mode = getThemeMode();
  
  if (mode === 'light') {
    return {
      className: 'w-5 h-5 text-yellow-500',
      fill: 'currentColor',
      viewBox: '0 0 20 20',
      path: {
        fillRule: 'evenodd',
        d: 'M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z'
      }
    };
  } else {
    return {
      className: 'w-5 h-5 text-blue-300',
      fill: 'currentColor',
      viewBox: '0 0 20 20',
      path: {
        d: 'M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z'
      }
    };
  }
};

// Export theme configuration as JSON (both light and dark variants)
export const exportThemeConfig = (baseThemeId) => {
  const customThemesStr = localStorage.getItem('thoughtweaver_custom_themes');
  if (!customThemesStr) return null;
  
  const customThemes = JSON.parse(customThemesStr);
  const themeVariants = customThemes.filter(t => {
    const base = t.id.replace(/-light$|-dark$/, '');
    return base === baseThemeId;
  });
  
  return JSON.stringify(themeVariants, null, 2);
};

// Import and validate theme configuration
export const importThemeConfig = (jsonString) => {
  try {
    const themes = JSON.parse(jsonString);
    if (!Array.isArray(themes)) {
      return validateThemeConfig(themes) ? [themes] : null;
    }
    
    // Validate all theme variants
    for (const theme of themes) {
      if (!validateThemeConfig(theme)) {
        return null;
      }
    }
    
    return themes;
  } catch (error) {
    console.error('Error parsing theme config:', error);
    return null;
  }
};

// Validate theme configuration structure
export const validateThemeConfig = (theme) => {
  if (!theme || typeof theme !== 'object') return false;
  
  const requiredFields = ['id', 'name'];
  
  for (const field of requiredFields) {
    if (!(field in theme)) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }
  
  // Validate ID ends with -light or -dark
  if (!theme.id.endsWith('-light') && !theme.id.endsWith('-dark')) {
    console.error('Theme ID must end with -light or -dark');
    return false;
  }
  
  return true;
};

// For backward compatibility - get theme by old ID format
export const getTheme = (themeId) => {
  // Extract base and mode from themeId
  let baseId, mode;
  if (themeId.endsWith('-light') || themeId.endsWith('-dark')) {
    const parts = themeId.split('-');
    mode = parts.pop();
    baseId = parts.join('-');
  } else {
    // Old format - map to new format
    const oldToNew = {
      'light': 'classic-light',
      'sky': 'sky-light',
      'rose': 'rose-light',
      'dark': 'classic-dark',
      'midnight': 'sky-dark',
      'pitch': 'rose-dark'
    };
    themeId = oldToNew[themeId] || 'classic-light';
    const parts = themeId.split('-');
    mode = parts.pop();
    baseId = parts.join('-');
  }
  
  return { id: baseId, mode };
};
