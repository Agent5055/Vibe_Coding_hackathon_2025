// Parse frontmatter from markdown content
export const parseFrontmatter = (content) => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, body: content };
  }
  
  const [, frontmatterStr, body] = match;
  const frontmatter = {};
  
  // Parse frontmatter lines
  frontmatterStr.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // Remove quotes
      value = value.replace(/^["']|["']$/g, '');
      
      // Parse arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value
          .substring(1, value.length - 1)
          .split(',')
          .map(v => v.trim().replace(/^["']|["']$/g, ''));
      }
      
      // Parse booleans
      if (value === 'true') value = true;
      if (value === 'false') value = false;
      
      frontmatter[key] = value;
    }
  });
  
  return { frontmatter, body: body.trim() };
};

// Import markdown file and create note object
export const importMarkdownFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const { frontmatter, body } = parseFrontmatter(content);
        
        // Create note object
        const note = {
          id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: frontmatter.title || file.name.replace(/\.md$/, ''),
          body: body,
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
          isPinned: frontmatter.pinned || false,
          createdAt: frontmatter.date || new Date().toISOString(),
          updatedAt: frontmatter.updated || new Date().toISOString(),
          lastOpened: new Date().toISOString(),
          keywords: [],
          wordCount: body.split(/\s+/).length,
          readingTime: Math.ceil(body.split(/\s+/).length / 200)
        };
        
        resolve(note);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(reader.error);
    };
    
    reader.readAsText(file);
  });
};

// Import JSON backup file
export const importJSONBackup = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate structure
        if (!data.notes || !Array.isArray(data.notes)) {
          reject(new Error('Invalid backup file format'));
          return;
        }
        
        // Ensure each note has required fields
        const notes = data.notes.map(note => ({
          ...note,
          id: note.id || `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: note.createdAt || new Date().toISOString(),
          updatedAt: note.updatedAt || new Date().toISOString(),
          tags: note.tags || [],
          keywords: note.keywords || [],
          isPinned: note.isPinned || false
        }));
        
        resolve(notes);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(reader.error);
    };
    
    reader.readAsText(file);
  });
};

// Detect [[wiki-links]] in text (for future feature)
export const detectWikiLinks = (text) => {
  const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
  const links = [];
  let match;
  
  while ((match = wikiLinkRegex.exec(text)) !== null) {
    links.push(match[1]);
  }
  
  return links;
};

