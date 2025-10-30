import { useState, useEffect } from 'react';
import { storage } from './utils/storage.js';
import { extractNoteKeywords } from './utils/keywords.js';
import { tagManager } from './utils/tagManager.js';
import { applyTheme } from './utils/themes.js';
import NoteForm from './components/NoteForm.jsx';
import NoteList from './components/NoteList.jsx';
import MindMap from './components/MindMap.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import LinkedNotes from './components/LinkedNotes.jsx';
import VersionHistoryModal from './components/VersionHistoryModal.jsx';

function App() {
  const [notes, setNotes] = useState([]);
  const [activeView, setActiveView] = useState('list'); // 'list', 'mindmap', 'stats', 'settings'
  const [selectedNote, setSelectedNote] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('light');
  const [versionHistoryNote, setVersionHistoryNote] = useState(null);
  const [layoutMode, setLayoutMode] = useState('cozy');

  // Load notes, theme, and layout on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedNotes = await storage.getAllNotes();
        setNotes(loadedNotes || []);
        
        // Sync existing tags from notes to managed tag list
        await tagManager.syncTagsFromNotes();
      } catch (error) {
        console.error('Error loading notes:', error);
        setNotes([]);
      }
    };
    loadData();

    // Initialize theme system - applyTheme handles everything including migration
    const savedTheme = localStorage.getItem('thoughtweaver_theme') || 'default-dark';
    applyTheme(savedTheme);
    setCurrentTheme(savedTheme);

    // Check for saved layout
    const savedLayout = localStorage.getItem('thoughtweaver_layout') || 'cozy';
    setLayoutMode(savedLayout);
    document.documentElement.classList.add(`layout-${savedLayout}`);

    // Listen for notes updates (e.g., from pin toggle)
    const handleNotesUpdated = () => {
      loadData();
    };
    window.addEventListener('notesUpdated', handleNotesUpdated);

    return () => {
      window.removeEventListener('notesUpdated', handleNotesUpdated);
    };
  }, []);

  // Update theme state when ThemeToggle changes theme
  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem('thoughtweaver_theme');
      if (savedTheme) {
        setCurrentTheme(savedTheme);
      }
    };

    // Listen for storage changes (when theme is updated)
    window.addEventListener('storage', handleThemeChange);
    
    // Also poll for theme changes every 100ms to catch same-tab changes
    const interval = setInterval(() => {
      const savedTheme = localStorage.getItem('thoughtweaver_theme');
      if (savedTheme && savedTheme !== currentTheme) {
        setCurrentTheme(savedTheme);
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      clearInterval(interval);
    };
  }, [currentTheme]);

  const handleSaveNote = async (noteData) => {
    try {
      let savedNote;
      
      if (editingNote) {
        // Update existing note
        savedNote = await storage.updateNote(editingNote.id, noteData);
      } else {
        // Create new note
        savedNote = await storage.addNote(noteData);
      }

      if (savedNote) {
        // Update keywords for the saved note
        const keywords = extractNoteKeywords(savedNote);
        const updatedNote = await storage.updateNote(savedNote.id, { keywords });
        
        // Reload all notes to get updated relationships
        const updatedNotes = await storage.getAllNotes();
        setNotes(updatedNotes);
        
        setIsFormOpen(false);
        setEditingNote(null);
        setSelectedNote(updatedNote);
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleEditNote = async (note) => {
    // Update lastOpened when editing
    await storage.updateLastOpened(note.id);
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await storage.deleteNote(noteId);
      const updatedNotes = await storage.getAllNotes();
      setNotes(updatedNotes);
      setSelectedNote(null);
    }
  };

  const handleViewNote = async (note) => {
    // Update lastOpened when viewing
    await storage.updateLastOpened(note.id);
    const updatedNotes = await storage.getAllNotes();
    setNotes(updatedNotes);
    setSelectedNote(note);
  };

  const handleRestoreVersion = async (versionData) => {
    if (versionHistoryNote) {
      await handleSaveNote({
        ...versionData,
        id: versionHistoryNote
      });
      setVersionHistoryNote(null);
    }
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingNote(null);
  };

  const handleNodeClick = (note) => {
    setSelectedNote(note);
  };

  const handleDailyNote = async () => {
    // Format today's date as YYYY-MM-DD
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const title = `Daily Note - ${dateStr}`;
    
    // Check if today's note already exists
    const existingNote = notes.find(note => note.title === title);
    
    if (existingNote) {
      // Open existing daily note for editing
      setEditingNote(existingNote);
      setIsFormOpen(true);
      await storage.updateLastOpened(existingNote.id);
    } else {
      // Create new daily note immediately with template content
      const newNoteData = {
        title,
        body: `<h1>Daily Note - ${dateStr}</h1>\n<h2>Tasks</h2>\n<ul data-type="taskList">\n  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Add your tasks here...</p></div></li>\n</ul>\n<h2>Notes</h2>\n<p>Write your thoughts and reflections for today...</p>`,
        tags: ['daily'],
        isPinned: false
      };
      
      // Actually create the note in storage
      const createdNote = await storage.addNote(newNoteData);
      
      if (createdNote) {
        // Extract keywords for the new note
        const keywords = extractNoteKeywords(createdNote);
        const updatedNote = await storage.updateNote(createdNote.id, { keywords });
        
        // Reload notes to include the new one
        const updatedNotes = await storage.getAllNotes();
        setNotes(updatedNotes);
        
        // Now open it for editing
        setEditingNote(updatedNote);
        setIsFormOpen(true);
      }
    }
  };

  const views = [
    { id: 'list', name: 'Notes', icon: '📝' },
    { id: 'mindmap', name: 'Mind Map', icon: '🧠' },
    { id: 'stats', name: 'Analytics', icon: '📊' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(to bottom right, var(--bg-primary), var(--bg-secondary))` }}>
      {/* Header */}
      <header className="backdrop-blur-sm sticky top-0 z-40" style={{ backgroundColor: 'var(--bg-secondary)', opacity: 0.95, borderBottom: `1px solid var(--border-color)` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                ThoughtWeaver
              </h1>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Smart Learning Tracker
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDailyNote}
                className="px-3 py-2 rounded-lg hover:opacity-80 transition-all duration-200 flex items-center space-x-2"
                style={{ backgroundColor: 'var(--bg-primary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                title="Open or create today's daily note"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Daily Note</span>
              </button>
              
              <button
                onClick={handleCreateNote}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Note</span>
              </button>
              
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="backdrop-blur-sm" style={{ backgroundColor: 'var(--bg-secondary)', opacity: 0.8, borderBottom: `1px solid var(--border-color)` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeView === view.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent hover:border-gray-300'
                }`}
                style={{ color: activeView === view.id ? undefined : 'var(--text-secondary)' }}
              >
                <span className="mr-2">{view.icon}</span>
                {view.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'list' && (
          <NoteList
            notes={notes}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
            onView={handleViewNote}
          />
        )}

        {activeView === 'mindmap' && (
          <div className="h-[calc(100vh-200px)]">
            <MindMap
              notes={notes}
              onNodeClick={handleNodeClick}
              selectedNoteId={selectedNote?.id}
              currentTheme={currentTheme}
            />
          </div>
        )}

        {activeView === 'stats' && (
          <StatsPanel notes={notes} />
        )}

        {activeView === 'settings' && (
          <SettingsPanel />
        )}
      </main>

      {/* Selected Note Sidebar */}
      {selectedNote && activeView === 'mindmap' && (
        <div className="fixed right-0 top-0 h-full w-96 shadow-2xl z-50 overflow-y-auto" style={{ backgroundColor: 'var(--bg-secondary)', borderLeft: `1px solid var(--border-color)` }}>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {selectedNote.title || 'Untitled'}
              </h2>
              <button
                onClick={() => setSelectedNote(null)}
                className="p-2 transition-colors duration-200"
                style={{ color: 'var(--text-secondary)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Content</h3>
                <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                  {selectedNote.body || 'No content'}
                </p>
              </div>

              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedNote.keywords && selectedNote.keywords.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-sm rounded-full"
                        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Notes Section */}
              <LinkedNotes 
                currentNote={selectedNote}
                allNotes={notes}
                onNoteClick={handleViewNote}
              />

              <div className="pt-4" style={{ borderTop: `1px solid var(--border-color)` }}>
                <div className="space-y-2">
                  <button
                    onClick={() => setVersionHistoryNote(selectedNote.id)}
                    className="w-full px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    📜 View Version History
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditNote(selectedNote)}
                      className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(selectedNote.id)}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      <VersionHistoryModal
        noteId={versionHistoryNote}
        isOpen={versionHistoryNote !== null}
        onClose={() => setVersionHistoryNote(null)}
        onRestore={handleRestoreVersion}
      />

      {/* Note Form Modal */}
      <NoteForm
        note={editingNote}
        onSave={handleSaveNote}
        onCancel={handleCloseForm}
        isOpen={isFormOpen}
      />
    </div>
  );
}

export default App;
