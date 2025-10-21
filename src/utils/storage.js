// LocalStorage wrapper for note CRUD operations
const STORAGE_KEY = 'thoughtweaver_notes';

export const storage = {
  // Get all notes from localStorage
  getAllNotes: () => {
    try {
      const notes = localStorage.getItem(STORAGE_KEY);
      return notes ? JSON.parse(notes) : [];
    } catch (error) {
      console.error('Error loading notes from localStorage:', error);
      return [];
    }
  },

  // Save all notes to localStorage
  saveAllNotes: (notes) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      return true;
    } catch (error) {
      console.error('Error saving notes to localStorage:', error);
      return false;
    }
  },

  // Add a new note
  addNote: (note) => {
    const notes = storage.getAllNotes();
    const newNote = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: note.title || 'Untitled',
      body: note.body || '',
      tags: note.tags || [],
      keywords: note.keywords || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    notes.push(newNote);
    storage.saveAllNotes(notes);
    return newNote;
  },

  // Update an existing note
  updateNote: (id, updates) => {
    const notes = storage.getAllNotes();
    const noteIndex = notes.findIndex(note => note.id === id);
    
    if (noteIndex === -1) {
      return null;
    }

    notes[noteIndex] = {
      ...notes[noteIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    storage.saveAllNotes(notes);
    return notes[noteIndex];
  },

  // Delete a note
  deleteNote: (id) => {
    const notes = storage.getAllNotes();
    const filteredNotes = notes.filter(note => note.id !== id);
    storage.saveAllNotes(filteredNotes);
    return true;
  },

  // Get a single note by ID
  getNote: (id) => {
    const notes = storage.getAllNotes();
    return notes.find(note => note.id === id) || null;
  },

  // Search notes by query
  searchNotes: (query) => {
    const notes = storage.getAllNotes();
    if (!query.trim()) return notes;

    const lowercaseQuery = query.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowercaseQuery) ||
      note.body.toLowerCase().includes(lowercaseQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  },

  // Filter notes by tags
  filterNotesByTags: (tags) => {
    const notes = storage.getAllNotes();
    if (!tags.length) return notes;

    return notes.filter(note => 
      tags.some(tag => note.tags.includes(tag))
    );
  }
};
