import { useState, useEffect } from 'react';
import { storage } from '../utils/storage.js';
import { THEMES, getTheme, exportThemeConfig, importThemeConfig, validateThemeConfig } from '../utils/themes.js';

const SettingsPanel = () => {
  const [layout, setLayout] = useState('cozy');
  const [revisionDays, setRevisionDays] = useState(7);
  const [minimapPosition, setMinimapPosition] = useState('bottom-right');
  const [showConfirmWipe, setShowConfirmWipe] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedLayout = localStorage.getItem('thoughtweaver_layout') || 'cozy';
    const savedDays = localStorage.getItem('thoughtweaver_revision_days') || '7';
    const savedPosition = localStorage.getItem('thoughtweaver_minimap_position') || 'bottom-right';
    
    setLayout(savedLayout);
    setRevisionDays(parseInt(savedDays, 10));
    setMinimapPosition(savedPosition);
  }, []);

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    localStorage.setItem('thoughtweaver_layout', newLayout);
    
    // Apply layout class to document
    document.documentElement.classList.remove('layout-compact', 'layout-cozy');
    document.documentElement.classList.add(`layout-${newLayout}`);
    
    // Trigger a custom event for components to react
    window.dispatchEvent(new Event('layoutchange'));
  };

  const handleRevisionDaysChange = (days) => {
    setRevisionDays(days);
    localStorage.setItem('thoughtweaver_revision_days', days.toString());
  };

  const handleMinimapPositionChange = (position) => {
    setMinimapPosition(position);
    localStorage.setItem('thoughtweaver_minimap_position', position);
    window.dispatchEvent(new Event('minimappositionchange'));
  };

  const handleExportTheme = () => {
    const currentThemeId = localStorage.getItem('thoughtweaver_theme') || 'light';
    const theme = getTheme(currentThemeId);
    const themeJson = exportThemeConfig(theme);
    
    // Create download
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thoughtweaver-theme-${theme.id}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTheme = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const themeData = JSON.parse(text);
      
      if (!validateThemeConfig(themeData)) {
        alert('Invalid theme file format');
        return;
      }

      // Save custom theme
      const customThemes = JSON.parse(localStorage.getItem('thoughtweaver_custom_themes') || '[]');
      
      // Check if theme with same ID exists
      const existingIndex = customThemes.findIndex(t => t.id === themeData.id);
      if (existingIndex >= 0) {
        if (!window.confirm(`Theme "${themeData.name}" already exists. Replace it?`)) {
          return;
        }
        customThemes[existingIndex] = themeData;
      } else {
        customThemes.push(themeData);
      }
      
      localStorage.setItem('thoughtweaver_custom_themes', JSON.stringify(customThemes));
      alert(`Theme "${themeData.name}" imported successfully!`);
      
    } catch (error) {
      console.error('Error importing theme:', error);
      alert('Error importing theme. Please check the file format.');
    } finally {
      setImporting(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleExportData = async () => {
    try {
      const jsonData = await storage.exportData();
      if (!jsonData) {
        alert('No data to export');
        return;
      }

      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `thoughtweaver-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data');
    }
  };

  const handleImportData = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await storage.importData(text);
      
      if (result.success) {
        alert(`Successfully imported ${result.count} notes!`);
        window.location.reload();
      } else {
        alert(`Import failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Error importing data');
    }
  };

  const handleWipeData = async () => {
    const success = await storage.clearAllData();
    if (success) {
      alert('All data has been cleared');
      window.location.reload();
    } else {
      alert('Error clearing data');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Customize your ThoughtWeaver experience
        </p>
      </div>

      {/* Layout Settings */}
      <div 
        className="rounded-xl p-6 shadow-sm"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--border-color)'
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Layout
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Spacing Mode
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => handleLayoutChange('compact')}
                className={`flex-1 px-4 py-3 rounded-lg transition-all duration-200 ${
                  layout === 'compact' ? 'ring-2 ring-primary-500' : ''
                }`}
                style={{ 
                  backgroundColor: layout === 'compact' ? 'var(--bg-primary)' : 'transparent',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <div className="font-medium">Compact</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Reduced spacing
                </div>
              </button>
              
              <button
                onClick={() => handleLayoutChange('cozy')}
                className={`flex-1 px-4 py-3 rounded-lg transition-all duration-200 ${
                  layout === 'cozy' ? 'ring-2 ring-primary-500' : ''
                }`}
                style={{ 
                  backgroundColor: layout === 'cozy' ? 'var(--bg-primary)' : 'transparent',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <div className="font-medium">Cozy</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Relaxed spacing
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Revision Reminder Settings */}
      <div 
        className="rounded-xl p-6 shadow-sm"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--border-color)'
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Revision Reminders
        </h3>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Remind me to revisit notes after: <span className="text-primary-500">{revisionDays} days</span>
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={revisionDays}
            onChange={(e) => handleRevisionDaysChange(parseInt(e.target.value, 10))}
            className="w-full"
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            <span>1 day</span>
            <span>30 days</span>
          </div>
        </div>
      </div>

      {/* Mini-map Position */}
      <div 
        className="rounded-xl p-6 shadow-sm"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--border-color)'
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Mini-map Position
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'top-left', label: 'Top Left' },
            { value: 'top-right', label: 'Top Right' },
            { value: 'bottom-left', label: 'Bottom Left' },
            { value: 'bottom-right', label: 'Bottom Right' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => handleMinimapPositionChange(option.value)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                minimapPosition === option.value ? 'ring-2 ring-primary-500' : ''
              }`}
              style={{ 
                backgroundColor: minimapPosition === option.value ? 'var(--bg-primary)' : 'transparent',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Import/Export */}
      <div 
        className="rounded-xl p-6 shadow-sm"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--border-color)'
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Theme Management
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={handleExportTheme}
            className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
          >
            Export Current Theme
          </button>
          
          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange={handleImportTheme}
              disabled={importing}
              className="hidden"
            />
            <div 
              className="w-full px-4 py-2 rounded-lg text-center cursor-pointer transition-colors duration-200"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              {importing ? 'Importing...' : 'Import Theme'}
            </div>
          </label>
        </div>
      </div>

      {/* Data Management */}
      <div 
        className="rounded-xl p-6 shadow-sm"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--border-color)'
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Data Management
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={handleExportData}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            Export All Notes (Backup)
          </button>
          
          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
            <div 
              className="w-full px-4 py-2 rounded-lg text-center cursor-pointer transition-colors duration-200"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              Import Notes
            </div>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div 
        className="rounded-xl p-6 shadow-sm border-2 border-red-300"
        style={{ 
          backgroundColor: 'var(--bg-secondary)'
        }}
      >
        <h3 className="text-lg font-semibold mb-2 text-red-600">
          Danger Zone
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          This action cannot be undone. All notes, settings, and themes will be permanently deleted.
        </p>
        
        {!showConfirmWipe ? (
          <button
            onClick={() => setShowConfirmWipe(true)}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
          >
            Reset All Data
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-600">
              Are you absolutely sure? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleWipeData}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Yes, Delete Everything
              </button>
              <button
                onClick={() => setShowConfirmWipe(false)}
                className="flex-1 px-4 py-2 rounded-lg transition-colors duration-200"
                style={{ 
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;

