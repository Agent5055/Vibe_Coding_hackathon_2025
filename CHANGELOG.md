# Changelog

All notable changes to this project will be documented in this file.

## 2025-10-31

### Added
- Documentation: New Organization (Folders & Notebooks) section in `README.md` describing:
  - Expandable/collapsible folder tree sidebar
  - Single numeric badge for direct item count (subfolders + notebooks)
  - Ability to create root notebooks without selecting a folder
  - Context menu for edit/delete, quick add, expand/collapse all, and Ctrl+B toggle

### Changed
- Sidebar: Simplified folder row UI to display only one clean numeric badge.

### Fixed
- Notebook creation: Create button is now enabled when a name is entered even without selecting a folder (creates root notebooks).
- Folder counts: Avoids showing 0 when there are items by displaying the item count.
