// Enhanced storage wrapper with IndexedDB + LocalStorage fallback
import indexedDBWrapper from './indexedDB.js';

const STORAGE_KEY = 'thoughtweaver_notes';
let useIndexedDB = false;
let migrationComplete = false;

// Readiness gate so callers can await initialization
let readyResolve;
const storageReadyPromise = new Promise((resolve) => {
  readyResolve = resolve;
});

// Initialize storage - attempt IndexedDB first, fallback to LocalStorage
const initStorage = async () => {
  try {
    if (indexedDBWrapper.isSupported) {
      await indexedDBWrapper.init();
      
      // Check if migration already happened
      const migrated = await indexedDBWrapper.getSetting('migrated_from_localstorage');
      
      if (!migrated) {
        const result = await indexedDBWrapper.migrateFromLocalStorage();
        if (result.success) {
          console.log('Migration complete:', result.count, 'notes');
          migrationComplete = true;
        }
      } else {
        migrationComplete = true;
      }
      
      useIndexedDB = true;
      console.log('Using IndexedDB for storage');
    } else {
      console.log('Using LocalStorage for storage');
    }
  } catch (error) {
    console.warn('IndexedDB initialization failed, using LocalStorage:', error);
    useIndexedDB = false;
  } finally {
    // Always resolve readiness to avoid deadlocks even on fallback
    if (typeof readyResolve === 'function') readyResolve();
  }
};

// Initialize on module load (non-blocking)
initStorage().catch(err => {
  console.error('Storage initialization error:', err);
  useIndexedDB = false;
  if (typeof readyResolve === 'function') readyResolve();
});

// Helper: Strip HTML tags from text
const stripHtmlTags = (html) => {
  if (!html || typeof html !== 'string') return '';
  // Remove HTML tags and get text content
  const withoutTags = html.replace(/<[^>]*>/g, ' ');
  // Decode HTML entities
  const textarea = typeof document !== 'undefined' ? document.createElement('textarea') : null;
  if (textarea) {
    textarea.innerHTML = withoutTags;
    return textarea.value;
  }
  // Fallback for server-side or when document is not available
  return withoutTags
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
};

// Helper: Calculate word count
const calculateWordCount = (text) => {
  if (!text || typeof text !== 'string') return 0;
  const plainText = stripHtmlTags(text);
  return plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
};

// Helper: Calculate reading time (200 words per minute)
const calculateReadingTime = (text) => {
  const wordCount = calculateWordCount(text);
  return Math.ceil(wordCount / 200) || 1;
};

// Helper: Enhance note with computed fields
const enhanceNote = (note) => {
  const body = note.body || '';
  return {
    ...note,
    isPinned: note.isPinned ?? false,
    lastOpened: note.lastOpened || note.updatedAt || note.createdAt,
    versions: note.versions || [],
    notebookIds: note.notebookIds || [], // Notes can belong to multiple notebooks
    // Always recalculate word count and reading time from current body
    wordCount: calculateWordCount(body),
    readingTime: calculateReadingTime(body),
    revisionReminder: note.revisionReminder || {
      enabled: false,
      days: 7,
      lastNotified: null
    }
  };
};

