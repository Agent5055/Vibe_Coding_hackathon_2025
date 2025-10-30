import FlexSearch from 'flexsearch';

// Create a singleton search index
class SearchIndex {
  constructor() {
    this.index = new FlexSearch.Document({
      document: {
        id: 'id',
        index: ['title', 'body'],
        store: ['title', 'body', 'tags']
      },
      tokenize: 'forward',
      cache: true
    });
    this.indexed = false;
  }

  // Index all notes
  indexNotes(notes) {
    // Clear existing index
    this.index = new FlexSearch.Document({
      document: {
        id: 'id',
        index: ['title', 'body'],
        store: ['title', 'body', 'tags']
      },
      tokenize: 'forward',
      cache: true
    });

    // Add notes to index
    notes.forEach(note => {
      // Strip HTML for better search
      const bodyText = this.stripHTML(note.body || '');
      
      this.index.add({
        id: note.id,
        title: note.title || '',
        body: bodyText,
        tags: (note.tags || []).join(' ')
      });
    });

    this.indexed = true;
  }

  // Strip HTML tags from text
  stripHTML(html) {
    if (!html) return '';
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent || div.innerText || '';
    }
    // Fallback regex
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Search notes
  search(query, limit = 10) {
    if (!this.indexed || !query) return [];

    try {
      const results = this.index.search(query, { limit, enrich: true });
      
      // Flatten results from different fields
      const allResults = [];
      const seenIds = new Set();

      results.forEach(fieldResult => {
        if (fieldResult.result) {
          fieldResult.result.forEach(item => {
            if (!seenIds.has(item.id)) {
              seenIds.add(item.id);
              allResults.push({
                id: item.id,
                ...item.doc,
                field: fieldResult.field
              });
            }
          });
        }
      });

      return allResults.slice(0, limit);
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  // Get search snippet
  getSnippet(text, query, maxLength = 150) {
    if (!text || !query) return text.substring(0, maxLength);

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) {
      return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
    }

    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + query.length + 100);

    let snippet = text.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';

    return snippet;
  }
}

// Create singleton instance
const searchIndex = new SearchIndex();

export default searchIndex;

