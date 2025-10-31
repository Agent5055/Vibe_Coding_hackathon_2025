# ThoughtWeaver - Smart Learning Tracker

A modern, intelligent note-taking application with mind-map visualization and automatic keyword linking. Built with React, Vite, and TailwindCSS.

![ThoughtWeaver Hero](./docs/screenshots/hero.png)

## Features

### Core Features
- **Rich Text Editor**: Beautiful Tiptap-based editor with markdown support, headings, lists, code blocks, and more
- **Interactive Checklists**: Create to-do items with checkboxes ([ ] and [x]) and track completion
- **Smart Note Management**: Create, edit, and delete notes with automatic keyword extraction
- **Pinned Notes**: Pin important notes to keep them at the top of your list
- **Daily Notes**: Quick access to create or open today's note for journaling
- **Mind Map Visualization**: Interactive graph view showing relationships between notes
- **Version History**: Track and restore previous versions of your notes (last 5 versions per note)
- **Linked Notes**: Automatic discovery of related notes based on shared keywords
- **Revision Reminders**: Get reminded to revisit notes you haven't opened in a while (configurable)
- **Full-Text Search**: Lightning-fast search powered by FlexSearch across all note content
- **"On This Day"**: See notes created or edited on this day in previous years
- **Advanced Analytics**: Comprehensive insights including:
  - Task tracking with completion rates
  - Knowledge growth charts
  - Topic heatmaps
  - Network analysis
- **Import/Export**: 
  - Export notes as Markdown (.md) or PDF
  - Export complete backups as JSON
  - Import markdown files with frontmatter support
- **8 Beautiful Themes**: 1 built-in default theme + 7 importable themes, each with light and dark variants (see [Themes Guide](THEMES.md))
- **Pin Notes**: Pin important notes to keep them at the top across all view modes
- **Read-Only View**: Double-click notes to view content without editing, with quick access to edit mode
- **Local Storage with IndexedDB**: Efficient storage for 500+ notes, all data stored locally in your browser
- **Responsive Design**: Works perfectly on desktop and mobile devices

### Organization (Folders & Notebooks)
- **Folder Tree Sidebar**: Expandable/collapsible folder tree with nested folders and notebooks
- **Clean Counts**: Single numeric badge shows direct item count (subfolders + notebooks)
- **Root Notebooks**: Create notebooks at the root level without selecting a folder
- **Context Menu**: Right-click folders/notebooks to edit or delete
- **Quick Add**: Add items directly inside a folder
- **Expand/Collapse All**: One-click expand/collapse for all folders
- **Sidebar Toggle**: Toggle sidebar with the button or keyboard shortcut (Ctrl+B)

![Sidebar & Organization](./docs/screenshots/sidebar-organization.png)
![Root Notebooks](./docs/screenshots/notebooks-root.png)

### Intelligence & Analytics
- **Knowledge Growth Chart**: Visualize your note-taking activity over time
- **Topic Heatmap**: See keyword frequency with color-coded intensity
- **Network Analysis**: Identify hub notes, isolated notes, and connection patterns
- **Reading Time Estimates**: Automatically calculated for each note
- **Smart Filters**: Filter mind map by tags, keyword count, and date ranges

### Customization
- **Layout Modes**: Choose between Compact and Cozy spacing
- **Mini-Map**: Configurable overview map for easier navigation
- **Theme Import/Export**: Share and use custom theme configurations
- **Snapshot Export**: Export your mind map as PNG images
- **Data Management**: Full backup/restore and reset capabilities

## Themes

ThoughtWeaver includes **8 stunning themes** (1 built-in + 7 importable) to personalize your experience:

### Built-in Theme
- 🎨 **Default** - Classic white (light) and black (dark) theme

### Importable Themes (in themes/ folder)
- 🦋 **Sky** - Calming blue tones (light & dark)
- 🌸 **Rose** - Gentle pink aesthetics (light & dark)
- 🌲 **Forest Green** - Nature-inspired greens (light & dark)
- 🌅 **Sunset Orange** - Warm orange tones (light & dark)
- 💜 **Purple Haze** - Creative purple shades (light & dark)
- 🌊 **Ocean Deep** - Ocean-inspired blues (light & dark)
- ☕ **Mocha** - Coffee-inspired browns (light & dark)

