import { useState, useEffect } from 'react';
import { storage } from '../utils/storage.js';

const VersionHistoryModal = ({ noteId, isOpen, onClose, onRestore }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);

  useEffect(() => {
    if (isOpen && noteId) {
      loadVersions();
    }
  }, [isOpen, noteId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const versionHistory = await storage.getVersions(noteId);
      setVersions(versionHistory);
    } catch (error) {
      console.error('Error loading version history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (version) => {
    if (window.confirm('Restore this version? This will create a new version of the current note.')) {
      onRestore({
        title: version.title,
        body: version.body,
        tags: version.tags || [],
        keywords: version.keywords || []
      });
      onClose();
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPreview = (text, maxLength = 100) => {
    if (!text) return 'No content';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {/* Header */}
        <div className="p-6 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Version History
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            View and restore previous versions of this note
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                <span style={{ color: 'var(--text-secondary)' }}>Loading versions...</span>
              </div>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg-primary)' }}
              >
                <svg 
                  className="w-8 h-8" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                No version history
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Version history will appear here after you edit this note
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version, index) => (
                <div
                  key={version.id || index}
                  className="rounded-lg p-4 transition-all duration-200"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: selectedVersion === index ? 'var(--primary-color)' : 'var(--border-color)'
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium px-2 py-1 rounded bg-primary-100 text-primary-700">
                          Version {versions.length - index}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {formatDate(version.timestamp)}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {version.title || 'Untitled'}
                      </h4>
                      
                      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {getPreview(version.body)}
                      </p>
                      
                      {version.tags && version.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {version.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedVersion(selectedVersion === index ? null : index)}
                        className="px-3 py-1 text-sm rounded-lg transition-colors duration-200"
                        style={{
                          backgroundColor: selectedVersion === index ? 'var(--bg-secondary)' : 'transparent',
                          color: 'var(--text-primary)',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: 'var(--border-color)'
                        }}
                      >
                        {selectedVersion === index ? 'Hide' : 'View'}
                      </button>
                      
                      <button
                        onClick={() => handleRestore(version)}
                        className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
                      >
                        Restore
                      </button>
                    </div>
                  </div>

                  {/* Expanded view */}
                  {selectedVersion === index && (
                    <div 
                      className="mt-4 pt-4 space-y-2"
                      style={{ borderTop: '1px solid var(--border-color)' }}
                    >
                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                          Full Content:
                        </p>
                        <p 
                          className="text-sm whitespace-pre-wrap p-3 rounded"
                          style={{ 
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          {version.body || 'No content'}
                        </p>
                      </div>
                      
                      {version.keywords && version.keywords.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                            Keywords:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {version.keywords.map((keyword, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 rounded"
                                style={{ 
                                  backgroundColor: 'var(--bg-secondary)',
                                  color: 'var(--text-primary)'
                                }}
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="p-4 flex justify-end flex-shrink-0"
          style={{ borderTop: '1px solid var(--border-color)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg transition-colors duration-200"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryModal;

