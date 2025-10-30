import { useState, useEffect } from 'react';
import { storage } from '../utils/storage.js';
import { THEMES, getTheme, getCustomThemes, deleteCustomTheme, applyTheme, exportThemeConfig, importThemeConfig, validateThemeConfig } from '../utils/themes.js';
import { tagManager } from '../utils/tagManager.js';
import ImportExportPanel from './ImportExportPanel.jsx';

const SettingsPanel = () => {
  const [layout, setLayout] = useState('cozy');
  const [revisionDays, setRevisionDays] = useState(7);
  const [minimapPosition, setMinimapPosition] = useState('bottom-right');
  const [showConfirmWipe, setShowConfirmWipe] = useState(false);
  const [importing, setImporting] = useState(false);
  const [notes, setNotes] = useState([]);
  const [customThemes, setCustomThemes] = useState([]);
  
  // Tag management state
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [tagUsage, setTagUsage] = useState({});

  useEffect(() => {
    // Load settings from localStorage
    const savedLayout = localStorage.getItem('thoughtweaver_layout') || 'cozy';
    const savedDays = localStorage.getItem('thoughtweaver_revision_days') || '7';
    const savedPosition = localStorage.getItem('thoughtweaver_minimap_position') || 'bottom-right';
    
    setLayout(savedLayout);
    setRevisionDays(parseInt(savedDays, 10));
    setMinimapPosition(savedPosition);
    
    // Load tags, notes, and custom themes
    loadTags();
    loadNotes();
    loadCustomThemes();
  }, []);
  
  const loadCustomThemes = () => {
    const themes = getCustomThemes();
    setCustomThemes(themes);
  };
  
  const loadNotes = async () => {
    const allNotes = await storage.getAllNotes();
    setNotes(allNotes);
  };
  
  const handleImportComplete = async () => {
    await loadNotes();
    window.location.reload(); // Refresh the app to show imported notes
  };
  
  const loadTags = async () => {
    const allTags = tagManager.getAllTags();
    setTags(allTags);
    
    // Load usage counts for each tag
    const usage = {};
    for (const tag of allTags) {
      usage[tag] = await tagManager.getTagUsage(tag);
    }
    setTagUsage(usage);
  };
  
  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    
    if (tagManager.addTag(trimmed)) {
      setNewTagInput('');
      loadTags();
    } else {
      alert('Tag already exists or is invalid');
    }
  };
  
  const handleDeleteTag = async (tag) => {
    const usage = tagUsage[tag] || 0;
    
    if (usage > 0) {
      const confirmed = window.confirm(
        `"${tag}" is used in ${usage} note${usage !== 1 ? 's' : ''}. Delete it from all notes and the tag list?`
      );
      
      if (!confirmed) return;
      
      // Remove from all notes
      await tagManager.removeTagFromAllNotes(tag);
    }
    
    tagManager.deleteTag(tag);
    loadTags();
  };

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
      loadCustomThemes(); // Refresh the list
      
    } catch (error) {
      console.error('Error importing theme:', error);
      alert('Error importing theme. Please check the file format.');
    } finally {
      setImporting(false);
      event.target.value = ''; // Reset file input
    }
  };
  
  const handleApplyCustomTheme = (themeId) => {
    applyTheme(themeId);
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('themechange', { detail: { themeId } }));
  };
  
  const handleDeleteCustomTheme = (themeId, themeName) => {
    if (!window.confirm(`Delete theme "${themeName}"? This cannot be undone.`)) {
      return;
    }
    
    const success = deleteCustomTheme(themeId);
    if (success) {
      loadCustomThemes(); // Refresh the list
      
      // If the deleted theme was active, switch to default
      const currentTheme = localStorage.getItem('thoughtweaver_theme');
      if (currentTheme === themeId) {
        applyTheme('light');
        window.dispatchEvent(new CustomEvent('themechange', { detail: { themeId: 'light' } }));
      }
    } else {
      alert('Error deleting theme');
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

      {/* Tag Management */}
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
          Tag Management
        </h3>
        
        <div className="space-y-4">
          {/* Add new tag */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="New tag name..."
              className="flex-1 px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 whitespace-nowrap"
            >
              + Add Tag
            </button>
          </div>
          
          {/* Tag list */}
          <div className="space-y-2">
            {tags.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                No tags yet. Add your first tag above.
              </p>
            ) : (
              tags.map(tag => {
                const usage = tagUsage[tag] || 0;
                return (
                  <div 
                    key={tag}
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: usage > 0 ? 'var(--bg-primary)' : 'transparent',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--border-color)',
                      opacity: usage > 0 ? 1 : 0.6
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium"
                        style={{
                          backgroundColor: 'var(--primary-500)',
                          color: 'white'
                        }}
                      >
                        {tag}
                      </span>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {usage} note{usage !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTag(tag)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200 px-2 py-1"
                      title="Delete tag"
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
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
          
          {/* Custom Themes List */}
          {customThemes.length > 0 && (
            <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                Custom Themes ({customThemes.length})
              </h4>
              <div className="space-y-2">
                {customThemes.map(theme => (
                  <div 
                    key={theme.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {theme.name}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApplyCustomTheme(theme.id)}
                        className="px-3 py-1 bg-primary-500 text-white text-sm rounded hover:bg-primary-600 transition-colors duration-200"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => handleDeleteCustomTheme(theme.id, theme.name)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

      {/* Import/Export */}
      <ImportExportPanel notes={notes} onImportComplete={handleImportComplete} />

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

