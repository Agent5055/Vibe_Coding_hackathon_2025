import { useMemo } from 'react';
import { getWordFrequency } from '../utils/keywords.js';

const HeatmapPanel = ({ notes }) => {
  const heatmapData = useMemo(() => {
    if (!notes || notes.length === 0) return [];
    
    const wordFreq = getWordFrequency(notes);
    
    // Get top 30 keywords for heatmap
    const topKeywords = wordFreq.slice(0, 30);
    
    if (topKeywords.length === 0) return [];
    
    // Calculate max frequency for normalization
    const maxFreq = topKeywords[0][1];
    
    // Map to include normalized opacity
    return topKeywords.map(([word, count]) => ({
      word,
      count,
      opacity: Math.max(0.3, (count / maxFreq)) // Min 30% opacity
    }));
  }, [notes]);

  if (heatmapData.length === 0) {
    return null;
  }

  // Color intensity based on frequency
  const getColorStyle = (opacity) => {
    // Using primary color with varying opacity
    return {
      backgroundColor: `rgba(59, 130, 246, ${opacity})`, // primary-500 blue
      color: opacity > 0.6 ? 'white' : 'rgb(29, 78, 216)' // Adjust text color for contrast
    };
  };

  return (
    <div 
      className="rounded-xl p-6 shadow-sm"
      style={{ 
        backgroundColor: 'var(--bg-secondary)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border-color)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Topic Heatmap
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Keyword frequency visualization
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.3)' }}></div>
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.5)' }}></div>
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.7)' }}></div>
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 1)' }}></div>
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="flex flex-wrap gap-2">
        {heatmapData.map(({ word, count, opacity }) => (
          <div
            key={word}
            className="px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 cursor-default shadow-sm"
            style={getColorStyle(opacity)}
            title={`${word}: ${count} occurrences`}
          >
            <span className="text-sm">{word}</span>
            <span className="ml-2 text-xs font-bold">({count})</span>
          </div>
        ))}
      </div>

      {/* Top keywords summary */}
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {heatmapData.length}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Top Keywords
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {heatmapData[0]?.count || 0}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Most Frequent
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {heatmapData.reduce((sum, item) => sum + item.count, 0)}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Total Uses
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapPanel;

