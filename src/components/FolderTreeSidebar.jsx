import { useState, useEffect, useMemo } from 'react';
import folderManager from '../utils/folderManager.js';
import notebookManager from '../utils/notebookManager.js';

const FolderTreeSidebar = ({ 
  notes, 
  isCollapsed, 
  onToggle, 
  selectedItem, 
  onSelectItem,
  onCreateFolder,
  onCreateNotebook,
  onEditFolder,
  onEditNotebook,
  onDeleteFolder,
  onDeleteNotebook
}) => {
  const [folders, setFolders] = useState([]);
  const [notebooks, setNotebooks] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [expandedNotebooks, setExpandedNotebooks] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load folders and notebooks
  useEffect(() => {
    loadData();

    // Listen for updates
    const handleFoldersUpdate = () => loadData();
    const handleNotebooksUpdate = () => loadData();
    
    window.addEventListener('foldersUpdated', handleFoldersUpdate);
    window.addEventListener('notebooksUpdated', handleNotebooksUpdate);

    return () => {
      window.removeEventListener('foldersUpdated', handleFoldersUpdate);
      window.removeEventListener('notebooksUpdated', handleNotebooksUpdate);
    };
  }, []);

  const loadData = async () => {
    const loadedFolders = folderManager.getAll();
    const loadedNotebooks = await notebookManager.getAll();
    setFolders(loadedFolders);
    setNotebooks(loadedNotebooks);

    // Auto-expand folders on first load
    if (expandedFolders.size === 0 && loadedFolders.length > 0) {
      const rootFolders = loadedFolders.filter(f => !f.parentId);
      setExpandedFolders(new Set(rootFolders.map(f => f.id)));
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Get root notebooks (without folders)
  const rootNotebooks = useMemo(() => {
    return notebooks.filter(nb => !nb.folderId || nb.folderId === '');
  }, [notebooks]);

  // Get root folders (without parent)
  const rootFolders = useMemo(() => {
    return folders.filter(f => !f.parentId);
  }, [folders]);

  // Count notes by notebook
  const noteCounts = useMemo(() => {
    const counts = {
      unassigned: 0,
      notebooks: {},
      folders: {}
    };

    notes.forEach(note => {
      if (!note.notebookIds || note.notebookIds.length === 0) {
        counts.unassigned++;
      } else {
        note.notebookIds.forEach(notebookId => {
          counts.notebooks[notebookId] = (counts.notebooks[notebookId] || 0) + 1;
        });
      }
    });

    // Calculate folder counts (including nested folders)
    const calculateFolderCount = (folderId) => {
      const folderNotebooks = notebooks.filter(n => n.folderId === folderId);
      let count = folderNotebooks.reduce((sum, notebook) => {
        return sum + (counts.notebooks[notebook.id] || 0);
      }, 0);
      
      // Add counts from child folders
      const childFolders = folders.filter(f => f.parentId === folderId);
      childFolders.forEach(child => {
        count += calculateFolderCount(child.id);
      });
      
      return count;
    };

    folders.forEach(folder => {
      counts.folders[folder.id] = calculateFolderCount(folder.id);
    });

    return counts;
  }, [notes, folders, notebooks]);

  // Toggle folder expansion
  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Handle context menu
  const handleContextMenu = (e, item, type) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      type
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // Handle clicks outside context menu
  useEffect(() => {
    if (contextMenu) {
      const handleClick = () => closeContextMenu();
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  const handleSelect = (item, type) => {
    onSelectItem({ ...item, type });
  };

  // Recursive folder rendering
  const renderFolder = (folder, depth = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const folderNotebooks = notebooks.filter(n => n.folderId === folder.id);
    const childFolders = folders.filter(f => f.parentId === folder.id);

    return (
      <div key={folder.id} className="mb-1" style={{ marginLeft: `${depth * 12}px` }}>
        {/* Folder Item */}
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
            selectedItem?.type === 'folder' && selectedItem?.id === folder.id 
              ? 'bg-primary-100 dark:bg-primary-900' 
              : 'hover:opacity-80'
          }`}
          style={{ 
            backgroundColor: selectedItem?.type === 'folder' && selectedItem?.id === folder.id 
              ? undefined 
              : 'transparent'
          }}
          onClick={() => handleSelect(folder, 'folder')}
          onContextMenu={(e) => handleContextMenu(e, folder, 'folder')}
        >
          <div className="flex items-center space-x-2 flex-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
              className="p-0.5 hover:opacity-70"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span style={{ color: folder.color }}>{folder.icon}</span>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {folder.name}
            </span>
          </div>
          <span 
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-secondary)'
            }}
          >
            {noteCounts.folders[folder.id] || 0}
          </span>
        </div>

        {/* Notebooks in Folder */}
        {isExpanded && (
          <div className="ml-6 mt-1 space-y-1">
            {folderNotebooks.length === 0 && childFolders.length === 0 ? (
              <div className="px-3 py-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                No notebooks or folders
              </div>
            ) : (
              <>
                {folderNotebooks.map(notebook => (
                  <button
                    key={notebook.id}
                    onClick={() => handleSelect(notebook, 'notebook')}
                    onContextMenu={(e) => handleContextMenu(e, notebook, 'notebook')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-between ${
                      selectedItem?.type === 'notebook' && selectedItem?.id === notebook.id 
                        ? 'bg-primary-100 dark:bg-primary-900' 
                        : 'hover:opacity-80'
                    }`}
                    style={{ 
                      backgroundColor: selectedItem?.type === 'notebook' && selectedItem?.id === notebook.id 
                        ? undefined 
                        : 'transparent'
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <span style={{ color: notebook.color }}>{notebook.icon}</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {notebook.name}
                      </span>
                    </div>
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {noteCounts.notebooks[notebook.id] || 0}
                    </span>
                  </button>
                ))}
                
                {/* Render child folders recursively */}
                {childFolders.map(childFolder => renderFolder(childFolder, depth + 1))}
              </>
            )}
            
            {/* Add Notebook Button for this folder */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateNotebook(folder.id);
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg transition-colors duration-200 flex items-center space-x-2 text-xs hover:opacity-80"
              style={{ 
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent'
              }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Notebook</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  if (isCollapsed) {
    return (
      <div 
        className="fixed left-0 w-12 flex items-center justify-center z-30 border-r"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
          top: 'var(--sidebar-top, 4rem)',
          height: 'var(--sidebar-height, calc(100vh - 4rem))'
        }}
      >
        <button
          onClick={onToggle}
          className="p-2 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-primary)' }}
          title="Expand sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <>
      <div 
        className="fixed left-0 w-72 overflow-y-auto z-30 border-r sidebar-scrollbar"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
          top: 'var(--sidebar-top, 4rem)',
          height: 'var(--sidebar-height, calc(100vh - 4rem))'
        }}
      >
        {/* Header */}
        <div 
          className="sticky top-0 z-10 p-4 flex items-center justify-between border-b"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)'
          }}
        >
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Organization
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className={`p-1 hover:opacity-70 transition-opacity ${isRefreshing ? 'animate-spin' : ''}`}
              style={{ color: 'var(--text-secondary)' }}
              title="Refresh"
              disabled={isRefreshing}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={onToggle}
              className="p-1 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
              title="Collapse sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-2">
          {/* All Notes */}
          <button
            onClick={() => handleSelect({ type: 'all-notes' }, 'all-notes')}
            className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors duration-200 flex items-center justify-between ${
              selectedItem?.type === 'all-notes' ? 'bg-primary-100 dark:bg-primary-900' : 'hover:opacity-80'
            }`}
            style={{ 
              backgroundColor: selectedItem?.type === 'all-notes' ? undefined : 'transparent',
              color: 'var(--text-primary)'
            }}
          >
            <div className="flex items-center space-x-2">
              <span>📋</span>
              <span className="font-medium">All Notes</span>
            </div>
            <span 
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-secondary)'
              }}
            >
              {notes.length}
            </span>
          </button>

          <button
            onClick={() => handleSelect({ type: 'unassigned' }, 'unassigned')}
            className={`w-full text-left px-3 py-2 rounded-lg mb-3 transition-colors duration-200 flex items-center justify-between ${
              selectedItem?.type === 'unassigned' ? 'bg-primary-100 dark:bg-primary-900' : 'hover:opacity-80'
            }`}
            style={{ 
              backgroundColor: selectedItem?.type === 'unassigned' ? undefined : 'transparent',
              color: 'var(--text-primary)'
            }}
          >
            <div className="flex items-center space-x-2">
              <span>📄</span>
              <span className="font-medium">Unassigned</span>
            </div>
            <span 
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-secondary)'
              }}
            >
              {noteCounts.unassigned}
            </span>
          </button>

          {/* Notebooks Section */}
          <div className="mt-4 mb-2">
            <div className="px-3 flex items-center justify-between">
              <button
                onClick={() => setExpandedNotebooks(!expandedNotebooks)}
                className="flex items-center space-x-1 hover:opacity-70"
              >
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${expandedNotebooks ? 'rotate-90' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Notebooks
                </span>
              </button>
              <button
                onClick={() => onCreateNotebook(null)}
                className="p-1 hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
                title="Create root notebook"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Root Notebooks */}
            {expandedNotebooks && (
              <div className="mt-1 space-y-1">
                {rootNotebooks.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                    No root notebooks yet
                  </div>
                ) : (
                  rootNotebooks.map(notebook => (
                    <button
                      key={notebook.id}
                      onClick={() => handleSelect(notebook, 'notebook')}
                      onContextMenu={(e) => handleContextMenu(e, notebook, 'notebook')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 flex items-center justify-between ${
                        selectedItem?.type === 'notebook' && selectedItem?.id === notebook.id 
                          ? 'bg-primary-100 dark:bg-primary-900' 
                          : 'hover:opacity-80'
                      }`}
                      style={{ 
                        backgroundColor: selectedItem?.type === 'notebook' && selectedItem?.id === notebook.id 
                          ? undefined 
                          : 'transparent'
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <span style={{ color: notebook.color }}>{notebook.icon}</span>
                        <span style={{ color: 'var(--text-primary)' }}>
                          {notebook.name}
                        </span>
                      </div>
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ 
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {noteCounts.notebooks[notebook.id] || 0}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Folders Section */}
          <div className="mt-4 mb-2 px-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Folders
            </span>
            <button
              onClick={() => onCreateFolder(null)}
              className="p-1 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
              title="Create root folder"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Folders List */}
          {rootFolders.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              No folders yet. Create one to get started!
            </div>
          ) : (
            rootFolders.map(folder => renderFolder(folder, 0))
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 rounded-lg shadow-lg border py-1"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
            minWidth: '150px'
          }}
        >
          <button
            onClick={() => {
              if (contextMenu.type === 'folder') {
                onEditFolder(contextMenu.item);
              } else {
                onEditNotebook(contextMenu.item);
              }
              closeContextMenu();
            }}
            className="w-full text-left px-4 py-2 hover:opacity-80 flex items-center space-x-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit</span>
          </button>
          <button
            onClick={() => {
              if (contextMenu.type === 'folder') {
                onDeleteFolder(contextMenu.item);
              } else {
                onDeleteNotebook(contextMenu.item);
              }
              closeContextMenu();
            }}
            className="w-full text-left px-4 py-2 hover:opacity-80 flex items-center space-x-2"
            style={{ color: '#ef4444' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      )}
    </>
  );
};

export default FolderTreeSidebar;
