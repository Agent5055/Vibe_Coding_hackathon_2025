import { useState, useEffect, useMemo } from 'react';

const FiltersPanel = ({ notes, cy, isOpen, onToggle }) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [keywordRange, setKeywordRange] = useState([0, 20]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Get all unique tags from notes
  const allTags = useMemo(() => {
    if (!notes) return [];
    const tagSet = new Set();
    notes.forEach(note => {
      if (note.tags) {
        note.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  // Get date range from notes
  const noteDateRange = useMemo(() => {
    if (!notes || notes.length === 0) return { min: '', max: '' };
    
    const dates = notes.map(note => new Date(note.createdAt)).filter(d => !isNaN(d));
    if (dates.length === 0) return { min: '', max: '' };
    
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    return {
      min: minDate.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0]
    };
  }, [notes]);

  // Apply filters to Cytoscape
  useEffect(() => {
    if (!cy || !notes) return;

    cy.nodes().forEach(node => {
      const noteId = node.id();
      const note = notes.find(n => n.id === noteId);
      
      if (!note) {
        node.style('display', 'none');
        return;
      }

      let visible = true;

      // Filter by tags
      if (selectedTags.length > 0) {
        const hasTag = note.tags?.some(tag => selectedTags.includes(tag));
        if (!hasTag) visible = false;
      }

      // Filter by keyword count
      const keywordCount = note.keywords?.length || 0;
      if (keywordCount < keywordRange[0] || keywordCount > keywordRange[1]) {
        visible = false;
      }

      // Filter by date range
      if (dateRange.start || dateRange.end) {
        const noteDate = new Date(note.createdAt);
        if (dateRange.start && noteDate < new Date(dateRange.start)) {
          visible = false;
        }
        if (dateRange.end && noteDate > new Date(dateRange.end)) {
          visible = false;
        }
      }

      node.style('display', visible ? 'element' : 'none');
    });

    // Also hide edges where either node is hidden
    cy.edges().forEach(edge => {
      const source = edge.source();
      const target = edge.target();
      const visible = source.visible() && target.visible();
      edge.style('display', visible ? 'element' : 'none');
    });

  }, [cy, notes, selectedTags, keywordRange, dateRange]);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setKeywordRange([0, 20]);
    setDateRange({ start: '', end: '' });
  };

  const hasActiveFilters = selectedTags.length > 0 || 
    keywordRange[0] > 0 || keywordRange[1] < 20 || 
    dateRange.start || dateRange.end;

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="absolute top-4 left-4 z-20 p-3 rounded-lg shadow-lg transition-colors duration-200"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)'
        }}
        title="Show filters"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full"></span>
        )}
      </button>
    );
  }

  return (
    <div 
      className="absolute top-4 left-4 z-20 w-80 rounded-lg shadow-2xl overflow-hidden"
      style={{ 
        backgroundColor: 'var(--bg-secondary)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border-color)',
        maxHeight: 'calc(100vh - 250px)'
      }}
    >
      {/* Header */}
      <div 
        className="p-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          Filters
        </h3>
        <button
          onClick={onToggle}
          className="p-1 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 350px)' }}>
        {/* Tags filter */}
        {allTags.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Tags
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {allTags.map(tag => (
                <label key={tag} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                    className="mr-2 rounded"
                  />
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {tag}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Keyword count range */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Keywords: {keywordRange[0]} - {keywordRange[1]}
          </label>
          <div className="space-y-2">
            <div>
              <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Min</label>
              <input
                type="range"
                min="0"
                max="20"
                value={keywordRange[0]}
                onChange={(e) => setKeywordRange([parseInt(e.target.value), keywordRange[1]])}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>Max</label>
              <input
                type="range"
                min="0"
                max="20"
                value={keywordRange[1]}
                onChange={(e) => setKeywordRange([keywordRange[0], parseInt(e.target.value)])}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Date range */}
        {noteDateRange.min && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Date Range
            </label>
            <div className="space-y-2">
              <div>
                <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>From</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  min={noteDateRange.min}
                  max={noteDateRange.max}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div>
                <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>To</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  min={noteDateRange.min}
                  max={noteDateRange.max}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {hasActiveFilters && (
        <div 
          className="p-4"
          style={{ borderTop: '1px solid var(--border-color)' }}
        >
          <button
            onClick={handleClearFilters}
            className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 text-sm"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FiltersPanel;

