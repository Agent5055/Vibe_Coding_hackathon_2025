import { useMemo } from 'react';
import { getWordFrequency } from '../utils/keywords.js';
import HeatmapPanel from './HeatmapPanel.jsx';
import GrowthChart from './GrowthChart.jsx';

const StatsPanel = ({ notes }) => {
  const stats = useMemo(() => {
    if (notes.length === 0) {
      return {
        totalNotes: 0,
        totalTags: 0,
        totalKeywords: 0,
        tagDistribution: [],
        mostConnected: [],
        wordFrequency: [],
        totalWords: 0,
        totalReadingTime: 0,
        longestNote: null,
        avgKeywords: 0,
        hubNotes: [],
        isolatedNotes: []
      };
    }

    // Basic stats
    const totalNotes = notes.length;
    const allTags = notes.flatMap(note => note.tags || []);
    const uniqueTags = [...new Set(allTags)];
    const totalTags = uniqueTags.length;
    const totalKeywords = notes.reduce((sum, note) => sum + (note.keywords?.length || 0), 0);

    // NEW: Word count and reading time stats
    const totalWords = notes.reduce((sum, note) => sum + (note.wordCount || 0), 0);
    const totalReadingTime = notes.reduce((sum, note) => sum + (note.readingTime || 0), 0);
    
    // NEW: Longest note
    const longestNote = notes.reduce((longest, note) => {
      const noteLength = (note.body || '').length;
      const longestLength = longest ? (longest.body || '').length : 0;
      return noteLength > longestLength ? note : longest;
    }, null);
    
    // NEW: Average keywords per note
    const avgKeywords = totalNotes > 0 ? (totalKeywords / totalNotes).toFixed(1) : 0;

    // Tag distribution
    const tagCount = {};
    allTags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
    const tagDistribution = Object.entries(tagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    // Most connected notes (based on keyword relationships)
    const noteConnections = notes.map(note => {
      const connections = notes.filter(otherNote => {
        if (otherNote.id === note.id || !note.keywords || !otherNote.keywords) return false;
        const sharedKeywords = note.keywords.filter(keyword => 
          otherNote.keywords.includes(keyword)
        );
        return sharedKeywords.length >= 2;
      }).length;
      
      return { note, connections };
    });

    const mostConnected = noteConnections
      .sort((a, b) => b.connections - a.connections)
      .slice(0, 5)
      .filter(item => item.connections > 0);

    // NEW: Hub notes (notes with 5+ connections)
    const hubNotes = noteConnections
      .filter(item => item.connections >= 5)
      .sort((a, b) => b.connections - a.connections);

    // NEW: Isolated notes (notes with 0 connections)
    const isolatedNotes = noteConnections
      .filter(item => item.connections === 0);

    // Word frequency
    const wordFrequency = getWordFrequency(notes);

    return {
      totalNotes,
      totalTags,
      totalKeywords,
      tagDistribution,
      mostConnected,
      wordFrequency,
      totalWords,
      totalReadingTime,
      longestNote,
      avgKeywords,
      hubNotes,
      isolatedNotes
    };
  }, [notes]);

  if (notes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full rounded-xl" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            No analytics available
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Create some notes to see analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Knowledge Growth Chart */}
      <GrowthChart notes={notes} />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Notes</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalNotes}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center">
            <div className="p-3 bg-secondary-100 rounded-lg">
              <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Tags</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalTags}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Keywords</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalKeywords}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Note Statistics Section */}
      <div 
        className="rounded-xl p-6 shadow-sm"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--border-color)'
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Note Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {stats.totalWords.toLocaleString()}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Total Words
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {stats.totalReadingTime} min
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Reading Time
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {stats.longestNote ? (stats.longestNote.body || '').length : 0}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Longest Note
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {stats.avgKeywords}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Avg Keywords/Note
            </p>
          </div>
        </div>

        {stats.longestNote && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Your Longest Note:
            </p>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {stats.longestNote.title || 'Untitled'}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {(stats.longestNote.body || '').length} characters · {stats.longestNote.wordCount || 0} words
            </p>
          </div>
        )}
      </div>

      {/* Keyword Insights Section */}
      <HeatmapPanel notes={notes} />

      {/* Tag Distribution */}
      {stats.tagDistribution.length > 0 && (
        <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Most Used Tags</h3>
          <div className="space-y-3">
            {stats.tagDistribution.map(([tag, count], index) => (
              <div key={tag} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>#{index + 1}</span>
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                    {tag}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 rounded-full h-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(count / stats.tagDistribution[0][1]) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right" style={{ color: 'var(--text-primary)' }}>
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Network Overview Section */}
      <div 
        className="rounded-xl p-6 shadow-sm"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--border-color)'
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Network Overview
        </h3>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-500">
              {stats.mostConnected.length}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Connected Notes
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold text-green-500">
              {stats.hubNotes.length}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Hub Notes
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-500">
              {stats.isolatedNotes.length}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Isolated Notes
            </p>
          </div>
        </div>

        {/* Most Connected Notes */}
        {stats.mostConnected.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Most Connected Notes
            </h4>
          <div className="space-y-3">
            {stats.mostConnected.map(({ note, connections }, index) => (
              <div key={note.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>#{index + 1}</span>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {note.title || 'Untitled'}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {note.keywords?.length || 0} keywords
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {connections} connections
                  </span>
                </div>
              </div>
            ))}
          </div>
          </div>
        )}

        {/* Hub Notes (5+ connections) */}
        {stats.hubNotes.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Hub Notes (5+ connections)
            </h4>
            <div className="flex flex-wrap gap-2">
              {stats.hubNotes.map(({ note, connections }) => (
                <span
                  key={note.id}
                  className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700"
                  title={`${connections} connections`}
                >
                  {note.title || 'Untitled'} ({connections})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Isolated Notes */}
        {stats.isolatedNotes.length > 0 && (
          <div>
            <h4 className="text-md font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Isolated Notes
            </h4>
            <div className="flex flex-wrap gap-2">
              {stats.isolatedNotes.slice(0, 10).map(({ note }) => (
                <span
                  key={note.id}
                  className="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-700"
                >
                  {note.title || 'Untitled'}
                </span>
              ))}
              {stats.isolatedNotes.length > 10 && (
                <span className="px-3 py-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  +{stats.isolatedNotes.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Word Frequency Chart - Now deprecated in favor of Heatmap, but keep for compatibility */}
      {stats.wordFrequency.length > 0 && (
        <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Most Frequent Words</h3>
          <div className="space-y-3">
            {stats.wordFrequency.slice(0, 10).map(([word, count], index) => (
              <div key={word} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>#{index + 1}</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{word}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 rounded-full h-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(count / stats.wordFrequency[0][1]) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right" style={{ color: 'var(--text-primary)' }}>
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;
