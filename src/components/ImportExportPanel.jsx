import { useState } from 'react';
import { exportNoteAsMarkdown, exportNoteAsPDF, exportAsJSON, exportAllNotesAsMarkdown } from '../utils/exportUtils.js';
import { importMarkdownFile, importJSONBackup } from '../utils/importUtils.js';
import { storage } from '../utils/storage.js';
import { extractNoteKeywords } from '../utils/keywords.js';

const ImportExportPanel = ({ notes, onImportComplete }) => {
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  const handleExportAllJSON = () => {
    exportAsJSON(notes);
    setImportStatus('✅ Exported all notes as JSON backup');
    setTimeout(() => setImportStatus(''), 3000);
  };

  const handleExportAllMarkdown = () => {
    exportAllNotesAsMarkdown(notes);
    setImportStatus(`✅ Exporting ${notes.length} notes as Markdown files...`);
    setTimeout(() => setImportStatus(''), 3000);
  };

  const handleImportMarkdown = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImporting(true);
    setImportStatus(`Importing ${files.length} file(s)...`);

    try {
      let imported = 0;
      for (const file of files) {
        if (file.name.endsWith('.md')) {
          const note = await importMarkdownFile(file);
          // Extract keywords
          note.keywords = extractNoteKeywords(note);
          await storage.addNote(note);
          imported++;
        }
      }

      setImportStatus(`✅ Successfully imported ${imported} note(s)`);
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      setImportStatus(`❌ Error importing: ${error.message}`);
    } finally {
      setImporting(false);
      e.target.value = ''; // Reset input
      setTimeout(() => setImportStatus(''), 5000);
    }
  };

  const handleImportJSON = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    setImportStatus('Importing JSON backup...');

    try {
      const importedNotes = await importJSONBackup(file);
      
      for (const note of importedNotes) {
        // Re-extract keywords
        note.keywords = extractNoteKeywords(note);
        await storage.addNote(note);
      }

      setImportStatus(`✅ Successfully imported ${importedNotes.length} note(s)`);
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      setImportStatus(`❌ Error importing: ${error.message}`);
    } finally {
      setImporting(false);
      e.target.value = ''; // Reset input
      setTimeout(() => setImportStatus(''), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <div 
        className="rounded-xl p-6 shadow-sm"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--border-color)'
        }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span>📤</span>
          Export Data
        </h3>
        
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Export your notes to various formats for backup or use in other applications.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleExportAllJSON}
            className="w-full px-4 py-3 rounded-lg transition-colors text-left flex items-center justify-between hover:opacity-80"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <div>
              <div className="font-medium">Export as JSON</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Complete backup with all metadata ({notes.length} notes)
              </div>
            </div>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          <button
            onClick={handleExportAllMarkdown}
            className="w-full px-4 py-3 rounded-lg transition-colors text-left flex items-center justify-between hover:opacity-80"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <div>
              <div className="font-medium">Export as Markdown</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Individual .md files for each note
              </div>
            </div>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div 
        className="rounded-xl p-6 shadow-sm"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--border-color)'
        }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span>📥</span>
          Import Data
        </h3>
        
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Import notes from Markdown files or JSON backups.
        </p>

        <div className="space-y-3">
          <label className="block">
            <input
              type="file"
              accept=".md"
              multiple
              onChange={handleImportMarkdown}
              disabled={importing}
              className="hidden"
              id="import-markdown"
            />
            <div
              className="w-full px-4 py-3 rounded-lg transition-colors text-left flex items-center justify-between cursor-pointer hover:opacity-80"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
              onClick={() => document.getElementById('import-markdown').click()}
            >
              <div>
                <div className="font-medium">Import Markdown Files</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Select one or more .md files
                </div>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
          </label>

          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              disabled={importing}
              className="hidden"
              id="import-json"
            />
            <div
              className="w-full px-4 py-3 rounded-lg transition-colors text-left flex items-center justify-between cursor-pointer hover:opacity-80"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
              onClick={() => document.getElementById('import-json').click()}
            >
              <div>
                <div className="font-medium">Import JSON Backup</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Restore from a previous backup
                </div>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
          </label>
        </div>

        {importStatus && (
          <div 
            className="mt-4 p-3 rounded-lg text-sm"
            style={{ 
              backgroundColor: importStatus.includes('✅') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: importStatus.includes('✅') ? '#22c55e' : '#ef4444'
            }}
          >
            {importStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportExportPanel;

