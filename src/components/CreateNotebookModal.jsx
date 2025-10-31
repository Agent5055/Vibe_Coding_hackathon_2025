import { useState, useEffect } from 'react';
import { DEFAULT_COLORS, DEFAULT_ICONS } from '../utils/notebookManager.js';
import folderManager from '../utils/folderManager.js';

const CreateNotebookModal = ({ isOpen, onClose, onSave, editNotebook, preselectedFolderId }) => {
  const [formData, setFormData] = useState({
    name: '',
    folderId: '',
    color: DEFAULT_COLORS[0],
    icon: DEFAULT_ICONS[0],
    description: ''
  });
  const [folders, setFolders] = useState([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load folders
    const loadedFolders = folderManager.getAll();
    setFolders(loadedFolders);

    if (editNotebook) {
      setFormData({
        name: editNotebook.name || '',
        folderId: editNotebook.folderId || '',
        color: editNotebook.color || DEFAULT_COLORS[0],
        icon: editNotebook.icon || DEFAULT_ICONS[0],
        description: editNotebook.description || ''
      });
    } else {
      setFormData({
        name: '',
        folderId: preselectedFolderId || '',
        color: DEFAULT_COLORS[0],
        icon: DEFAULT_ICONS[0],
        description: ''
      });
    }
    setError('');
  }, [editNotebook, preselectedFolderId, isOpen]);

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
      setError('Notebook name is required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save notebook');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // Check if we have folders
  if (folders.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div 
          className="rounded-2xl shadow-2xl w-full max-w-md p-6"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            No Folders Available
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            You need to create at least one folder before creating a notebook.
          </p>
          <button
            onClick={onClose}
            className="w-full px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {/* Header */}
        <div className="p-6 border-b sticky top-0 z-10" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {editNotebook ? 'Edit Notebook' : 'Create New Notebook'}
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
            <label htmlFor="notebook-name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Notebook Name
            </label>
            <input
              type="text"
              id="notebook-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter notebook name..."
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

          {/* Folder Selector */}
          <div>
            <label htmlFor="folder-select" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Parent Folder (Optional)
            </label>
            <select
              id="folder-select"
              value={formData.folderId}
              onChange={(e) => setFormData({ ...formData, folderId: e.target.value })}
              className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              style={{ 
                backgroundColor: 'var(--bg-primary)', 
                borderWidth: '1px', 
                borderStyle: 'solid', 
                borderColor: 'var(--border-color)', 
                color: 'var(--text-primary)' 
              }}
            >
              <option value="">📓 No Folder (Root Level)</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.icon} {folder.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="notebook-description" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Description (Optional)
            </label>
            <textarea
              id="notebook-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add a description for this notebook..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all duration-200"
              style={{ 
                backgroundColor: 'var(--bg-primary)', 
                borderWidth: '1px', 
                borderStyle: 'solid', 
                borderColor: 'var(--border-color)', 
                color: 'var(--text-primary)' 
              }}
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
              <div>
                <div className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  {formData.name || 'Notebook Name'}
                </div>
                {formData.description && (
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {formData.description}
                  </div>
                )}
              </div>
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
              disabled={isSaving || !formData.name.trim() || !formData.folderId}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSaving ? 'Saving...' : (editNotebook ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNotebookModal;

