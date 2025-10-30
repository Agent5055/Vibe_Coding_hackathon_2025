import { useState, useMemo, useEffect } from 'react';
import { storage } from '../utils/storage.js';
import RevisionReminder from './RevisionReminder.jsx';

const NoteList = ({ notes, onEdit, onDelete, onView }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentLayout, setCurrentLayout] = useState('cozy');
  const [viewMode, setViewMode] = useState('large-grid'); // 'list', 'small-grid', 'medium-grid', 'large-grid'
  const [showViewDropdown, setShowViewDropdown] = useState(false);

  // Detect current layout mode
  useEffect(() => {
    const detectLayout = () => {
      const savedLayout = localStorage.getItem('thoughtweaver_layout') || 'cozy';
      setCurrentLayout(savedLayout);
      
      // Load view mode for current layout
      const viewModeKey = `thoughtweaver_view_mode_${savedLayout}`;
      const savedViewMode = localStorage.getItem(viewModeKey) || 'large-grid';
      setViewMode(savedViewMode);
    };
    
    detectLayout();
    window.addEventListener('layoutchange', detectLayout);
    return () => window.removeEventListener('layoutchange', detectLayout);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showViewDropdown && !e.target.closest('.view-mode-dropdown')) {
        setShowViewDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showViewDropdown]);

  // Save view mode when it changes
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    const viewModeKey = `thoughtweaver_view_mode_${currentLayout}`;
    localStorage.setItem(viewModeKey, mode);
    setShowViewDropdown(false);
  };

  const viewModeOptions = [
    { id: 'list', name: 'List View', icon: 'M4 6h16M4 12h16M4 18h16' },
    { id: 'small-grid', name: 'Small Grid', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z' },
    { id: 'medium-grid', name: 'Medium Grid', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z' },
    { id: 'large-grid', name: 'Large Grid', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z' }
  ];

  const currentViewMode = viewModeOptions.find(v => v.id === viewMode) || viewModeOptions[3];

  // Cycle to next view mode (for compact layout button)
  const handleCycleViewMode = () => {
    const currentIndex = viewModeOptions.findIndex(v => v.id === viewMode);
    const nextIndex = (currentIndex + 1) % viewModeOptions.length;
    handleViewModeChange(viewModeOptions[nextIndex].id);
  };

  // Get all unique tags from notes
  const allTags = useMemo(() => {
    const tagSet = new Set();
    notes.forEach(note => {
      note.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.body.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note =>
        selectedTags.some(tag => note.tags?.includes(tag))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      // Pinned notes always come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'updatedAt':
        default:
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [notes, searchQuery, selectedTags, sortBy, sortOrder]);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  const handleTogglePin = async (e, noteId) => {
    e.stopPropagation();
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    const updatedNote = { ...note, isPinned: !note.isPinned };
    await storage.updateNote(noteId, updatedNote);
    
    // Refresh notes list
    window.location.reload(); // Simple refresh for now
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Revision Reminder */}
      <RevisionReminder notes={notes} onNoteClick={onView} />
      
      {/* Search and Filters */}
      <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)' }}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                style={{ backgroundColor: 'var(--bg-primary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* View Mode Selector - Dropdown for Cozy, Button for Compact */}
          {currentLayout === 'cozy' ? (
            <div className="relative view-mode-dropdown">
              <button
                onClick={() => setShowViewDropdown(!showViewDropdown)}
                className="flex items-center gap-2 px-3 py-3 rounded-lg hover:opacity-80 focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
                style={{ backgroundColor: 'var(--bg-primary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentViewMode.icon} />
                </svg>
                <span className="text-sm font-medium">{currentViewMode.name}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showViewDropdown && (
                <div 
                  className="absolute top-full mt-1 right-0 rounded-lg shadow-lg overflow-hidden z-10 min-w-[160px]"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)' }}
                >
                  {viewModeOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleViewModeChange(option.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-200 ${
                        viewMode === option.id ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      style={{ color: viewMode === option.id ? undefined : 'var(--text-primary)' }}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={option.icon} />
                      </svg>
                      <span className="text-sm font-medium">{option.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleCycleViewMode}
              className="flex items-center gap-2 px-3 py-3 rounded-lg hover:opacity-80 focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
              style={{ backgroundColor: 'var(--bg-primary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              title={`Current: ${currentViewMode.name} - Click to cycle`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentViewMode.icon} />
              </svg>
              <span className="text-sm font-medium">{currentViewMode.name}</span>
            </button>
          )}

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              style={{ backgroundColor: 'var(--bg-primary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <option value="updatedAt">Last Updated</option>
              <option value="createdAt">Created Date</option>
              <option value="title">Title</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-3 rounded-lg hover:opacity-80 focus:ring-2 focus:ring-primary-500"
              style={{ backgroundColor: 'var(--bg-primary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {(searchQuery || selectedTags.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 rounded-full text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notes List/Grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              {notes.length === 0 ? 'No notes yet' : 'No notes match your search'}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {notes.length === 0 
                ? 'Create your first note to get started' 
                : 'Try adjusting your search or filters'
              }
            </p>
          </div>
        ) : (
        <>
          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-2">
              {filteredNotes.map(note => (
                <div
                  key={note.id}
                  className="rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex items-center gap-4"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)' }}
                  onClick={() => onView(note)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      {note.isPinned && (
                        <span className="text-yellow-500" title="Pinned">
                          📌
                        </span>
                      )}
                      <h3 className="text-base font-semibold truncate group-hover:text-primary-600 transition-colors duration-200" style={{ color: 'var(--text-primary)' }}>
                        {note.title || 'Untitled'}
                      </h3>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex gap-1">
                          {note.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 2 && (
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>+{note.tags.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                      {note.body || 'No content'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                    {note.keywords && note.keywords.length > 0 && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span>{note.keywords.length}</span>
                      </span>
                    )}
                    <span className="whitespace-nowrap">{formatDate(note.updatedAt)}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => handleTogglePin(e, note.id)}
                        className={`p-1.5 rounded transition-all duration-200 ${
                          note.isPinned 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                        title={note.isPinned ? 'Unpin' : 'Pin'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(note);
                        }}
                        className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(note.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Small Grid View */}
          {viewMode === 'small-grid' && (
            <div className={`grid gap-3 ${currentLayout === 'compact' ? 'grid-cols-3 xl:grid-cols-4' : 'grid-cols-2'}`}>
              {filteredNotes.map(note => (
                <div
                  key={note.id}
                  className="rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)' }}
                  onClick={() => onView(note)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary-600 transition-colors duration-200" style={{ color: 'var(--text-primary)' }}>
                      {note.title || 'Untitled'}
                    </h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(note);
                        }}
                        className="p-1 text-gray-400 hover:text-primary-500 rounded"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(note.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {note.body || 'No content'}
                  </p>
                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>{formatDate(note.updatedAt)}</span>
                    {note.keywords && note.keywords.length > 0 && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span>{note.keywords.length}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Medium Grid View */}
          {viewMode === 'medium-grid' && (
            <div className={`grid gap-4 ${currentLayout === 'compact' ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
              {filteredNotes.map(note => (
                <div
                  key={note.id}
                  className="rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)' }}
                  onClick={() => onView(note)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-semibold line-clamp-1 group-hover:text-primary-600 transition-colors duration-200" style={{ color: 'var(--text-primary)' }}>
                      {note.title || 'Untitled'}
                    </h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(note);
                        }}
                        className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(note.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="mb-3 line-clamp-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {note.body || 'No content'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {note.tags?.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags?.length > 2 && (
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>+{note.tags.length - 2}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                      <span>{formatDate(note.updatedAt)}</span>
                      {note.keywords && note.keywords.length > 0 && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <span>{note.keywords.length}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Large Grid View (Original) */}
          {viewMode === 'large-grid' && (
            <div className={`grid gap-4 ${currentLayout === 'compact' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              {filteredNotes.map(note => (
            <div
              key={note.id}
              className="rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
              style={{ backgroundColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)' }}
              onClick={() => onView(note)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold group-hover:text-primary-600 transition-colors duration-200" style={{ color: 'var(--text-primary)' }}>
                  {note.title || 'Untitled'}
                </h3>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(note);
                    }}
                    className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(note.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="mb-4 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                {note.body || 'No content'}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {note.tags?.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {note.tags?.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                      +{note.tags.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span>{formatDate(note.updatedAt)}</span>
                  {note.keywords && note.keywords.length > 0 && (
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span>{note.keywords.length}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
              ))}
            </div>
          )}
        </>
        )}
    </div>
  );
};

export default NoteList;
