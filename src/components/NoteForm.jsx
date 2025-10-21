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
    const allNotes = storage.getAllNotes();
    const allTags = [...new Set(allNotes.flatMap(note => note.tags || []))];
    setAvailableTags(allTags);
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {note ? 'Edit Note' : 'Create New Note'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter note title..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <textarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleInputChange}
              placeholder="Write your thoughts here..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  
                  {/* Tag Suggestions Dropdown */}
                  {showTagSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {filteredSuggestions.slice(0, 5).map((tag, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectExistingTag(tag)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
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

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
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
