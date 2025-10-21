import { findRelatedNotes } from './keywords.js';

// Generate Cytoscape-compatible graph data from notes
export const generateGraphData = (notes) => {
  if (!notes || notes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const nodes = notes.map(note => ({
    data: {
      id: note.id,
      label: note.title.length > 20 ? note.title.substring(0, 20) + '...' : note.title,
      fullTitle: note.title,
      body: note.body,
      tags: note.tags,
      keywords: note.keywords,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      // Node styling data
      nodeType: 'note',
      importance: note.keywords ? note.keywords.length : 0
    }
  }));

  const edges = [];
  const processedPairs = new Set();

  // Create edges based on keyword relationships
  notes.forEach(note => {
    if (!note.keywords || note.keywords.length === 0) return;

    const relatedNotes = findRelatedNotes(note, notes, 2);
    
    relatedNotes.forEach(relatedNote => {
      const pairId = [note.id, relatedNote.id].sort().join('-');
      
      if (!processedPairs.has(pairId)) {
        const sharedKeywords = note.keywords.filter(keyword => 
          relatedNote.keywords && relatedNote.keywords.includes(keyword)
        );

        edges.push({
          data: {
            id: `${note.id}-${relatedNote.id}`,
            source: note.id,
            target: relatedNote.id,
            label: `${sharedKeywords.length} shared`,
            weight: sharedKeywords.length,
            sharedKeywords: sharedKeywords
          }
        });

        processedPairs.add(pairId);
      }
    });
  });

  return { nodes, edges };
};

// Get graph layout configuration for Cytoscape
export const getGraphLayout = () => {
  try {
    return {
      name: 'cose-bilkent',
      animate: true,
      animationDuration: 500,
      nodeRepulsion: 4500,
      idealEdgeLength: 50,
      edgeElasticity: 0.45,
      nestingFactor: 0.1,
      gravity: 0.25,
      numIter: 2500,
      tile: true,
      tilingPaddingVertical: 10,
      tilingPaddingHorizontal: 10,
      gravityRangeCompound: 1.5,
      gravityCompound: 1.0,
      gravityRange: 3.8,
      initialEnergyOnIncremental: 0.3
    };
  } catch (e) {
    // Fallback to built-in cose layout
    return { 
      name: 'cose', 
      animate: true,
      nodeRepulsion: 4000,
      idealEdgeLength: 100,
      edgeElasticity: 0.45,
      nestingFactor: 0.1,
      gravity: 0.25,
      numIter: 1000
    };
  }
};

// Get node styling configuration
export const getNodeStyle = (currentTheme = 'light') => {
  const isDark = ['dark', 'purple', 'pitch'].includes(currentTheme);
  return {
  'label': 'data(label)',
  'background-color': isDark ? '#374151' : '#f8fafc',
  'border-color': isDark ? '#6b7280' : '#e2e8f0',
  'border-width': 2,
  'color': isDark ? '#f9fafb' : '#1f2937',
  'font-size': '12px',
  'font-weight': '500',
  'text-valign': 'center',
  'text-halign': 'center',
  'text-wrap': 'wrap',
  'text-max-width': '120px',
  'text-overflow-wrap': 'anywhere',
  'padding': '8px',
  'shape': 'roundrectangle',
  'width': 'label',
  'height': 'label',
  'min-width': '60px',
  'min-height': '30px'
  };
};

// Get edge styling configuration
export const getEdgeStyle = (currentTheme = 'light') => {
  const isDark = ['dark', 'purple', 'pitch'].includes(currentTheme);
  return {
  'width': 2,
  'line-color': isDark ? '#6b7280' : '#94a3b8',
  'target-arrow-color': isDark ? '#6b7280' : '#94a3b8',
  'target-arrow-shape': 'triangle',
  'curve-style': 'bezier',
  'opacity': 0.6,
  'label': 'data(label)',
  'font-size': '10px',
  'color': isDark ? '#9ca3af' : '#6b7280',
  'text-rotation': 'autorotate',
  'text-margin-y': -10
  };
};

// Get selected node style
export const getSelectedNodeStyle = (currentTheme = 'light') => {
  const isDark = ['dark', 'purple', 'pitch'].includes(currentTheme);
  return {
  'background-color': isDark ? '#3b82f6' : '#2563eb',
  'border-color': isDark ? '#1d4ed8' : '#1e40af',
  'border-width': 3,
  'color': '#ffffff',
  'font-weight': '600'
  };
};

// Get hover node style
export const getHoverNodeStyle = (currentTheme = 'light') => {
  const isDark = ['dark', 'purple', 'pitch'].includes(currentTheme);
  return {
  'background-color': isDark ? '#4b5563' : '#e2e8f0',
  'border-color': isDark ? '#9ca3af' : '#cbd5e1',
  'border-width': 2
  };
};

// Calculate node importance for sizing
export const calculateNodeImportance = (note) => {
  const keywordCount = note.keywords ? note.keywords.length : 0;
  const bodyLength = note.body ? note.body.length : 0;
  const tagCount = note.tags ? note.tags.length : 0;
  
  // Simple scoring: keywords (40%), body length (40%), tags (20%)
  const score = (keywordCount * 0.4) + (Math.min(bodyLength / 100, 10) * 0.4) + (tagCount * 0.2);
  
  return Math.max(1, Math.min(score, 10)); // Clamp between 1 and 10
};
