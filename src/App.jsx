import { useState, useEffect } from 'react';
import { storage } from './utils/storage.js';
import { extractNoteKeywords } from './utils/keywords.js';
import { tagManager } from './utils/tagManager.js';
import { applyTheme } from './utils/themes.js';
import folderManager from './utils/folderManager.js';
import notebookManager from './utils/notebookManager.js';
import NoteForm from './components/NoteForm.jsx';
import NoteList from './components/NoteList.jsx';
import MindMap from './components/MindMap.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import LinkedNotes from './components/LinkedNotes.jsx';
import VersionHistoryModal from './components/VersionHistoryModal.jsx';
import NoteViewModal from './components/NoteViewModal.jsx';
import FolderTreeSidebar from './components/FolderTreeSidebar.jsx';
import CreateFolderModal from './components/CreateFolderModal.jsx';
import CreateNotebookModal from './components/CreateNotebookModal.jsx';
import AddItemModal from './components/AddItemModal.jsx';

function App() {
  const [notes, setNotes] = useState([]);
  const [activeView, setActiveView] = useState('list'); // 'list', 'mindmap', 'stats', 'settings'
  const [selectedNote, setSelectedNote] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('light');
  const [versionHistoryNote, setVersionHistoryNote] = useState(null);
  const [layoutMode, setLayoutMode] = useState('cozy');
  const [viewingNote, setViewingNote] = useState(null);
  
  // Organization state
  const [folders, setFolders] = useState([]);
  const [notebooks, setNotebooks] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedItem, setSelectedItem] = useState({ type: 'all-notes' });
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [editingNotebook, setEditingNotebook] = useState(null);
  const [preselectedFolderId, setPreselectedFolderId] = useState(null);
  const [preselectedParentId, setPreselectedParentId] = useState(null);
  const [addItemParentFolderId, setAddItemParentFolderId] = useState(null);

  // Load notes, theme, layout, and organization data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedNotes = await storage.getAllNotes();
        setNotes(loadedNotes || []);
        
        // Sync existing tags from notes to managed tag list
        await tagManager.syncTagsFromNotes();
        
        // Load folders and notebooks
        const loadedFolders = folderManager.getAll();
        const loadedNotebooks = await notebookManager.getAll();
        setFolders(loadedFolders);
        setNotebooks(loadedNotebooks);
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

    // Check for saved sidebar state
    const savedSidebarState = localStorage.getItem('thoughtweaver_sidebar_collapsed');
    if (savedSidebarState) {
      setIsSidebarCollapsed(savedSidebarState === 'true');
    }

    // Listen for notes updates (e.g., from pin toggle)
    const handleNotesUpdated = () => {
      loadData();
    };
    const handleFoldersUpdated = () => {
      const loadedFolders = folderManager.getAll();
      setFolders(loadedFolders);
    };
    const handleNotebooksUpdated = async () => {
      const loadedNotebooks = await notebookManager.getAll();
      setNotebooks(loadedNotebooks);
    };

    window.addEventListener('notesUpdated', handleNotesUpdated);
    window.addEventListener('foldersUpdated', handleFoldersUpdated);
    window.addEventListener('notebooksUpdated', handleNotebooksUpdated);

    return () => {
      window.removeEventListener('notesUpdated', handleNotesUpdated);
      window.removeEventListener('foldersUpdated', handleFoldersUpdated);
      window.removeEventListener('notebooksUpdated', handleNotebooksUpdated);
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

  // Keyboard shortcut for sidebar toggle (Ctrl+B)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        handleToggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarCollapsed]);

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

  const handleOpenViewModal = async (note) => {
    // Open read-only view modal
    await storage.updateLastOpened(note.id);
    const updatedNotes = await storage.getAllNotes();
    setNotes(updatedNotes);
    setViewingNote(note);
  };

  const handleCloseViewModal = () => {
    setViewingNote(null);
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

  // Organization handlers
  const handleToggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('thoughtweaver_sidebar_collapsed', newState.toString());
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };

  const handleCreateFolder = (parentId = null) => {
    setEditingFolder(null);
    setPreselectedParentId(parentId);
    setIsFolderModalOpen(true);
  };

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    setIsFolderModalOpen(true);
  };

  const handleSaveFolder = async (folderData) => {
    try {
      if (editingFolder) {
        await folderManager.update(editingFolder.id, folderData);
      } else {
        await folderManager.create(folderData);
      }
      setIsFolderModalOpen(false);
      setEditingFolder(null);
      setPreselectedParentId(null);
    } catch (error) {
      throw error; // Let modal handle the error
    }
  };

  const handleDeleteFolder = async (folder) => {
    if (window.confirm(`Are you sure you want to delete "${folder.name}"? All notebooks in this folder will also be deleted.`)) {
      try {
        // Delete all notebooks in this folder first
        await notebookManager.deleteByFolder(folder.id);
        // Delete the folder
        folderManager.delete(folder.id);
        // Reset selection if deleted folder was selected
        if (selectedItem?.type === 'folder' && selectedItem?.id === folder.id) {
          setSelectedItem({ type: 'all-notes' });
        }
      } catch (error) {
        console.error('Error deleting folder:', error);
        alert('Failed to delete folder');
      }
    }
  };

  const handleCreateNotebook = (folderId = null) => {
    setPreselectedFolderId(folderId);
    setEditingNotebook(null);
    setIsNotebookModalOpen(true);
  };

  const handleEditNotebook = (notebook) => {
    setEditingNotebook(notebook);
    setPreselectedFolderId(null);
    setIsNotebookModalOpen(true);
  };

  const handleSaveNotebook = async (notebookData) => {
    try {
      if (editingNotebook) {
        await notebookManager.update(editingNotebook.id, notebookData);
      } else {
        await notebookManager.create(notebookData);
      }
      // Reload notebooks immediately so NoteForm has latest list
      const refreshedNotebooks = await notebookManager.getAll();
      setNotebooks(refreshedNotebooks);
      setIsNotebookModalOpen(false);
      setEditingNotebook(null);
      setPreselectedFolderId(null);
    } catch (error) {
      throw error; // Let modal handle the error
    }
  };

  const handleDeleteNotebook = async (notebook) => {
    if (window.confirm(`Are you sure you want to delete "${notebook.name}"?`)) {
      try {
        await notebookManager.delete(notebook.id);
        // Reset selection if deleted notebook was selected
        if (selectedItem?.type === 'notebook' && selectedItem?.id === notebook.id) {
          setSelectedItem({ type: 'all-notes' });
        }
        // Reload notes to update their notebook associations display
        const updatedNotes = await storage.getAllNotes();
        setNotes(updatedNotes);
      } catch (error) {
        console.error('Error deleting notebook:', error);
        alert('Failed to delete notebook');
      }
    }
  };

  // Handle adding items inside folders (unified modal)
  const handleAddItemInFolder = (folderId) => {
    setAddItemParentFolderId(folderId);
    setIsAddItemModalOpen(true);
  };

  const handleSaveAddItem = async (itemType, itemData) => {
    try {
      if (itemType === 'folder') {
        await folderManager.create(itemData);
      } else {
        await notebookManager.create(itemData);
        // Reload notebooks after creation via AddItem modal
        const refreshedNotebooks = await notebookManager.getAll();
        setNotebooks(refreshedNotebooks);
      }
      setIsAddItemModalOpen(false);
      setAddItemParentFolderId(null);
    } catch (error) {
      throw error; // Let modal handle the error
    }
  };

  // Filter notes based on selected item
  const getFilteredNotes = () => {
    if (selectedItem.type === 'all-notes') {
      return notes.filter(note => !note.notebookIds || note.notebookIds.length === 0);
    } else if (selectedItem.type === 'notebook') {
      return notes.filter(note => note.notebookIds && note.notebookIds.includes(selectedItem.id));
    } else if (selectedItem.type === 'folder') {
      const folderNotebookIds = notebooks
        .filter(n => n.folderId === selectedItem.id)
        .map(n => n.id);
      return notes.filter(note => 
        note.notebookIds && note.notebookIds.some(id => folderNotebookIds.includes(id))
      );
    }
    return notes;
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
            <div className="flex items-center space-x-3">
              <img 
                src="/thoughtweaver-logo.png" 
                alt="ThoughtWeaver Logo" 
                className="h-12 w-16 rounded-lg object-cover"
              />
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  ThoughtWeaver
                </h1>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Smart Learning Tracker
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDailyNote}
                className="px-4 py-2 rounded-lg hover:opacity-80 transition-all duration-200 flex items-center space-x-2"
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
                className="px-4 py-2 rounded-lg hover:opacity-80 transition-all duration-200 flex items-center space-x-2"
                style={{ backgroundColor: 'var(--bg-primary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                title="Create a new note"
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

      {/* Sidebar */}
      <FolderTreeSidebar
        notes={notes}
        isCollapsed={isSidebarCollapsed}
        onToggle={handleToggleSidebar}
        selectedItem={selectedItem}
        onSelectItem={handleSelectItem}
        onCreateFolder={handleCreateFolder}
        onCreateNotebook={handleCreateNotebook}
        onAddItemInFolder={handleAddItemInFolder}
        onEditFolder={handleEditFolder}
        onEditNotebook={handleEditNotebook}
        onDeleteFolder={handleDeleteFolder}
        onDeleteNotebook={handleDeleteNotebook}
      />

      {/* Main Content */}
      <main 
        className="transition-all duration-300 py-8"
        style={{ 
          marginLeft: isSidebarCollapsed ? '3rem' : '18rem',
          paddingLeft: '1rem',
          paddingRight: '1rem'
        }}
      >
        {activeView === 'list' && (
          <NoteList
            notes={getFilteredNotes()}
            allNotes={notes}
            notebooks={notebooks}
            selectedItem={selectedItem}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
            onView={handleViewNote}
            onDoubleClick={handleOpenViewModal}
          />
        )}

        {activeView === 'mindmap' && (
          <div className="h-[calc(100vh-200px)]">
            <MindMap
              notes={notes}
              notebooks={notebooks}
              selectedItem={selectedItem}
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
          <SettingsPanel 
            folders={folders}
            notebooks={notebooks}
            onEditFolder={handleEditFolder}
            onDeleteFolder={handleDeleteFolder}
            onEditNotebook={handleEditNotebook}
            onDeleteNotebook={handleDeleteNotebook}
          />
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
        notebooks={notebooks}
        folders={folders}
        onSave={handleSaveNote}
        onCancel={handleCloseForm}
        isOpen={isFormOpen}
      />

      {/* Note View Modal */}
      {viewingNote && (
        <NoteViewModal
          note={viewingNote}
          onClose={handleCloseViewModal}
          onEdit={handleEditNote}
        />
      )}

      {/* Folder Modal */}
      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false);
          setEditingFolder(null);
          setPreselectedParentId(null);
        }}
        onSave={handleSaveFolder}
        editFolder={editingFolder}
        preselectedParentId={preselectedParentId}
      />

      {/* Notebook Modal */}
      <CreateNotebookModal
        isOpen={isNotebookModalOpen}
        onClose={() => {
          setIsNotebookModalOpen(false);
          setEditingNotebook(null);
          setPreselectedFolderId(null);
        }}
        onSave={handleSaveNotebook}
        editNotebook={editingNotebook}
        preselectedFolderId={preselectedFolderId}
      />

      {/* Add Item Modal (for adding items inside folders) */}
      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => {
          setIsAddItemModalOpen(false);
          setAddItemParentFolderId(null);
        }}
        onSave={handleSaveAddItem}
        parentFolderId={addItemParentFolderId}
      />
    </div>
  );
}

export default App;
