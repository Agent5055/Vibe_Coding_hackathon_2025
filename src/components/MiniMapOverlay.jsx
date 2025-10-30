import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { generateGraphData, getNodeStyle, getEdgeStyle } from '../utils/graphData.js';

const MiniMapOverlay = ({ notes, mainCy, currentTheme }) => {
  const containerRef = useRef(null);
  const miniCyRef = useRef(null);

  // Get position from settings (default: bottom-right)
  const position = localStorage.getItem('thoughtweaver_minimap_position') || 'bottom-right';

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'top-right': 'top-20 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-left': 'top-20 left-4'
  };

  useEffect(() => {
    if (!containerRef.current || !notes || notes.length === 0) return;

    // Initialize mini Cytoscape instance
    const graphData = generateGraphData(notes);
    const miniCy = cytoscape({
      container: containerRef.current,
      elements: [...graphData.nodes, ...graphData.edges],
      style: [
        {
          selector: 'node',
          style: {
            ...getNodeStyle(currentTheme),
            'label': '', // No labels in mini map
            'width': 10,
            'height': 10
          }
        },
        {
          selector: 'edge',
          style: {
            ...getEdgeStyle(currentTheme),
            'width': 1
          }
        }
      ],
      layout: {
        name: 'cose-bilkent',
        idealEdgeLength: 30,
        nodeRepulsion: 2000,
        animate: false
      },
      userZoomingEnabled: false,
      userPanningEnabled: false,
      boxSelectionEnabled: false,
      autoungrabify: true,
      minZoom: 0.5,
      maxZoom: 0.5
    });

    miniCyRef.current = miniCy;

    // Fit the mini map
    miniCy.ready(() => {
      miniCy.fit();
      miniCy.zoom(0.5);
    });

    // Click handler - center main view on clicked node
    miniCy.on('tap', 'node', (event) => {
      if (mainCy) {
        const nodeId = event.target.id();
        const mainNode = mainCy.getElementById(nodeId);
        if (mainNode.length > 0) {
          mainCy.animate({
            center: { eles: mainNode },
            zoom: 1.5,
            duration: 300
          });
        }
      }
    });

    return () => {
      miniCy.destroy();
    };
  }, [notes, currentTheme]);

  // Sync viewport indicator when main view changes
  useEffect(() => {
    if (!mainCy || !miniCyRef.current) return;

    const updateViewport = () => {
      // Highlight visible nodes in mini map
      const mainExtent = mainCy.extent();
      const mainPan = mainCy.pan();
      const mainZoom = mainCy.zoom();

      miniCyRef.current.nodes().forEach(node => {
        const mainNode = mainCy.getElementById(node.id());
        if (mainNode.length > 0) {
          const pos = mainNode.renderedPosition();
          const bb = mainNode.renderedBoundingBox();
          
          // Check if node is visible in main viewport
          const isVisible = 
            pos.x >= mainExtent.x1 && pos.x <= mainExtent.x2 &&
            pos.y >= mainExtent.y1 && pos.y <= mainExtent.y2;

          // Highlight visible nodes
          node.style({
            'background-color': isVisible ? 'rgb(239, 68, 68)' : undefined // red-500 for visible
          });
        }
      });
    };

    mainCy.on('pan zoom', updateViewport);
    
    return () => {
      mainCy.off('pan zoom', updateViewport);
    };
  }, [mainCy]);

  if (!notes || notes.length === 0) return null;

  return (
    <div 
      className={`absolute ${positionClasses[position]} z-30 rounded-lg shadow-2xl overflow-hidden`}
      style={{ 
        width: '200px', 
        height: '150px',
        backgroundColor: 'var(--bg-secondary)',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: 'var(--border-color)'
      }}
    >
      <div 
        className="absolute top-0 left-0 right-0 px-2 py-1 text-xs font-medium"
        style={{ 
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-secondary)',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        Mini Map
      </div>
      
      <div 
        ref={containerRef} 
        className="w-full h-full pt-6"
        style={{ cursor: 'pointer' }}
      />
    </div>
  );
};

export default MiniMapOverlay;

