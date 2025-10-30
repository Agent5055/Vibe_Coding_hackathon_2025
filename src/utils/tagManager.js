// Tag Management Utilities
import { storage } from './storage.js';

const TAGS_STORAGE_KEY = 'thoughtweaver_managed_tags';

export const tagManager = {
  // Get all managed tags
  getAllTags: () => {
    try {
      const tags = localStorage.getItem(TAGS_STORAGE_KEY);
      return tags ? JSON.parse(tags) : [];
    } catch (error) {
      console.error('Error loading tags:', error);
      return [];
    }
  },
  
  // Add new tag
  addTag: (tag) => {
    if (!tag || typeof tag !== 'string') return false;
    
    const trimmedTag = tag.trim();
    if (!trimmedTag) return false;
    
    const tags = tagManager.getAllTags();
    
    // Check if tag already exists (case-insensitive)
    const existingTag = tags.find(t => t.toLowerCase() === trimmedTag.toLowerCase());
    if (existingTag) return false;
    
    tags.push(trimmedTag);
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags.sort()));
    return true;
  },
  
  // Delete tag
  deleteTag: (tag) => {
    const tags = tagManager.getAllTags().filter(t => t !== tag);
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
    return true;
  },
  
  // Update/rename tag
  updateTag: (oldTag, newTag) => {
    if (!newTag || typeof newTag !== 'string') return false;
    
    const trimmedNewTag = newTag.trim();
    if (!trimmedNewTag) return false;
    
    const tags = tagManager.getAllTags();
    const index = tags.indexOf(oldTag);
    
    if (index === -1) return false;
    
    // Check if new tag name already exists
    const existingTag = tags.find(t => t.toLowerCase() === trimmedNewTag.toLowerCase() && t !== oldTag);
    if (existingTag) return false;
    
    tags[index] = trimmedNewTag;
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags.sort()));
    return true;
  },
  
  // Get tag usage count
  getTagUsage: async (tag) => {
    try {
      const notes = await storage.getAllNotes();
      return notes.filter(note => note.tags?.includes(tag)).length;
    } catch (error) {
      console.error('Error getting tag usage:', error);
      return 0;
    }
  },
  
  // Get all tags with usage counts
  getTagsWithUsage: async () => {
    const tags = tagManager.getAllTags();
    const tagsWithUsage = await Promise.all(
      tags.map(async (tag) => ({
        name: tag,
        count: await tagManager.getTagUsage(tag)
      }))
    );
    return tagsWithUsage;
  },
  
  // Auto-sync: Add tags from notes to managed list
  syncTagsFromNotes: async () => {
    try {
      const notes = await storage.getAllNotes();
      const allNoteTags = [...new Set(notes.flatMap(n => n.tags || []))];
      
      allNoteTags.forEach(tag => {
        if (tag && tag.trim()) {
          tagManager.addTag(tag);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error syncing tags from notes:', error);
      return false;
    }
  },
  
  // Remove tag from all notes
  removeTagFromAllNotes: async (tag) => {
    try {
      const notes = await storage.getAllNotes();
      
      for (const note of notes) {
        if (note.tags?.includes(tag)) {
          const updatedTags = note.tags.filter(t => t !== tag);
          await storage.updateNote(note.id, { tags: updatedTags });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error removing tag from notes:', error);
      return false;
    }
  }
};

