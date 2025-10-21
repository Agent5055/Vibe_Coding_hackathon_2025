import { useMemo } from 'react';
import { getWordFrequency } from '../utils/keywords.js';

const StatsPanel = ({ notes }) => {
  const stats = useMemo(() => {
    if (notes.length === 0) {
      return {
        totalNotes: 0,
        totalTags: 0,
        totalKeywords: 0,
        tagDistribution: [],
        mostConnected: [],
        wordFrequency: []
      };
    }

    // Basic stats
    const totalNotes = notes.length;
    const allTags = notes.flatMap(note => note.tags || []);
    const uniqueTags = [...new Set(allTags)];
    const totalTags = uniqueTags.length;
    const totalKeywords = notes.reduce((sum, note) => sum + (note.keywords?.length || 0), 0);

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

    // Word frequency
    const wordFrequency = getWordFrequency(notes);

    return {
      totalNotes,
      totalTags,
      totalKeywords,
      tagDistribution,
      mostConnected,
      wordFrequency
    };
  }, [notes]);

  if (notes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 rounded-xl">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No analytics available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Create some notes to see analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Notes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalNotes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-secondary-100 dark:bg-secondary-900 rounded-lg">
              <svg className="w-6 h-6 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tags</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTags}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Keywords</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalKeywords}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tag Distribution */}
      {stats.tagDistribution.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Used Tags</h3>
          <div className="space-y-3">
            {stats.tagDistribution.map(([tag, count], index) => (
              <div key={tag} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{index + 1}</span>
                  <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm rounded-full">
                    {tag}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(count / stats.tagDistribution[0][1]) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most Connected Notes */}
      {stats.mostConnected.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Connected Notes</h3>
          <div className="space-y-3">
            {stats.mostConnected.map(({ note, connections }, index) => (
              <div key={note.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {note.title || 'Untitled'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {note.keywords?.length || 0} keywords
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {connections} connections
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Word Frequency Chart */}
      {stats.wordFrequency.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Frequent Words</h3>
          <div className="space-y-3">
            {stats.wordFrequency.slice(0, 10).map(([word, count], index) => (
              <div key={word} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{index + 1}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{word}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(count / stats.wordFrequency[0][1]) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
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
