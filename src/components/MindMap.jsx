import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { generateGraphData, getGraphLayout, getNodeStyle, getEdgeStyle, getSelectedNodeStyle, getHoverNodeStyle } from '../utils/graphData.js';

// Register the layout
cytoscape.use(coseBilkent);

const MindMap = ({ notes, onNodeClick, selectedNoteId, currentTheme }) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current || notes.length === 0) {
      setIsLoading(false);
      return;
    }

    // Initialize Cytoscape
    const graphData = generateGraphData(notes);
    const cy = cytoscape({
      container: containerRef.current,
      elements: [...graphData.nodes, ...graphData.edges],
      style: [
        {
          selector: 'node',
          style: getNodeStyle(currentTheme)
        },
        {
          selector: 'node:selected',
          style: getSelectedNodeStyle(currentTheme)
        },
        {
          selector: 'node:hover',
          style: getHoverNodeStyle(currentTheme)
        },
        {
          selector: 'edge',
          style: getEdgeStyle(currentTheme)
        }
      ],
      layout: getGraphLayout(),
      minZoom: 0.1,
      maxZoom: 3,
      wheelSensitivity: 0.3,
      boxSelectionEnabled: false,
      selectionType: 'single'
    });

    cyRef.current = cy;

    // Event handlers
    cy.on('tap', 'node', (event) => {
      const node = event.target;
      const note = notes.find(n => n.id === node.id());
      if (note) {
        onNodeClick(note);
      }
    });

    cy.on('mouseover', 'node', (event) => {
      const node = event.target;
      const isDark = ['dark', 'purple', 'pitch'].includes(currentTheme);
      node.style('background-color', isDark ? '#4b5563' : '#e2e8f0');
      node.style('border-color', isDark ? '#9ca3af' : '#cbd5e1');
    });

    cy.on('mouseout', 'node', (event) => {
      const node = event.target;
      if (!node.selected()) {
        const isDark = ['dark', 'purple', 'pitch'].includes(currentTheme);
        node.style('background-color', isDark ? '#374151' : '#f8fafc');
        node.style('border-color', isDark ? '#6b7280' : '#e2e8f0');
      }
    });

    // Fit the graph to the container
    cy.ready(() => {
      cy.fit();
      setIsLoading(false);
    });

    return () => {
      cy.destroy();
    };
  }, [notes, currentTheme]);

  // Update selected node
  useEffect(() => {
    if (cyRef.current && selectedNoteId) {
      cyRef.current.elements().unselect();
      const selectedNode = cyRef.current.getElementById(selectedNoteId);
      if (selectedNode.length > 0) {
        selectedNode.select();
        cyRef.current.center(selectedNode);
      }
    }
  }, [selectedNoteId]);

  // Update styles when theme changes
  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.style()
        .selector('node')
        .style(getNodeStyle(currentTheme))
        .update();

      cyRef.current.style()
        .selector('node:selected')
        .style(getSelectedNodeStyle(currentTheme))
        .update();

      cyRef.current.style()
        .selector('node:hover')
        .style(getHoverNodeStyle(currentTheme))
        .update();

      cyRef.current.style()
        .selector('edge')
        .style(getEdgeStyle(currentTheme))
        .update();
    }
  }, [currentTheme]);

  if (notes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 rounded-xl">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No notes to visualize
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Create some notes to see them in the mind map
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Loading mind map...</span>
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={() => cyRef.current?.fit()}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          title="Fit to view"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
        
        <button
          onClick={() => cyRef.current?.center()}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          title="Center view"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MindMap;
