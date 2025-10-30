// IndexedDB wrapper for ThoughtWeaver
// Provides efficient storage for 500+ notes with fallback to LocalStorage

const DB_NAME = 'ThoughtWeaverDB';
const DB_VERSION = 1;
const STORES = {
  NOTES: 'notes',
  VERSIONS: 'versions',
  SETTINGS: 'settings',
  THEMES: 'themes'
};

class IndexedDBWrapper {
  constructor() {
    this.db = null;
    this.isSupported = this.checkSupport();
  }

  checkSupport() {
    return typeof indexedDB !== 'undefined';
  }

  async init() {
    if (!this.isSupported) {
      console.warn('IndexedDB not supported, falling back to LocalStorage');
      return false;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Notes store
        if (!db.objectStoreNames.contains(STORES.NOTES)) {
          const notesStore = db.createObjectStore(STORES.NOTES, { keyPath: 'id' });
          notesStore.createIndex('createdAt', 'createdAt', { unique: false });
          notesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          notesStore.createIndex('lastOpened', 'lastOpened', { unique: false });
        }

        // Versions store
        if (!db.objectStoreNames.contains(STORES.VERSIONS)) {
          const versionsStore = db.createObjectStore(STORES.VERSIONS, { keyPath: 'id', autoIncrement: true });
          versionsStore.createIndex('noteId', 'noteId', { unique: false });
          versionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }

        // Themes store
        if (!db.objectStoreNames.contains(STORES.THEMES)) {
          db.createObjectStore(STORES.THEMES, { keyPath: 'id' });
        }
      };
    });
  }

  // Generic transaction helper
  async transaction(storeName, mode, callback) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([storeName], mode);
        const store = transaction.objectStore(storeName);
        const request = callback(store);

        if (request) {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        } else {
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  // Notes operations
  async getAllNotes() {
    try {
      return await this.transaction(STORES.NOTES, 'readonly', (store) => store.getAll());
    } catch (error) {
      console.error('Error getting notes from IndexedDB:', error);
      return [];
    }
  }

  async getNote(id) {
    try {
      return await this.transaction(STORES.NOTES, 'readonly', (store) => store.get(id));
    } catch (error) {
      console.error('Error getting note from IndexedDB:', error);
      return null;
    }
  }

  async saveNote(note) {
    try {
      return await this.transaction(STORES.NOTES, 'readwrite', (store) => store.put(note));
    } catch (error) {
      console.error('Error saving note to IndexedDB:', error);
      throw error;
    }
  }

  async deleteNote(id) {
    try {
      return await this.transaction(STORES.NOTES, 'readwrite', (store) => store.delete(id));
    } catch (error) {
      console.error('Error deleting note from IndexedDB:', error);
      throw error;
    }
  }

  // Version operations
  async saveVersion(noteId, versionData) {
    try {
      const version = {
        noteId,
        ...versionData,
        timestamp: new Date().toISOString()
      };
      return await this.transaction(STORES.VERSIONS, 'readwrite', (store) => store.add(version));
    } catch (error) {
      console.error('Error saving version to IndexedDB:', error);
      throw error;
    }
  }

  async getVersions(noteId) {
    try {
      return await this.transaction(STORES.VERSIONS, 'readonly', (store) => {
        const index = store.index('noteId');
        return index.getAll(noteId);
      });
    } catch (error) {
      console.error('Error getting versions from IndexedDB:', error);
      return [];
    }
  }

  async deleteOldVersions(noteId, keepCount = 5) {
    try {
      const versions = await this.getVersions(noteId);
      if (versions.length <= keepCount) return;

      // Sort by timestamp descending and keep only the latest N
      const sorted = versions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const toDelete = sorted.slice(keepCount);

      for (const version of toDelete) {
        await this.transaction(STORES.VERSIONS, 'readwrite', (store) => store.delete(version.id));
      }
    } catch (error) {
      console.error('Error deleting old versions:', error);
    }
  }

  // Settings operations
  async getSetting(key) {
    try {
      const result = await this.transaction(STORES.SETTINGS, 'readonly', (store) => store.get(key));
      return result ? result.value : null;
    } catch (error) {
      console.error('Error getting setting from IndexedDB:', error);
      return null;
    }
  }

  async saveSetting(key, value) {
    try {
      return await this.transaction(STORES.SETTINGS, 'readwrite', (store) => 
        store.put({ key, value })
      );
    } catch (error) {
      console.error('Error saving setting to IndexedDB:', error);
      throw error;
    }
  }

  // Theme operations
  async getTheme(id) {
    try {
      return await this.transaction(STORES.THEMES, 'readonly', (store) => store.get(id));
    } catch (error) {
      console.error('Error getting theme from IndexedDB:', error);
      return null;
    }
  }

  async saveTheme(theme) {
    try {
      return await this.transaction(STORES.THEMES, 'readwrite', (store) => store.put(theme));
    } catch (error) {
      console.error('Error saving theme to IndexedDB:', error);
      throw error;
    }
  }

  async getAllThemes() {
    try {
      return await this.transaction(STORES.THEMES, 'readonly', (store) => store.getAll());
    } catch (error) {
      console.error('Error getting themes from IndexedDB:', error);
      return [];
    }
  }

  // Clear all data
  async clearAll() {
    try {
      if (!this.db) return;

      for (const storeName of Object.values(STORES)) {
        await this.transaction(storeName, 'readwrite', (store) => store.clear());
      }

      return true;
    } catch (error) {
      console.error('Error clearing IndexedDB:', error);
      return false;
    }
  }

  // Migration from LocalStorage
  async migrateFromLocalStorage() {
    try {
      const STORAGE_KEY = 'thoughtweaver_notes';
      const localNotes = localStorage.getItem(STORAGE_KEY);
      
      if (!localNotes) {
        console.log('No LocalStorage data to migrate');
        return { success: true, count: 0 };
      }

      const notes = JSON.parse(localNotes);
      let migrated = 0;

      for (const note of notes) {
        // Enhance note with new fields if missing
        const enhancedNote = {
          ...note,
          lastOpened: note.lastOpened || note.updatedAt || note.createdAt,
          versions: note.versions || [],
          wordCount: note.wordCount || this.calculateWordCount(note.body || ''),
          readingTime: note.readingTime || this.calculateReadingTime(note.body || '')
        };

        await this.saveNote(enhancedNote);
        migrated++;
      }

      console.log(`Migrated ${migrated} notes from LocalStorage to IndexedDB`);
      
      // Mark migration as complete
      await this.saveSetting('migrated_from_localstorage', true);
      
      return { success: true, count: migrated };
    } catch (error) {
      console.error('Error migrating from LocalStorage:', error);
      return { success: false, error };
    }
  }

  // Helper: Calculate word count
  calculateWordCount(text) {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  // Helper: Calculate reading time (words per minute = 200)
  calculateReadingTime(text) {
    const wordCount = this.calculateWordCount(text);
    return Math.ceil(wordCount / 200);
  }
}

// Create singleton instance
const indexedDB_instance = new IndexedDBWrapper();

export default indexedDB_instance;
export { STORES };