Each theme has both **light and dark variants**. Switch between light/dark modes with the toggle button in the header, and import new themes from Settings → Theme Management. Your preferences are automatically saved!

For detailed theme documentation, custom theme creation, and import instructions, see the [Themes Guide](THEMES.md).

👉 **[View Full Theme Documentation](THEMES.md)** for screenshots and details about each theme.

![Theme Management](./docs/screenshots/settings-themes.png)

## 🧩 Local Intelligence

ThoughtWeaver feels smart without needing any external AI or cloud services:

- **Automatic Keyword Linking**: Notes are automatically connected based on shared keywords, revealing hidden relationships in your knowledge
- **Smart Keyword Extraction**: Headings are weighted 3x more heavily for better topic detection
- **Tag Suggestions**: Smart tag recommendations based on your most frequently used words and patterns
- **Full-Text Search**: Instant search across all note content powered by FlexSearch
- **Task Analytics**: Automatic detection and tracking of checklist items across all notes
- **Real-time Analytics**: Comprehensive insights generated instantly from your notes:
  - Task completion tracking and statistics
  - Knowledge growth tracking over time
  - Topic frequency and connection heatmaps
  - Hub detection (highly connected notes that serve as knowledge centers)
  - Isolated note identification (notes that need more connections)
  - "On This Day" historical note discovery
- **Intelligent Reminders**: Get reminded to revisit notes you haven't opened recently (fully configurable)
- **Pattern Recognition**: The app learns your writing patterns to provide word counts, reading time estimates, and content analysis
- **Network Visualization**: See how your ideas connect through an interactive mind map with smart filtering

All intelligence features run **100% locally** in your browser - no external APIs, no tracking, no data ever leaves your device.

## 🔐 Privacy First

Your knowledge is yours alone. ThoughtWeaver is built with privacy as a core principle:

- **Zero External Connections**: No API calls, no tracking pixels, no analytics services
- **Local-Only Storage**: All notes, settings, and analytics stored in your browser using IndexedDB
- **No Account Required**: Start using immediately - no sign-up, no email, no personal information
- **Offline-First**: Works completely offline once loaded
- **Full Data Control**: 
  - Export all your data as JSON anytime
  - Import data from backups
  - Complete data wipe option when needed
- **Open Source**: Transparent code you can inspect and verify
- **No Cookies**: We don't use cookies or any tracking mechanisms

**Your notes never leave your device.** Period.

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS with custom design system
- **Visualization**: 
  - Cytoscape.js for mind-map rendering
  - Recharts for analytics charts and graphs
- **Storage**: 
  - IndexedDB for efficient data persistence (500+ notes support)
  - LocalStorage fallback for compatibility
- **Build**: Vite for fast development and optimized builds
- **Architecture**: 100% client-side, no backend required

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd thoughtweaver
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Deployment

### Render (Recommended)

1. Connect your GitHub repository to Render
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

### Other Static Hosts

The built application can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any static file hosting service

## Usage

### Creating Notes

1. Click the "New Note" button in the header
2. Enter a title and content
3. Add tags to categorize your notes
4. Save to automatically extract keywords

![Note Editor](./docs/screenshots/note-editor.png)

### Mind Map View

1. Switch to the "Mind Map" tab
2. See your notes as connected nodes
3. Click nodes to view note details
4. Use zoom and pan controls to navigate

![Mind Map](./docs/screenshots/mind-map.png)

### Analytics

1. Switch to the "Analytics" tab
2. View your learning statistics:
   - Total notes, tags, and keywords
   - Most used tags
   - Most connected notes
   - Word frequency analysis

![Growth Chart](./docs/screenshots/analytics-growth-chart.png)
![Topic Heatmap](./docs/screenshots/analytics-heatmap.png)

## Architecture

### Components

