import { useState, useEffect } from 'react';
import { storage } from './utils/storage.js';
import { extractNoteKeywords } from './utils/keywords.js';
import NoteForm from './components/NoteForm.jsx';
import NoteList from './components/NoteList.jsx';
import MindMap from './components/MindMap.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';

function App() {
  const [notes, setNotes] = useState([]);
  const [activeView, setActiveView] = useState('list'); // 'list', 'mindmap', 'stats'
  const [selectedNote, setSelectedNote] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('light');

  // Load notes and theme on mount
  useEffect(() => {
    const loadedNotes = storage.getAllNotes();
    setNotes(loadedNotes);

    // Check for saved theme
    const savedTheme = localStorage.getItem('thoughtweaver_theme');
    setCurrentTheme(savedTheme || 'light');
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
        savedNote = storage.updateNote(editingNote.id, noteData);
      } else {
        // Create new note
        savedNote = storage.addNote(noteData);
      }

      if (savedNote) {
        // Update keywords for the saved note
        const keywords = extractNoteKeywords(savedNote);
        const updatedNote = storage.updateNote(savedNote.id, { keywords });
        
        // Reload all notes to get updated relationships
        const updatedNotes = storage.getAllNotes();
        setNotes(updatedNotes);
        
        setIsFormOpen(false);
        setEditingNote(null);
        setSelectedNote(updatedNote);
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      storage.deleteNote(noteId);
      const updatedNotes = storage.getAllNotes();
      setNotes(updatedNotes);
      setSelectedNote(null);
    }
  };

  const handleViewNote = (note) => {
    setSelectedNote(note);
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

  const views = [
    { id: 'list', name: 'Notes', icon: '📝' },
    { id: 'mindmap', name: 'Mind Map', icon: '🧠' },
    { id: 'stats', name: 'Analytics', icon: '📊' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                ThoughtWeaver
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Smart Learning Tracker
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
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
      <nav className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeView === view.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
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
      </main>

      {/* Selected Note Sidebar */}
      {selectedNote && activeView === 'mindmap' && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedNote.title || 'Untitled'}
              </h2>
              <button
                onClick={() => setSelectedNote(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</h3>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {selectedNote.body || 'No content'}
                </p>
              </div>

              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedNote.keywords && selectedNote.keywords.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
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
      )}

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
