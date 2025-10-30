import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

// Strip HTML tags to get plain text
const stripHTML = (html) => {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

// Convert HTML to basic markdown
const htmlToMarkdown = (html) => {
  if (!html) return '';
  
  let markdown = html;
  
  // Headers
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  
  // Bold
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  
  // Italic
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  
  // Strike
  markdown = markdown.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~');
  
  // Code
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  
  // Code blocks
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '\n```\n$1\n```\n');
  
  // Blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
    return '\n> ' + content.replace(/<[^>]*>/g, '').trim() + '\n\n';
  });
  
  // Links
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  
  // Lists
  markdown = markdown.replace(/<ul[^>]*data-type="taskList"[^>]*>(.*?)<\/ul>/gis, (match, content) => {
    let result = '\n';
    const items = content.match(/<li[^>]*data-type="taskItem"[^>]*>(.*?)<\/li>/gis);
    if (items) {
      items.forEach(item => {
        const isChecked = item.includes('data-checked="true"') || item.includes('checked');
        const text = item.replace(/<[^>]*>/g, '').trim();
        result += `- [${isChecked ? 'x' : ' '}] ${text}\n`;
      });
    }
    return result + '\n';
  });
  
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
    let result = '\n';
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gis);
    if (items) {
      items.forEach(item => {
        const text = item.replace(/<[^>]*>/g, '').trim();
        result += `- ${text}\n`;
      });
    }
    return result + '\n';
  });
  
  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
    let result = '\n';
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gis);
    if (items) {
      items.forEach((item, index) => {
        const text = item.replace(/<[^>]*>/g, '').trim();
        result += `${index + 1}. ${text}\n`;
      });
    }
    return result + '\n';
  });
  
  // Paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  
  // Horizontal rule
  markdown = markdown.replace(/<hr[^>]*>/gi, '\n---\n\n');
  
  // Line breaks
  markdown = markdown.replace(/<br[^>]*>/gi, '\n');
  
  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '');
  
  // Clean up excessive newlines
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  
  return markdown.trim();
};

// Export single note as Markdown
export const exportNoteAsMarkdown = (note) => {
  if (!note) return;
  
  const content = note.body || '';
  const isHTML = content.includes('<') && content.includes('>');
  const bodyText = isHTML ? htmlToMarkdown(content) : content;
  
  // Create frontmatter
  const frontmatter = [
    '---',
    `title: "${note.title || 'Untitled'}"`,
    `date: ${note.createdAt || new Date().toISOString()}`,
    `updated: ${note.updatedAt || new Date().toISOString()}`,
    note.tags && note.tags.length > 0 ? `tags: [${note.tags.map(t => `"${t}"`).join(', ')}]` : '',
    note.isPinned ? 'pinned: true' : '',
    '---',
    ''
  ].filter(Boolean).join('\n');
  
  const markdownContent = frontmatter + '\n' + bodyText;
  
  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
  const filename = `${(note.title || 'Untitled').replace(/[^a-z0-9]/gi, '_')}.md`;
  saveAs(blob, filename);
};

// Export all notes as a ZIP (simplified version - just exports as multiple files)
export const exportAllNotesAsMarkdown = async (notes) => {
  if (!notes || notes.length === 0) return;
  
  // For simplicity, export as individual files
  // In a production app, you'd use JSZip to create a proper zip file
  notes.forEach(note => {
    exportNoteAsMarkdown(note);
  });
};

// Export note as PDF
export const exportNoteAsPDF = (note) => {
  if (!note) return;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  
  let yPos = margin;
  
  // Title
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  const titleLines = doc.splitTextToSize(note.title || 'Untitled', maxWidth);
  doc.text(titleLines, margin, yPos);
  yPos += (titleLines.length * 8) + 10;
  
  // Metadata
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(128, 128, 128);
  
  const dateStr = note.createdAt ? new Date(note.createdAt).toLocaleDateString() : '';
  doc.text(`Created: ${dateStr}`, margin, yPos);
  yPos += 6;
  
  if (note.tags && note.tags.length > 0) {
    doc.text(`Tags: ${note.tags.join(', ')}`, margin, yPos);
    yPos += 10;
  } else {
    yPos += 5;
  }
  
  // Content
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  const content = note.body || '';
  const isHTML = content.includes('<') && content.includes('>');
  const bodyText = isHTML ? stripHTML(content) : content;
  
  const contentLines = doc.splitTextToSize(bodyText, maxWidth);
  
  contentLines.forEach(line => {
    if (yPos > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  });
  
  const filename = `${(note.title || 'Untitled').replace(/[^a-z0-9]/gi, '_')}.pdf`;
  doc.save(filename);
};

// Export data as JSON (for backup)
export const exportAsJSON = (notes) => {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    notes: notes
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  saveAs(blob, `thoughtweaver-backup-${new Date().toISOString().split('T')[0]}.json`);
};

