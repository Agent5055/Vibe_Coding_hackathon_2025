// Notebook Manager - Manages notebooks within folders
// Notebooks contain notes and belong to folders

import indexedDBWrapper from './indexedDB.js';

const STORAGE_KEY = 'thoughtweaver_notebooks';
let useIndexedDB = false;

// Initialize storage
const initStorage = async () => {
  try {
    if (indexedDBWrapper.isSupported) {
      await indexedDBWrapper.init();
      useIndexedDB = true;
      console.log('Using IndexedDB for notebook storage');
    } else {
      console.log('Using LocalStorage for notebook storage');
    }
  } catch (error) {
    console.warn('IndexedDB initialization failed for notebooks, using LocalStorage:', error);
    useIndexedDB = false;
  }
};

// Initialize on module load
initStorage().catch(err => {
  console.error('Notebook storage initialization error:', err);
  useIndexedDB = false;
});

// Default notebook colors and icons (can inherit from folder or be custom)
const DEFAULT_COLORS = [
  '#60a5fa', // light blue
  '#34d399', // light green
  '#fbbf24', // light amber
  '#f87171', // light red
  '#a78bfa', // light violet
  '#f472b6', // light pink
  '#22d3ee', // light cyan
  '#fb923c', // light orange
];

const DEFAULT_ICONS = [
  '📓', '📔', '📕', '📗', '📘', '📙', '📒', '🗒️',
  '📄', '📃', '📑', '🔖', '🏷️', '✏️', '🖊️', '✍️'
];

class NotebookManager {
  constructor() {
    this.notebooks = [];
  }

