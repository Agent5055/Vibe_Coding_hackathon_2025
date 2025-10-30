import { useMemo } from 'react';

const OnThisDay = ({ notes, onNoteClick }) => {
  const onThisDayNotes = useMemo(() => {
    if (!notes || notes.length === 0) return [];
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    
    return notes.filter(note => {
      // Check createdAt
      if (note.createdAt) {
        const created = new Date(note.createdAt);
        if (created.getMonth() === currentMonth && created.getDate() === currentDay && created.getFullYear() !== today.getFullYear()) {
          return true;
        }
      }
      
      // Check updatedAt
      if (note.updatedAt) {
        const updated = new Date(note.updatedAt);
        if (updated.getMonth() === currentMonth && updated.getDate() === currentDay && updated.getFullYear() !== today.getFullYear()) {
          return true;
        }
      }
      
      return false;
    }).sort((a, b) => {
      const aDate = new Date(a.createdAt || a.updatedAt);
      const bDate = new Date(b.createdAt || b.updatedAt);
      return bDate - aDate; // Most recent first
    });
  }, [notes]);

  if (onThisDayNotes.length === 0) {
    return null;
  }

  const formatYear = (dateString) => {
    const date = new Date(dateString);
    return date.getFullYear();
  };

  const getYearsAgo = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return today.getFullYear() - date.getFullYear();
  };

  return (
    <div 
      className="rounded-xl p-6 shadow-sm"
      style={{ 
        backgroundColor: 'var(--bg-secondary)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border-color)'
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📅</span>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          On This Day
        </h3>
      </div>
      
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        Notes created or edited on this day in previous years
      </p>

      <div className="space-y-3">
        {onThisDayNotes.slice(0, 5).map((note) => {
          const year = formatYear(note.createdAt || note.updatedAt);
          const yearsAgo = getYearsAgo(note.createdAt || note.updatedAt);
          
          return (
            <div 
              key={note.id}
              className="p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'var(--bg-primary)' }}
              onClick={() => onNoteClick && onNoteClick(note)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {note.title || 'Untitled'}
                  </h4>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {year} • {yearsAgo} year{yearsAgo !== 1 ? 's' : ''} ago
                  </p>
                </div>
                <div className="ml-3">
                  {note.tags && note.tags.length > 0 && (
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                    >
                      {note.tags[0]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {onThisDayNotes.length > 5 && (
        <p className="text-sm mt-3 text-center" style={{ color: 'var(--text-secondary)' }}>
          +{onThisDayNotes.length - 5} more
        </p>
      )}
    </div>
  );
};

export default OnThisDay;