- **App.jsx**: Main application component with state management and routing
- **NoteForm.jsx**: Modal form for creating/editing notes with version history access
- **NoteList.jsx**: List view with search, filtering, and revision reminders
- **MindMap.jsx**: Cytoscape.js integration with filters, mini-map, and export
- **StatsPanel.jsx**: Comprehensive analytics dashboard with charts and insights
- **SettingsPanel.jsx**: Centralized configuration for all app settings
- **ThemeToggle.jsx**: Multi-theme switcher with light/dark mode toggle
- **NoteViewModal.jsx**: Read-only note viewer with double-click access

### New Intelligence Components

- **LinkedNotes.jsx**: Displays related notes based on keyword overlap
- **VersionHistoryModal.jsx**: Browse and restore previous note versions
- **RevisionReminder.jsx**: Highlights notes that need reviewing
- **HeatmapPanel.jsx**: Keyword frequency visualization
- **GrowthChart.jsx**: Knowledge growth tracking over time
- **FiltersPanel.jsx**: Advanced filtering for mind map
- **MiniMapOverlay.jsx**: Overview navigation for large graphs

### Utilities

- **storage.js**: IndexedDB wrapper with LocalStorage fallback for CRUD operations
- **indexedDB.js**: Efficient storage layer for 500+ notes
- **keywords.js**: Keyword extraction, relationship detection, and frequency analysis
- **graphData.js**: Graph data generation for Cytoscape.js
- **themes.js**: Theme management with import/export

### Key Features

1. **Automatic Keyword Extraction**: Uses stop-word filtering and frequency analysis
2. **Smart Note Linking**: Notes are connected based on shared keywords (minimum 2 shared)
3. **Version Tracking**: Automatic versioning with restore capability (last 5 versions)
4. **Responsive Mind Map**: Force-directed layout with interactive controls, filters, and mini-map
5. **Real-time Analytics**: Live statistics, charts, and insights
6. **Intelligent Reminders**: Track note activity and suggest reviews
7. **Theme Persistence**: Full theme customization with import/export

## Customization

### Styling

The application uses TailwindCSS with a custom design system. Key customization points:

- **Colors**: Defined in `tailwind.config.js`
- **Animations**: Custom keyframes in `src/index.css`
- **Components**: Reusable utility classes in `src/index.css`

### Adding Features

1. **New Note Fields**: Extend the note schema in `storage.js`
2. **Custom Analytics**: Add new metrics in `StatsPanel.jsx`
3. **Graph Layouts**: Modify layout options in `graphData.js`

## Future Implementations

The following features are planned for future releases:

### Advanced Organization
- **Note Templates**: Reusable templates for common note types (Meeting Notes, Daily Journal, etc.)

### Enhanced Linking
- **Manual Bi-directional Linking**: Wiki-style [[Note Title]] linking with autocomplete
- **Link Graph Visualization**: See manual links separately from keyword-based connections

### Power User Features
- **Command Palette (Ctrl+K)**: Quick access to all actions and notes
- **Keyboard Shortcuts**: Full keyboard navigation
- **Advanced Filtering**: Filter by notebooks, date ranges, and custom queries

### Collaboration & Sync
- **Optional Cloud Sync**: Sync notes across devices (while maintaining privacy)
- **Collaborative Editing**: Share and collaborate on specific notes
- **Export to Popular Formats**: Notion, Obsidian, Evernote compatibility

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- **Bundle Size**: ~850KB gzipped (includes Tiptap, FlexSearch, Recharts, and PDF export)
- **First Load**: <2s on 3G
- **Mind Map Rendering**: Optimized for 500+ nodes with efficient filtering
- **Search Performance**: FlexSearch provides sub-millisecond query times
- **Storage**: 
  - IndexedDB for scalability (tested with 1000+ notes)
  - Automatic migration from LocalStorage
  - Efficient indexed queries for fast retrieval
  - Support for notebooks and templates (v2 schema)
- **Real-time Analytics**: Computed on-demand with memoization
- **Responsive UI**: Smooth 60fps animations and transitions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the GitHub issues
2. Create a new issue with detailed description
3. Include browser and OS information

---

Built with ❤️ for better learning and knowledge organization.