  // Load notebooks from storage
  async load() {
    try {
      if (useIndexedDB) {
        this.notebooks = await indexedDBWrapper.getAllNotebooks();
      } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        this.notebooks = stored ? JSON.parse(stored) : [];
      }
    } catch (error) {
      console.error('Error loading notebooks:', error);
      this.notebooks = [];
    }
    return this.notebooks;
  }

  // Save notebooks to storage
  async save() {
    try {
      if (!useIndexedDB) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notebooks));
      }
      // Dispatch event for other components to listen
      window.dispatchEvent(new CustomEvent('notebooksUpdated', { detail: this.notebooks }));
      return true;
    } catch (error) {
      console.error('Error saving notebooks:', error);
      return false;
    }
  }

  // Create a new notebook
  async create(notebookData) {
    // Validate name
    if (!notebookData.name || !notebookData.name.trim()) {
      throw new Error('Notebook name is required');
    }

    // Normalize folderId: allow root notebooks when not provided
    if (!notebookData.folderId) {
      notebookData.folderId = '';
    }

    // Check for duplicate names within the same folder
    await this.load();
    if (this.notebooks.some(n => 
      n.folderId === notebookData.folderId && 
      n.name.toLowerCase() === notebookData.name.toLowerCase()
    )) {
      throw new Error('A notebook with this name already exists in this folder');
    }

    const newNotebook = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: notebookData.name.trim(),
      folderId: notebookData.folderId || '',
      color: notebookData.color || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
      icon: notebookData.icon || DEFAULT_ICONS[0],
      description: notebookData.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (useIndexedDB) {
      await indexedDBWrapper.saveNotebook(newNotebook);
      await this.load();
    } else {
      this.notebooks.push(newNotebook);
      await this.save();
    }

    return newNotebook;
  }

  // Update an existing notebook
  async update(id, updates) {
    await this.load();
    const notebook = this.notebooks.find(n => n.id === id);
    
    if (!notebook) {
      throw new Error('Notebook not found');
    }

    // Validate name if being updated
    if (updates.name) {
      const name = updates.name.trim();
      if (!name) {
        throw new Error('Notebook name cannot be empty');
      }
      
      // Check for duplicate names within the same folder (excluding current notebook)
      const targetFolderId = updates.folderId || notebook.folderId;
      if (this.notebooks.some(n => 
        n.id !== id && 
        n.folderId === targetFolderId && 
        n.name.toLowerCase() === name.toLowerCase()
      )) {
        throw new Error('A notebook with this name already exists in this folder');
      }
      updates.name = name;
    }

    const updatedNotebook = {
      ...notebook,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (useIndexedDB) {
      await indexedDBWrapper.saveNotebook(updatedNotebook);
      await this.load();
    } else {
      const index = this.notebooks.findIndex(n => n.id === id);
      this.notebooks[index] = updatedNotebook;
      await this.save();
    }

    return updatedNotebook;
  }

  // Delete a notebook
  async delete(id) {
    if (useIndexedDB) {
      await indexedDBWrapper.deleteNotebook(id);
      await this.load();
    } else {
      await this.load();
      const index = this.notebooks.findIndex(n => n.id === id);
      if (index === -1) {
        throw new Error('Notebook not found');
      }
      this.notebooks.splice(index, 1);
      await this.save();
    }
    return true;
  }

  // Get all notebooks
  async getAll() {
    await this.load();
    return [...this.notebooks].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );
  }

  // Get notebook by ID
  async getById(id) {
    await this.load();
    return this.notebooks.find(n => n.id === id) || null;
  }

  // Get notebooks by folder ID
  async getByFolder(folderId) {
    await this.load();
    return this.notebooks
      .filter(n => n.folderId === folderId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  // Get notebook by name within a folder
  async getByName(folderId, name) {
    await this.load();
    return this.notebooks.find(n => 
      n.folderId === folderId && 
      n.name.toLowerCase() === name.toLowerCase()
    ) || null;
  }

  // Check if notebook exists
  async exists(id) {
    await this.load();
    return this.notebooks.some(n => n.id === id);
  }

  // Get notebook count
  async getCount() {
    await this.load();
    return this.notebooks.length;
  }

  // Get count by folder
  async getCountByFolder(folderId) {
    await this.load();
    return this.notebooks.filter(n => n.folderId === folderId).length;
  }

  // Delete all notebooks in a folder
  async deleteByFolder(folderId) {
    await this.load();
    const notebooksToDelete = this.notebooks.filter(n => n.folderId === folderId);
    
    for (const notebook of notebooksToDelete) {
      await this.delete(notebook.id);
    }
    
    return notebooksToDelete.length;
  }

  // Move notebook to different folder
  async moveToFolder(notebookId, newFolderId) {
    return await this.update(notebookId, { folderId: newFolderId });
  }

  // Export notebooks as JSON
  async export() {
    await this.load();
    return JSON.stringify(this.notebooks, null, 2);
  }

  // Import notebooks from JSON
  async import(jsonString, merge = false) {
    try {
      const importedNotebooks = JSON.parse(jsonString);
      
      if (!Array.isArray(importedNotebooks)) {
        throw new Error('Invalid notebook data format');
      }

      if (merge) {
        // Merge with existing notebooks, avoiding duplicates
        await this.load();
        const existingKeys = new Set(
          this.notebooks.map(n => `${n.folderId}:${n.name.toLowerCase()}`)
        );
        const newNotebooks = importedNotebooks.filter(n => 
          !existingKeys.has(`${n.folderId}:${n.name.toLowerCase()}`)
        );
        
        for (const notebook of newNotebooks) {
          if (useIndexedDB) {
            await indexedDBWrapper.saveNotebook(notebook);
          } else {
            this.notebooks.push(notebook);
          }
        }
      } else {
        // Replace all notebooks
        if (useIndexedDB) {
          // Clear existing and add new
          const existing = await this.getAll();
          for (const notebook of existing) {
            await indexedDBWrapper.deleteNotebook(notebook.id);
          }
          for (const notebook of importedNotebooks) {
            await indexedDBWrapper.saveNotebook(notebook);
          }
        } else {
          this.notebooks = importedNotebooks;
        }
      }

      await this.save();
      await this.load();
      return { success: true, count: this.notebooks.length };
    } catch (error) {
      console.error('Error importing notebooks:', error);
      return { success: false, error: error.message };
    }
  }

  // Clear all notebooks
  async clear() {
    if (useIndexedDB) {
      const notebooks = await this.getAll();
      for (const notebook of notebooks) {
        await indexedDBWrapper.deleteNotebook(notebook.id);
      }
    } else {
      this.notebooks = [];
      await this.save();
    }
    return true;
  }

  // Get default colors
  getDefaultColors() {
    return [...DEFAULT_COLORS];
  }

  // Get default icons
  getDefaultIcons() {
    return [...DEFAULT_ICONS];
  }
}

// Create singleton instance
const notebookManager = new NotebookManager();

export default notebookManager;
export { DEFAULT_COLORS, DEFAULT_ICONS };

