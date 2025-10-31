import { useState, useEffect } from 'react';
import { DEFAULT_COLORS, DEFAULT_ICONS } from '../utils/folderManager.js';
import folderManager from '../utils/folderManager.js';

const CreateFolderModal = ({ isOpen, onClose, onSave, editFolder, preselectedParentId }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: DEFAULT_COLORS[0],
    icon: DEFAULT_ICONS[0],
    parentId: ''
  });
  const [folders, setFolders] = useState([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load all folders
    const allFolders = folderManager.getAll();
    setFolders(allFolders);

    if (editFolder) {
      setFormData({
        name: editFolder.name || '',
        color: editFolder.color || DEFAULT_COLORS[0],
        icon: editFolder.icon || DEFAULT_ICONS[0],
        parentId: editFolder.parentId || ''
      });
    } else {
      setFormData({
        name: '',
        color: DEFAULT_COLORS[0],
        icon: DEFAULT_ICONS[0],
        parentId: preselectedParentId || ''
      });
    }
    setError('');
  }, [editFolder, preselectedParentId, isOpen]);

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Folder name is required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save folder');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="rounded-2xl shadow-2xl w-full max-w-md"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {editFolder ? 'Edit Folder' : 'Create New Folder'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div 
              className="p-3 rounded-lg text-sm"
              style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444'
              }}
            >
              {error}
            </div>
          )}

          {/* Name Input */}
          <div>
            <label htmlFor="folder-name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Folder Name
            </label>
            <input
              type="text"
              id="folder-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter folder name..."
              className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              style={{ 
                backgroundColor: 'var(--bg-primary)', 
                borderWidth: '1px', 
                borderStyle: 'solid', 
                borderColor: 'var(--border-color)', 
                color: 'var(--text-primary)' 
              }}
              autoFocus
            />
          </div>


          {/* Icon Selector */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Icon
            </label>
            <div className="grid grid-cols-8 gap-2">
              {DEFAULT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`p-3 rounded-lg text-2xl transition-all duration-200 ${
                    formData.icon === icon 
                      ? 'ring-2 ring-primary-500 scale-110' 
                      : 'hover:scale-105'
                  }`}
                  style={{ 
                    backgroundColor: formData.icon === icon 
                      ? 'var(--bg-primary)' 
                      : 'transparent',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: formData.icon === icon 
                      ? 'var(--border-color)' 
                      : 'transparent'
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Color
            </label>
            <div className="grid grid-cols-8 gap-2">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-lg transition-all duration-200 ${
                    formData.color === color 
                      ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' 
                      : 'hover:scale-105'
                  }`}
                  style={{ 
                    backgroundColor: color,
                    ringOffsetColor: 'var(--bg-secondary)'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div 
            className="p-4 rounded-lg"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              Preview:
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-3xl" style={{ color: formData.color }}>
                {formData.icon}
              </span>
              <span className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                {formData.name || 'Folder Name'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4" style={{ borderTop: `1px solid var(--border-color)` }}>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 hover:opacity-80 transition-colors duration-200"
              style={{ color: 'var(--text-secondary)' }}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !formData.name.trim()}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSaving ? 'Saving...' : (editFolder ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;

