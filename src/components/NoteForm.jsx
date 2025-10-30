import { useState, useEffect } from 'react';
import { extractNoteKeywords } from '../utils/keywords.js';
import { storage } from '../utils/storage.js';

const NoteForm = ({ note, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        body: note.body || '',
        tags: note.tags || []
      });
    } else {
      setFormData({
        title: '',
        body: '',
        tags: []
      });
    }
    setTagInput('');
    
    // Load available tags from all notes
    const loadTags = async () => {
      try {
        const allNotes = await storage.getAllNotes();
        const allTags = [...new Set(allNotes.flatMap(note => note.tags || []))];
        setAvailableTags(allTags);
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

  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
      setShowTagSuggestions(false);
    }
  };

  const handleSelectExistingTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    setShowTagSuggestions(value.length > 0);
  };

  const filteredSuggestions = availableTags.filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) && 
    !formData.tags.includes(tag)
  );

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
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
            <label htmlFor="body" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Content
            </label>
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
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Tags
            </label>
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
            <div className="relative">
              <form onSubmit={handleAddTag} className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onFocus={() => setShowTagSuggestions(tagInput.length > 0)}
                    placeholder="Add a tag..."
                    className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    style={{ backgroundColor: 'var(--bg-primary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                  
                  {/* Tag Suggestions Dropdown */}
                  {showTagSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 rounded-lg shadow-lg max-h-40 overflow-y-auto" style={{ backgroundColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)' }}>
                      {filteredSuggestions.slice(0, 5).map((tag, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectExistingTag(tag)}
                          className="w-full px-3 py-2 text-left hover:opacity-80"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
                >
                  Add
                </button>
              </form>
            </div>
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
