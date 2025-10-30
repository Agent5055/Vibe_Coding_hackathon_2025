// Parse tasks from note content (both plain text and HTML)

// Extract tasks from HTML content (from Tiptap)
const extractTasksFromHTML = (html) => {
  if (!html || typeof document === 'undefined') return { total: 0, completed: 0, pending: 0 };
  
  const div = document.createElement('div');
  div.innerHTML = html;
  
  const checkboxes = div.querySelectorAll('input[type="checkbox"]');
  let completed = 0;
  let total = checkboxes.length;
  
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked || checkbox.hasAttribute('checked')) {
      completed++;
    }
  });
  
  return {
    total,
    completed,
    pending: total - completed
  };
};

// Extract tasks from markdown-style checkboxes in plain text
const extractTasksFromMarkdown = (text) => {
  if (!text) return { total: 0, completed: 0, pending: 0 };
  
  // Match [ ] for pending and [x] or [X] for completed
  const uncheckedRegex = /\[ \]/g;
  const checkedRegex = /\[[xX]\]/g;
  
  const pending = (text.match(uncheckedRegex) || []).length;
  const completed = (text.match(checkedRegex) || []).length;
  
  return {
    total: pending + completed,
    completed,
    pending
  };
};

// Main function to extract task stats from note
export const extractTaskStats = (note) => {
  if (!note || !note.body) {
    return { total: 0, completed: 0, pending: 0 };
  }
  
  const body = note.body;
  
  // Check if content is HTML (from rich text editor)
  if (body.includes('<') && body.includes('>')) {
    return extractTasksFromHTML(body);
  }
  
  // Otherwise, treat as markdown/plain text
  return extractTasksFromMarkdown(body);
};

// Get task statistics across all notes
export const getAllTaskStats = (notes) => {
  let totalTasks = 0;
  let completedTasks = 0;
  let pendingTasks = 0;
  const notesWithTasks = [];
  
  notes.forEach(note => {
    const stats = extractTaskStats(note);
    if (stats.total > 0) {
      totalTasks += stats.total;
      completedTasks += stats.completed;
      pendingTasks += stats.pending;
      notesWithTasks.push({
        note,
        ...stats,
        completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
      });
    }
  });
  
  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    notesWithTasks: notesWithTasks.sort((a, b) => b.pending - a.pending),
    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  };
};

// Get notes with most incomplete tasks
export const getNotesWithMostPendingTasks = (notes, limit = 5) => {
  const stats = getAllTaskStats(notes);
  return stats.notesWithTasks
    .filter(item => item.pending > 0)
    .slice(0, limit);
};