export const storage = {
  // Allow callers to await initialization readiness
  whenReady: async () => {
    return storageReadyPromise;
  },

  // Get all notes
  getAllNotes: async () => {
    try {
      // Ensure initialization/migration completed before first read
      await storageReadyPromise;
      if (useIndexedDB) {
        const notes = await indexedDBWrapper.getAllNotes();
        return notes.map(enhanceNote);
      } else {
        // Fallback to LocalStorage
        const notes = localStorage.getItem(STORAGE_KEY);
        return notes ? JSON.parse(notes).map(enhanceNote) : [];
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      // Always fallback to LocalStorage on error
      try {
        const notes = localStorage.getItem(STORAGE_KEY);
        return notes ? JSON.parse(notes).map(enhanceNote) : [];
      } catch (fallbackError) {
        console.error('LocalStorage fallback also failed:', fallbackError);
        return [];
      }
    }
  },

  // Save all notes (for LocalStorage compatibility)
  saveAllNotes: async (notes) => {
    try {
      if (useIndexedDB) {
        // Save each note individually in IndexedDB
        for (const note of notes) {
          await indexedDBWrapper.saveNote(enhanceNote(note));
        }
        return true;
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        return true;
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      return false;
    }
  },

  // Add a new note
  addNote: async (note) => {
    const newNote = enhanceNote({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: note.title || 'Untitled',
      body: note.body || '',
      tags: note.tags || [],
      keywords: note.keywords || [],
      notebookIds: note.notebookIds || [], // Support multiple notebooks
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    try {
      if (useIndexedDB) {
        await indexedDBWrapper.saveNote(newNote);
        return newNote;
      } else {
        const notes = await storage.getAllNotes();
        notes.push(newNote);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        return newNote;
      }
    } catch (error) {
      console.error('Error adding note:', error);
      return null;
    }
  },

  // Update an existing note (with version history)
  updateNote: async (id, updates) => {
    try {
      // Check if we're only updating lastOpened (shouldn't trigger updatedAt change)
      const isOnlyLastOpenedUpdate = Object.keys(updates).length === 1 && 'lastOpened' in updates;
      
      if (useIndexedDB) {
        const existingNote = await indexedDBWrapper.getNote(id);
        if (!existingNote) return null;

        // Save current version before updating (but not for lastOpened-only updates)
        if (!isOnlyLastOpenedUpdate) {
          await storage.saveVersion(id, {
            title: existingNote.title,
            body: existingNote.body,
            tags: existingNote.tags,
            keywords: existingNote.keywords
          });
        }

        const updatedNote = enhanceNote({
          ...existingNote,
          ...updates,
          // Only update updatedAt if we're changing actual content, not just lastOpened
          ...(isOnlyLastOpenedUpdate ? {} : { updatedAt: new Date().toISOString() }),
        });

        await indexedDBWrapper.saveNote(updatedNote);
        
        // Clean up old versions (keep only last 5)
        if (!isOnlyLastOpenedUpdate) {
          await indexedDBWrapper.deleteOldVersions(id, 5);
        }
        
        return updatedNote;
      } else {
        const notes = await storage.getAllNotes();
        const noteIndex = notes.findIndex(note => note.id === id);
        
        if (noteIndex === -1) return null;

        // Save version in note's versions array (but not for lastOpened-only updates)
        const existingNote = notes[noteIndex];
        let limitedVersions = existingNote.versions || [];
        
        if (!isOnlyLastOpenedUpdate) {
          const versions = [...limitedVersions];
          versions.push({
            title: existingNote.title,
            body: existingNote.body,
            tags: existingNote.tags,
            keywords: existingNote.keywords,
            timestamp: new Date().toISOString()
          });

          // Keep only last 5 versions
          limitedVersions = versions.slice(-5);
        }

        notes[noteIndex] = enhanceNote({
          ...existingNote,
          ...updates,
          versions: limitedVersions,
          // Only update updatedAt if we're changing actual content, not just lastOpened
          ...(isOnlyLastOpenedUpdate ? {} : { updatedAt: new Date().toISOString() }),
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        return notes[noteIndex];
      }
    } catch (error) {
      console.error('Error updating note:', error);
      return null;
    }
  },

  // Delete a note
  deleteNote: async (id) => {
    try {
      if (useIndexedDB) {
        await indexedDBWrapper.deleteNote(id);
        return true;
      } else {
        const notes = await storage.getAllNotes();
        const filteredNotes = notes.filter(note => note.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredNotes));
        return true;
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  },

  // Get a single note by ID
  getNote: async (id) => {
    try {
      if (useIndexedDB) {
        const note = await indexedDBWrapper.getNote(id);
        return note ? enhanceNote(note) : null;
      } else {
        const notes = await storage.getAllNotes();
        return notes.find(note => note.id === id) || null;
      }
    } catch (error) {
      console.error('Error getting note:', error);
      return null;
    }
  },

  // Update lastOpened timestamp
  updateLastOpened: async (id) => {
    try {
      const note = await storage.getNote(id);
      if (!note) return null;

      return await storage.updateNote(id, {
        lastOpened: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating lastOpened:', error);
      return null;
    }
  },

  // Save version to history
  saveVersion: async (noteId, versionData) => {
    try {
      if (useIndexedDB) {
        await indexedDBWrapper.saveVersion(noteId, versionData);
      }
      // For LocalStorage, versions are saved within the note object in updateNote
      return true;
    } catch (error) {
      console.error('Error saving version:', error);
      return false;
    }
  },

  // Get version history for a note
  getVersions: async (noteId) => {
    try {
      if (useIndexedDB) {
        const versions = await indexedDBWrapper.getVersions(noteId);
        // Sort by timestamp descending
        return versions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      } else {
        const note = await storage.getNote(noteId);
        return note?.versions || [];
      }
    } catch (error) {
      console.error('Error getting versions:', error);
      return [];
    }
  },

  // Search notes by query
  searchNotes: async (query) => {
    const notes = await storage.getAllNotes();
    if (!query.trim()) return notes;

    const lowercaseQuery = query.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowercaseQuery) ||
      note.body.toLowerCase().includes(lowercaseQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  },

  // Filter notes by tags
  filterNotesByTags: async (tags) => {
    const notes = await storage.getAllNotes();
    if (!tags.length) return notes;

    return notes.filter(note => 
      tags.some(tag => note.tags.includes(tag))
    );
  },

  // Filter notes by notebook ID
  filterNotesByNotebook: async (notebookId) => {
    const notes = await storage.getAllNotes();
    return notes.filter(note => 
      note.notebookIds && note.notebookIds.includes(notebookId)
    );
  },

  // Filter notes by folder ID (get all notes in all notebooks in a folder)
  filterNotesByFolder: async (folderId, notebooks) => {
    const notes = await storage.getAllNotes();
    const folderNotebookIds = notebooks
      .filter(n => n.folderId === folderId)
      .map(n => n.id);
    
    return notes.filter(note => 
      note.notebookIds && note.notebookIds.some(id => folderNotebookIds.includes(id))
    );
  },

  // Get unassigned notes (notes not in any notebook)
  getUnassignedNotes: async () => {
    const notes = await storage.getAllNotes();
    return notes.filter(note => 
      !note.notebookIds || note.notebookIds.length === 0
    );
  },

  // Add note to notebook
  addNoteToNotebook: async (noteId, notebookId) => {
    const note = await storage.getNote(noteId);
    if (!note) return null;

    const notebookIds = note.notebookIds || [];
    if (!notebookIds.includes(notebookId)) {
      notebookIds.push(notebookId);
      return await storage.updateNote(noteId, { notebookIds });
    }
    return note;
  },

  // Remove note from notebook
  removeNoteFromNotebook: async (noteId, notebookId) => {
    const note = await storage.getNote(noteId);
    if (!note) return null;

    const notebookIds = (note.notebookIds || []).filter(id => id !== notebookId);
    return await storage.updateNote(noteId, { notebookIds });
  },

  // Clear all data (notes, settings, themes)
  clearAllData: async () => {
    try {
      if (useIndexedDB) {
        await indexedDBWrapper.clearAll();
      }
      
      // Clear LocalStorage keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('thoughtweaver_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  },

  // Export all data as JSON
  exportData: async () => {
    try {
      const notes = await storage.getAllNotes();
      const data = {
        notes,
        exportDate: new Date().toISOString(),
        version: '2.0'
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  },

  // Import data from JSON
  importData: async (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.notes && Array.isArray(data.notes)) {
        // Enhance each note before saving to ensure all required fields exist
        const enhancedNotes = data.notes.map(note => enhanceNote(note));
        await storage.saveAllNotes(enhancedNotes);
        return { success: true, count: enhancedNotes.length };
      }
      return { success: false, error: 'Invalid data format' };
    } catch (error) {
      console.error('Error importing data:', error);
      return { success: false, error: error.message };
    }
  }
};
