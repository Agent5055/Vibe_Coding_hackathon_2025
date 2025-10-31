import { useState, useEffect } from 'react';
import { DEFAULT_COLORS as FOLDER_COLORS, DEFAULT_ICONS as FOLDER_ICONS } from '../utils/folderManager.js';
import { DEFAULT_COLORS as NOTEBOOK_COLORS, DEFAULT_ICONS as NOTEBOOK_ICONS } from '../utils/notebookManager.js';

const AddItemModal = ({ isOpen, onClose, onSave, parentFolderId }) => {
  const [itemType, setItemType] = useState('notebook'); // 'notebook' or 'folder'
  const [formData, setFormData] = useState({
    name: '',
    color: NOTEBOOK_COLORS[0],
    icon: NOTEBOOK_ICONS[0],
    description: '' // Only for notebooks
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setItemType('notebook');
      setFormData({
        name: '',
        color: NOTEBOOK_COLORS[0],
        icon: NOTEBOOK_ICONS[0],
        description: ''
      });
      setError('');
    }
  }, [isOpen]);

  // Update colors/icons when type changes
  useEffect(() => {
    if (itemType === 'folder') {
      setFormData(prev => ({
        ...prev,
        color: FOLDER_COLORS[0],
        icon: FOLDER_ICONS[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        color: NOTEBOOK_COLORS[0],
        icon: NOTEBOOK_ICONS[0]
      }));
    }
  }, [itemType]);

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
      setError(`${itemType === 'folder' ? 'Folder' : 'Notebook'} name is required`);
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const dataToSave = {
        name: formData.name,
        icon: formData.icon,
        color: formData.color
      };

      if (itemType === 'folder') {
        dataToSave.parentId = parentFolderId;
      } else {
        dataToSave.folderId = parentFolderId;
        dataToSave.description = formData.description;
      }

      await onSave(itemType, dataToSave);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create item');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const currentColors = itemType === 'folder' ? FOLDER_COLORS : NOTEBOOK_COLORS;
  const currentIcons = itemType === 'folder' ? FOLDER_ICONS : NOTEBOOK_ICONS;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Add New Item
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

          {/* Type Selector */}
          <div>
            <label htmlFor="item-type" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Type
            </label>
            <select
              id="item-type"
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              style={{ 
                backgroundColor: 'var(--bg-primary)', 
                borderWidth: '1px', 
                borderStyle: 'solid', 
                borderColor: 'var(--border-color)', 
                color: 'var(--text-primary)' 
              }}
            >
              <option value="notebook">📓 Notebook</option>
              <option value="folder">📁 Folder</option>
            </select>
          </div>

          {/* Name Input */}
          <div>
            <label htmlFor="item-name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              {itemType === 'folder' ? 'Folder' : 'Notebook'} Name
            </label>
            <input
              type="text"
              id="item-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={`Enter ${itemType} name...`}
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

          {/* Description (Notebooks only) */}
          {itemType === 'notebook' && (
            <div>
              <label htmlFor="item-description" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Description (Optional)
              </label>
              <textarea
                id="item-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this notebook..."
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
          )}

          {/* Icon Selector */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Icon
            </label>
            <div className="grid grid-cols-8 gap-2">
              {currentIcons.map((icon) => (
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
              {currentColors.map((color) => (
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
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--border-color)'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-80"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--border-color)'
              }}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
              style={{ 
                backgroundColor: formData.color,
                color: '#ffffff'
              }}
              disabled={isSaving}
            >
              {isSaving ? 'Creating...' : `Create ${itemType === 'folder' ? 'Folder' : 'Notebook'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;

