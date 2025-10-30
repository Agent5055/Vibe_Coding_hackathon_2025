// Folder Manager - Manages hierarchical folder structure
// Folders are top-level organizational containers for notebooks

const STORAGE_KEY = 'thoughtweaver_folders';

// Default folder colors and icons
const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

const DEFAULT_ICONS = [
  '📁', '📂', '📚', '📖', '📝', '📋', '📌', '🗂️',
  '🎯', '💼', '🎨', '🔬', '💡', '🌟', '🚀', '🏆'
];

class FolderManager {
  constructor() {
    this.folders = [];
    this.load();
  }

  // Load folders from localStorage
  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      this.folders = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading folders:', error);
      this.folders = [];
    }
  }

  // Save folders to localStorage
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.folders));
      // Dispatch event for other components to listen
      window.dispatchEvent(new CustomEvent('foldersUpdated', { detail: this.folders }));
      return true;
    } catch (error) {
      console.error('Error saving folders:', error);
      return false;
    }
  }

  // Create a new folder
  create(folderData) {
    // Validate name
    if (!folderData.name || !folderData.name.trim()) {
      throw new Error('Folder name is required');
    }

    // Check for duplicate names
    if (this.folders.some(f => f.name.toLowerCase() === folderData.name.toLowerCase())) {
      throw new Error('A folder with this name already exists');
    }

    const newFolder = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: folderData.name.trim(),
      color: folderData.color || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
      icon: folderData.icon || DEFAULT_ICONS[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.folders.push(newFolder);
    this.save();
    return newFolder;
  }

  // Update an existing folder
  update(id, updates) {
    const index = this.folders.findIndex(f => f.id === id);
    if (index === -1) {
      throw new Error('Folder not found');
    }

    // Validate name if being updated
    if (updates.name) {
      const name = updates.name.trim();
      if (!name) {
        throw new Error('Folder name cannot be empty');
      }
      
      // Check for duplicate names (excluding current folder)
      if (this.folders.some(f => f.id !== id && f.name.toLowerCase() === name.toLowerCase())) {
        throw new Error('A folder with this name already exists');
      }
      updates.name = name;
    }

    this.folders[index] = {
      ...this.folders[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.save();
    return this.folders[index];
  }

  // Delete a folder
  delete(id) {
    const index = this.folders.findIndex(f => f.id === id);
    if (index === -1) {
      throw new Error('Folder not found');
    }

    this.folders.splice(index, 1);
    this.save();
    return true;
  }

  // Get all folders
  getAll() {
    return [...this.folders].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );
  }

  // Get folder by ID
  getById(id) {
    return this.folders.find(f => f.id === id) || null;
  }

  // Get folder by name
  getByName(name) {
    return this.folders.find(f => f.name.toLowerCase() === name.toLowerCase()) || null;
  }

  // Check if folder exists
  exists(id) {
    return this.folders.some(f => f.id === id);
  }

  // Get folder count
  getCount() {
    return this.folders.length;
  }

  // Export folders as JSON
  export() {
    return JSON.stringify(this.folders, null, 2);
  }

  // Import folders from JSON
  import(jsonString, merge = false) {
    try {
      const importedFolders = JSON.parse(jsonString);
      
      if (!Array.isArray(importedFolders)) {
        throw new Error('Invalid folder data format');
      }

      if (merge) {
        // Merge with existing folders, avoiding duplicates
        const existingNames = new Set(this.folders.map(f => f.name.toLowerCase()));
        const newFolders = importedFolders.filter(f => 
          !existingNames.has(f.name.toLowerCase())
        );
        this.folders = [...this.folders, ...newFolders];
      } else {
        // Replace all folders
        this.folders = importedFolders;
      }

      this.save();
      return { success: true, count: this.folders.length };
    } catch (error) {
      console.error('Error importing folders:', error);
      return { success: false, error: error.message };
    }
  }

  // Clear all folders
  clear() {
    this.folders = [];
    this.save();
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
const folderManager = new FolderManager();

export default folderManager;
export { DEFAULT_COLORS, DEFAULT_ICONS };

