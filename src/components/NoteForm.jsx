import { useState, useEffect } from 'react';
import { extractNoteKeywords } from '../utils/keywords.js';
import { storage } from '../utils/storage.js';
import { tagManager } from '../utils/tagManager.js';
import RichTextEditor from './RichTextEditor.jsx';

const NoteForm = ({ note, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: [],
    revisionReminder: {
      enabled: false,
      days: 7,
      lastNotified: null
    }
  });
  const [tagFilter, setTagFilter] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [useRichText, setUseRichText] = useState(true);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        body: note.body || '',
        tags: note.tags || [],
        revisionReminder: note.revisionReminder || {
          enabled: false,
          days: 7,
          lastNotified: null
        }
      });
    } else {
      setFormData({
        title: '',
        body: '',
        tags: [],
        revisionReminder: {
          enabled: false,
          days: 7,
          lastNotified: null
        }
      });
    }
    setTagFilter('');
    setShowTagDropdown(false);
    
    // Load managed tags from tagManager
    const loadTags = () => {
      try {
        const managedTags = tagManager.getAllTags();
        setAvailableTags(managedTags);
      } catch (error) {
        console.error('Error loading tags:', error);
        setAvailableTags([]);
      }
    };
    loadTags();
  }, [note, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleTag = (tag) => {
    if (formData.tags.includes(tag)) {
      // Remove tag
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(t => t !== tag)
      }));
    } else {
      // Add tag
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleTagFilterChange = (e) => {
    const value = e.target.value;
    setTagFilter(value);
    setShowTagDropdown(true);
  };

  const filteredTags = availableTags.filter(tag => 
    tag.toLowerCase().includes(tagFilter.toLowerCase())
  );

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleRevisionReminderToggle = (enabled) => {
    setFormData(prev => ({
      ...prev,
      revisionReminder: {
        ...prev.revisionReminder,
        enabled
      }
    }));
  };

  const handleRevisionDaysChange = (days) => {
    setFormData(prev => ({
      ...prev,
      revisionReminder: {
        ...prev.revisionReminder,
        days: parseInt(days, 10)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() && !formData.body.trim()) return;

    setIsSaving(true);
    
    try {
      // Extract keywords from the note content
      const keywords = extractNoteKeywords({
        title: formData.title,
        body: formData.body
      });

      const noteData = {
        ...formData,
        keywords
      };

      await onSave(noteData);
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="p-6" style={{ borderBottom: `1px solid var(--border-color)` }}>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {note ? 'Edit Note' : 'Create New Note'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter note title..."
              className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              style={{ backgroundColor: 'var(--bg-primary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="body" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Content
              </label>
              <button
                type="button"
                onClick={() => setUseRichText(!useRichText)}
                className="text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {useRichText ? '📝 Rich Text' : '📄 Plain Text'}
              </button>
            </div>
            {useRichText ? (
              <RichTextEditor
                content={formData.body}
                onChange={(html) => setFormData(prev => ({ ...prev, body: html }))}
                placeholder="Write your thoughts here..."
              />
            ) : (
              <textarea
                id="body"
                name="body"
                value={formData.body}
                onChange={handleInputChange}
                placeholder="Write your thoughts here..."
                rows={8}
                className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all duration-200"
                style={{ backgroundColor: 'var(--bg-primary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Tags
            </label>
            
            {/* Selected Tags Display */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Tag Selector Dropdown */}
            <div className="relative">
              <input
                type="text"
                value={tagFilter}
                onChange={handleTagFilterChange}
                onFocus={() => setShowTagDropdown(true)}
                onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                placeholder={availableTags.length > 0 ? "Type to filter tags..." : "No tags available. Add tags in Settings."}
                disabled={availableTags.length === 0}
                className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                style={{ 
                  backgroundColor: 'var(--bg-primary)', 
                  borderWidth: '1px', 
                  borderStyle: 'solid', 
                  borderColor: 'var(--border-color)', 
                  color: 'var(--text-primary)',
                  cursor: availableTags.length === 0 ? 'not-allowed' : 'text'
                }}
              />
              
              {/* Dropdown with checkboxes */}
              {showTagDropdown && availableTags.length > 0 && (
                <div 
                  className="absolute z-10 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderWidth: '1px', 
                    borderStyle: 'solid', 
                    borderColor: 'var(--border-color)' 
                  }}
                >
                  {filteredTags.length > 0 ? (
                    filteredTags.map((tag) => (
                      <label
                        key={tag}
                        className="flex items-center px-3 py-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleToggleTag(tag)}
                      >
                        <input
                          type="checkbox"
                          checked={formData.tags.includes(tag)}
                          onChange={() => handleToggleTag(tag)}
                          className="mr-3 h-4 w-4 rounded cursor-pointer"
                          style={{ accentColor: 'var(--primary-500)' }}
                        />
                        <span style={{ color: 'var(--text-primary)' }}>{tag}</span>
                      </label>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-center" style={{ color: 'var(--text-secondary)' }}>
                      No tags match your filter
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {availableTags.length === 0 && (
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                💡 Create tags in Settings → Tag Management to organize your notes
              </p>
            )}
          </div>

          {/* Revision Reminder */}
          <div 
            className="rounded-lg p-4"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--border-color)'
            }}
          >
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.revisionReminder.enabled}
                onChange={(e) => handleRevisionReminderToggle(e.target.checked)}
                className="h-4 w-4 rounded cursor-pointer"
                style={{ accentColor: 'var(--primary-500)' }}
              />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                📝 Remind me to revisit this note
              </span>
            </label>
            
            {formData.revisionReminder.enabled && (
              <div className="ml-6 space-y-2">
                <label className="block text-sm" style={{ color: 'var(--text-primary)' }}>
                  Remind me after:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.revisionReminder.days}
                    onChange={(e) => handleRevisionDaysChange(e.target.value)}
                    className="w-20 px-3 py-2 rounded-lg border text-center"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    day{formData.revisionReminder.days !== 1 ? 's' : ''}
                  </span>
                </div>
                {note && note.lastOpened && (
                  <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                    Last opened: {new Date(note.lastOpened).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4" style={{ borderTop: `1px solid var(--border-color)` }}>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 hover:opacity-80 transition-colors duration-200"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || (!formData.title.trim() && !formData.body.trim())}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSaving ? 'Saving...' : (note ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm;
