import { useMemo } from 'react';
import { findRelatedNotes } from '../utils/keywords.js';

const LinkedNotes = ({ currentNote, allNotes, onNoteClick }) => {
  const relatedNotes = useMemo(() => {
    if (!currentNote || !allNotes || allNotes.length === 0) return [];
    return findRelatedNotes(currentNote, allNotes, 2); // Minimum 2 shared keywords
  }, [currentNote, allNotes]);

  if (relatedNotes.length === 0) {
    return null;
  }

  // Calculate shared keywords for display
  const getSharedKeywords = (note) => {
    if (!currentNote.keywords || !note.keywords) return [];
    const currentKeywordSet = new Set(currentNote.keywords);
    return note.keywords.filter(keyword => currentKeywordSet.has(keyword));
  };

  return (
    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
        Also Connected To
      </h3>
      
      <div className="space-y-2">
        {relatedNotes.slice(0, 5).map((note) => {
          const sharedKeywords = getSharedKeywords(note);
          
          return (
            <button
              key={note.id}
              onClick={() => onNoteClick(note)}
              className="w-full text-left p-3 rounded-lg transition-all duration-200 hover:opacity-80"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--border-color)'
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {note.title || 'Untitled'}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sharedKeywords.slice(0, 3).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ 
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {keyword}
                      </span>
                    ))}
                    {sharedKeywords.length > 3 && (
                      <span
                        className="text-xs px-2 py-0.5"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        +{sharedKeywords.length - 3}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <svg 
                    className="w-4 h-4 text-primary-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" 
                    />
                  </svg>
                  <span className="text-xs font-medium text-primary-500">
                    {sharedKeywords.length}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {relatedNotes.length > 5 && (
        <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-secondary)' }}>
          +{relatedNotes.length - 5} more connected notes
        </p>
      )}
    </div>
  );
};

export default LinkedNotes;

