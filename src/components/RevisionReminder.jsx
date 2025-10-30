import { useMemo } from 'react';

const RevisionReminder = ({ notes, onNoteClick }) => {
  // Find notes that need revision (using per-note settings)
  const notesToRevisit = useMemo(() => {
    if (!notes || notes.length === 0) return [];

    const now = new Date();

    return notes.filter(note => {
      // Only show notes with revision reminder enabled
      if (!note.revisionReminder?.enabled) return false;
      
      const days = note.revisionReminder.days || 7;
      const cutoffTime = now.getTime() - (days * 24 * 60 * 60 * 1000);
      
      const lastOpened = note.lastOpened || note.updatedAt || note.createdAt;
      if (!lastOpened) return false;
      
      const lastOpenedTime = new Date(lastOpened).getTime();
      return lastOpenedTime < cutoffTime;
    }).sort((a, b) => {
      const aTime = new Date(a.lastOpened || a.updatedAt || a.createdAt).getTime();
      const bTime = new Date(b.lastOpened || b.updatedAt || b.createdAt).getTime();
      return aTime - bTime; // Oldest first
    });
  }, [notes]);

  if (notesToRevisit.length === 0) {
    return null;
  }

  const getDaysSince = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffTime = Math.abs(now - then);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div 
      className="rounded-xl p-6 mb-6 shadow-sm"
      style={{ 
        backgroundColor: 'var(--bg-secondary)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border-color)'
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <svg 
              className="w-6 h-6 text-orange-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              To Revisit
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {notesToRevisit.length} note{notesToRevisit.length !== 1 ? 's' : ''} ready for review
            </p>
          </div>
        </div>
        
        <span 
          className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700"
        >
          {notesToRevisit.length}
        </span>
      </div>

      <div className="space-y-2">
        {notesToRevisit.slice(0, 5).map((note) => {
          const lastOpened = note.lastOpened || note.updatedAt || note.createdAt;
          const daysSince = getDaysSince(lastOpened);
          const reminderDays = note.revisionReminder?.days || 7;
          
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
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {note.title || 'Untitled'}
                  </p>
                  <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-secondary)' }}>
                    {note.body ? note.body.substring(0, 60) + (note.body.length > 60 ? '...' : '') : 'No content'}
                  </p>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {note.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          +{note.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs font-medium text-orange-600">
                    {daysSince} day{daysSince !== 1 ? 's' : ''} ago
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    ({reminderDays}d reminder)
                  </span>
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {notesToRevisit.length > 5 && (
        <p className="text-xs mt-3 text-center" style={{ color: 'var(--text-secondary)' }}>
          +{notesToRevisit.length - 5} more notes to revisit
        </p>
      )}
    </div>
  );
};

export default RevisionReminder;

