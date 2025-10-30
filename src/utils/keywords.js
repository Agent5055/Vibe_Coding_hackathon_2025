// Simple keyword extraction with stop-word filtering
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its',
  'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with', 'would', 'you', 'your', 'this', 'these',
  'they', 'them', 'their', 'there', 'then', 'than', 'but', 'or', 'so', 'if', 'when', 'where', 'why',
  'how', 'what', 'who', 'which', 'can', 'could', 'should', 'would', 'may', 'might', 'must', 'shall',
  'have', 'had', 'has', 'having', 'do', 'does', 'did', 'doing', 'get', 'got', 'getting', 'go', 'went',
  'going', 'come', 'came', 'coming', 'see', 'saw', 'seeing', 'know', 'knew', 'knowing', 'think', 'thought',
  'thinking', 'take', 'took', 'taking', 'make', 'made', 'making', 'use', 'used', 'using', 'find', 'found',
  'finding', 'give', 'gave', 'giving', 'tell', 'told', 'telling', 'work', 'worked', 'working', 'call',
  'called', 'calling', 'try', 'tried', 'trying', 'ask', 'asked', 'asking', 'need', 'needed', 'needing',
  'feel', 'felt', 'feeling', 'become', 'became', 'becoming', 'leave', 'left', 'leaving', 'put', 'putting',
  'mean', 'meant', 'meaning', 'keep', 'kept', 'keeping', 'let', 'letting', 'begin', 'began', 'beginning',
  'seem', 'seemed', 'seeming', 'help', 'helped', 'helping', 'talk', 'talked', 'talking', 'turn', 'turned',
  'turning', 'start', 'started', 'starting', 'show', 'showed', 'showing', 'hear', 'heard', 'hearing',
  'play', 'played', 'playing', 'run', 'ran', 'running', 'move', 'moved', 'moving', 'live', 'lived', 'living',
  'believe', 'believed', 'believing', 'hold', 'held', 'holding', 'bring', 'brought', 'bringing', 'happen',
  'happened', 'happening', 'write', 'wrote', 'writing', 'provide', 'provided', 'providing', 'sit', 'sat',
  'sitting', 'stand', 'stood', 'standing', 'lose', 'lost', 'losing', 'pay', 'paid', 'paying', 'meet',
  'met', 'meeting', 'include', 'included', 'including', 'continue', 'continued', 'continuing', 'set',
  'setting', 'learn', 'learned', 'learning', 'change', 'changed', 'changing', 'lead', 'led', 'leading',
  'understand', 'understood', 'understanding', 'watch', 'watched', 'watching', 'follow', 'followed',
  'following', 'stop', 'stopped', 'stopping', 'create', 'created', 'creating', 'speak', 'spoke', 'speaking',
  'read', 'reading', 'allow', 'allowed', 'allowing', 'add', 'added', 'adding', 'spend', 'spent', 'spending',
  'grow', 'grew', 'growing', 'open', 'opened', 'opening', 'walk', 'walked', 'walking', 'win', 'won', 'winning',
  'offer', 'offered', 'offering', 'remember', 'remembered', 'remembering', 'love', 'loved', 'loving',
  'consider', 'considered', 'considering', 'appear', 'appeared', 'appearing', 'buy', 'bought', 'buying',
  'wait', 'waited', 'waiting', 'serve', 'served', 'serving', 'die', 'died', 'dying', 'send', 'sent', 'sending',
  'expect', 'expected', 'expecting', 'build', 'built', 'building', 'stay', 'stayed', 'staying', 'fall',
  'fell', 'falling', 'cut', 'cutting', 'reach', 'reached', 'reaching', 'kill', 'killed', 'killing',
  'remain', 'remained', 'remaining'
]);

// Extract text from HTML (for rich text content)
const stripHTML = (html) => {
  if (!html) return '';
  // Create a temporary div to parse HTML
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
  // Fallback: simple regex-based stripping
  return html.replace(/<[^>]*>/g, ' ');
};

// Extract keywords with weighted importance from headings
export const extractKeywords = (text, isHTML = false) => {
  if (!text || typeof text !== 'string') return [];

  let wordCount = {};
  
  // If it's HTML (rich text), extract headings separately for weighting
  if (isHTML && text.includes('<')) {
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.innerHTML = text;
      
      // Extract headings with higher weight
      const headings = div.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach((heading) => {
        const headingText = heading.textContent || '';
        const words = headingText
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(' ')
          .filter(word => 
            word.length > 2 && 
            !STOP_WORDS.has(word) && 
            !/^\d+$/.test(word)
          );
        
        // Weight heading words 3x more
        words.forEach(word => {
          wordCount[word] = (wordCount[word] || 0) + 3;
        });
      });
      
      // Get remaining text
      text = div.textContent || div.innerText || '';
    } else {
      // Fallback: extract text from HTML tags
      text = stripHTML(text);
    }
  }

  // Clean and tokenize text
  const cleanedText = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  if (!cleanedText) return Object.keys(wordCount).slice(0, 10);

  // Split into words and filter
  const words = cleanedText.split(' ')
    .filter(word => 
      word.length > 2 && // Minimum length
      !STOP_WORDS.has(word) && // Not a stop word
      !/^\d+$/.test(word) // Not just numbers
    );

  // Add regular words to count
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Sort by frequency and return top keywords
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10) // Top 10 keywords
    .map(([word]) => word);
};

// Extract keywords from a note (title + body)
export const extractNoteKeywords = (note) => {
  const titleText = note.title || '';
  const bodyText = note.body || '';
  
  // Check if body contains HTML (rich text)
  const isHTML = bodyText.includes('<') && bodyText.includes('>');
  
  // Extract body keywords
  const bodyKeywords = extractKeywords(bodyText, isHTML);
  
  // Extract title keywords (always plain text, weight 2x)
  const titleWords = titleText
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(' ')
    .filter(word => 
      word.length > 2 && 
      !STOP_WORDS.has(word) && 
      !/^\d+$/.test(word)
    );
  
  // Combine with weighting
  const wordCount = {};
  bodyKeywords.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  titleWords.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 2;
  });
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
};

// Find related notes based on keyword overlap
export const findRelatedNotes = (currentNote, allNotes, minSharedKeywords = 2) => {
  if (!currentNote.keywords || currentNote.keywords.length === 0) return [];

  const currentKeywords = new Set(currentNote.keywords);
  
  return allNotes
    .filter(note => note.id !== currentNote.id && note.keywords && note.keywords.length > 0)
    .map(note => {
      const noteKeywords = new Set(note.keywords);
      const sharedKeywords = [...currentKeywords].filter(keyword => noteKeywords.has(keyword));
      
      return {
        note,
        sharedKeywords,
        overlapCount: sharedKeywords.length
      };
    })
    .filter(result => result.overlapCount >= minSharedKeywords)
    .sort((a, b) => b.overlapCount - a.overlapCount)
    .map(result => result.note);
};

// Get word frequency across all notes
export const getWordFrequency = (notes) => {
  const wordCount = {};
  
  notes.forEach(note => {
    const text = `${note.title || ''} ${note.body || ''}`.trim();
    const keywords = extractKeywords(text);
    
    keywords.forEach(keyword => {
      wordCount[keyword] = (wordCount[keyword] || 0) + 1;
    });
  });

  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20); // Top 20 most frequent words
};
