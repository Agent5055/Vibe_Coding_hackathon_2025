import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const buttonClass = "p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors";
  const activeClass = "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300";

  return (
    <div className="border-b flex flex-wrap gap-1 p-2" style={{ borderColor: 'var(--border-color)' }}>
      {/* Text Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`${buttonClass} ${editor.isActive('bold') ? activeClass : ''}`}
        title="Bold (Ctrl+B)"
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
        </svg>
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`${buttonClass} ${editor.isActive('italic') ? activeClass : ''}`}
        title="Italic (Ctrl+I)"
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4M12 4v16m-2 0h4" transform="skewX(-15)" />
        </svg>
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`${buttonClass} ${editor.isActive('strike') ? activeClass : ''}`}
        title="Strikethrough"
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M8 5h8M9 19h6" />
        </svg>
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`${buttonClass} ${editor.isActive('code') ? activeClass : ''}`}
        title="Inline Code"
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`${buttonClass} ${editor.isActive('heading', { level: 1 }) ? activeClass : ''}`}
        title="Heading 1"
        type="button"
      >
        <span className="text-sm font-bold">H1</span>
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${buttonClass} ${editor.isActive('heading', { level: 2 }) ? activeClass : ''}`}
        title="Heading 2"
        type="button"
      >
        <span className="text-sm font-bold">H2</span>
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`${buttonClass} ${editor.isActive('heading', { level: 3 }) ? activeClass : ''}`}
        title="Heading 3"
        type="button"
      >
        <span className="text-sm font-bold">H3</span>
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${buttonClass} ${editor.isActive('bulletList') ? activeClass : ''}`}
        title="Bullet List"
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${buttonClass} ${editor.isActive('orderedList') ? activeClass : ''}`}
        title="Numbered List"
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h1v5H3m16-5h-4m0 0v16m0-16l-2 2m6-2h-4M3 14h1v5H3m16-5h-4" />
        </svg>
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`${buttonClass} ${editor.isActive('taskList') ? activeClass : ''}`}
        title="Task List"
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Quotes & Code Blocks */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`${buttonClass} ${editor.isActive('blockquote') ? activeClass : ''}`}
        title="Blockquote"
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`${buttonClass} ${editor.isActive('codeBlock') ? activeClass : ''}`}
        title="Code Block"
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Divider */}
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={buttonClass}
        title="Horizontal Rule"
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className={buttonClass}
        title="Undo (Ctrl+Z)"
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </button>
      
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className={buttonClass}
        title="Redo (Ctrl+Y)"
        type="button"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
        </svg>
      </button>
    </div>
  );
};

const RichTextEditor = ({ content, onChange, placeholder = "Write your thoughts here..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 hover:text-primary-700 underline',
        },
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none focus:outline-none min-h-[200px] p-4',
        style: 'color: var(--text-primary);',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  return (
    <div 
      className="rounded-lg border overflow-hidden"
      style={{ 
        backgroundColor: 'var(--bg-primary)', 
        borderColor: 'var(--border-color)',
      }}
    >
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      
      <style>{`
        .ProseMirror {
          outline: none;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--text-secondary);
          opacity: 0.6;
          pointer-events: none;
          height: 0;
        }
        
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          color: var(--text-primary);
        }
        
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          color: var(--text-primary);
        }
        
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          color: var(--text-primary);
        }
        
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        
        .ProseMirror li {
          margin: 0.25em 0;
        }
        
        .ProseMirror code {
          background-color: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
          color: var(--text-primary);
          padding: 0.125em 0.25em;
          border-radius: 0.25em;
          font-size: 0.875em;
          font-family: 'Courier New', monospace;
        }
        
        .ProseMirror pre {
          background-color: rgba(0, 0, 0, 0.05);
          border-radius: 0.5em;
          padding: 0.75em 1em;
          margin: 0.5em 0;
          overflow-x: auto;
        }
        
        .ProseMirror pre code {
          background-color: transparent;
          padding: 0;
          color: var(--text-primary);
        }
        
        .ProseMirror blockquote {
          border-left: 3px solid var(--primary-500, #6366f1);
          padding-left: 1em;
          margin: 0.5em 0;
          color: var(--text-secondary);
          font-style: italic;
        }
        
        .ProseMirror hr {
          border: none;
          border-top: 2px solid var(--border-color);
          margin: 1em 0;
        }
        
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
        }
        
        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5em;
        }
        
        .ProseMirror ul[data-type="taskList"] li > label {
          flex-shrink: 0;
          margin-top: 0.125em;
        }
        
        .ProseMirror ul[data-type="taskList"] li > div {
          flex-grow: 1;
        }
        
        .ProseMirror ul[data-type="taskList"] input[type="checkbox"] {
          width: 1em;
          height: 1em;
          cursor: pointer;
          accent-color: var(--primary-500, #6366f1);
        }
        
        .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div {
          text-decoration: line-through;
          opacity: 0.6;
        }
        
        .ProseMirror a {
          color: var(--primary-600, #4f46e5);
          text-decoration: underline;
          cursor: pointer;
        }
        
        .ProseMirror a:hover {
          color: var(--primary-700, #4338ca);
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;

