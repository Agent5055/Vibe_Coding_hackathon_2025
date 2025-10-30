# ThoughtWeaver Custom Themes Guide

Welcome to the ThoughtWeaver custom themes documentation! This guide will help you create and share your own beautiful themes for ThoughtWeaver.

## Theme System Overview

ThoughtWeaver uses a **dual-variant theme system** where each theme consists of two variants:
- **Light mode** variant (e.g., `mytheme-light`)
- **Dark mode** variant (e.g., `mytheme-dark`)

The theme toggle button in the header switches between light and dark modes of the currently active theme, while the Settings panel allows you to select which theme base to use.

## Theme Structure

Each theme variant is defined as a JSON object with the following structure:

```json
{
  "id": "themename-light",
  "name": "Theme Name Light",
  "color": "blue"
}
```

### Required Fields

- **`id`** (string): Unique identifier for the theme variant
  - Must end with `-light` or `-dark`
  - Example: `ocean-light`, `ocean-dark`
  
- **`name`** (string): Display name for the theme variant
  - Should include "Light" or "Dark" suffix
  - Example: "Ocean Blue Light", "Ocean Blue Dark"
  
- **`color`** (string): Accent color for UI elements
  - Options: `blue`, `pink`, `purple`, `green`, `orange`, `gray`, `red`, `yellow`
  - Used for icons and highlights

## Creating a Custom Theme

### Step 1: Define Your Base Theme Name

Choose a unique base name for your theme (e.g., "forest", "sunset", "ocean").

### Step 2: Create Light and Dark Variants

You need to create **two variants** for your theme - one for light mode and one for dark mode.

#### Example: "Forest" Theme

**File: forest-theme.json**
```json
[
  {
    "id": "forest-light",
    "name": "Forest Light",
    "color": "green"
  },
  {
    "id": "forest-dark",
    "name": "Forest Dark",
    "color": "green"
  }
]
```

### Step 3: Define CSS Variables

Create a CSS file with your theme's color scheme. ThoughtWeaver uses CSS custom properties for theming:

**File: forest-theme.css**
```css
/* Forest Light Theme */
.theme-forest-light {
  --bg-primary: #f0fdf4;
  --bg-secondary: #ffffff;
  --text-primary: #14532d;
  --text-secondary: #15803d;
  --border-color: #bbf7d0;
}

/* Forest Dark Theme */
.theme-forest-dark {
  --bg-primary: #14532d;
  --bg-secondary: #166534;
  --text-primary: #f0fdf4;
  --text-secondary: #bbf7d0;
  --border-color: #15803d;
}

/* Optional: Cytoscape mind map gradient */
.theme-forest-light .cytoscape-container {
  background: linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%);
}

.theme-forest-dark .cytoscape-container {
  background: linear-gradient(135deg, #14532d 0%, #166534 100%);
}
```

### CSS Variable Reference

| Variable | Purpose | Example (Light) | Example (Dark) |
|----------|---------|-----------------|----------------|
| `--bg-primary` | Main background color | `#f9fafb` | `#1f2937` |
| `--bg-secondary` | Card/panel background | `#ffffff` | `#374151` |
| `--text-primary` | Primary text color | `#1f2937` | `#f9fafb` |
| `--text-secondary` | Secondary/muted text | `#6b7280` | `#d1d5db` |
| `--border-color` | Border and divider color | `#e5e7eb` | `#4b5563` |

## Importing Your Theme

1. Open ThoughtWeaver
2. Go to **Settings** (⚙️ icon)
3. Scroll to **Theme Management** section
4. Click **Import Theme**
5. Select your theme JSON file (must contain both light and dark variants)
6. Your theme will appear in the **Custom Themes** list

## Exporting Themes

To share your custom theme:

1. Make sure your custom theme is currently active
2. Go to **Settings** → **Theme Management**
3. Click **Export Current Theme**
4. Save the JSON file
5. Share it with others!

## Theme Naming Best Practices

### Base Theme Names
- Use lowercase with hyphens
- Keep it short and memorable
- Examples: `ocean`, `sunset`, `mocha`, `lavender`

### Variant IDs
- Always use the pattern: `basetheme-light` and `basetheme-dark`
- Examples: `ocean-light`, `ocean-dark`

### Display Names
- Use Title Case
- Include "Light" or "Dark" suffix
- Examples: "Ocean Light", "Ocean Dark"

## Example Themes

### Minimal Theme
```json
[
  {
    "id": "minimal-light",
    "name": "Minimal Light",
    "color": "gray"
  },
  {
    "id": "minimal-dark",
    "name": "Minimal Dark",
    "color": "gray"
  }
]
```

### Vibrant Theme
```json
[
  {
    "id": "vibrant-light",
    "name": "Vibrant Light",
    "color": "purple"
  },
  {
    "id": "vibrant-dark",
    "name": "Vibrant Dark",
    "color": "purple"
  }
]
```

## Color Palette Guidelines

### Light Themes
- Use light backgrounds (#f0-#ff range)
- Use dark text for contrast (#1f-#3f range)
- Ensure WCAG AA contrast ratio (4.5:1 minimum)

### Dark Themes
- Use dark backgrounds (#0c-#2f range)
- Use light text for contrast (#d1-#ff range)
- Maintain comfortable brightness (not pure black/white)

## Tips for Great Themes

1. **Test Both Variants**: Ensure both light and dark modes look great
2. **Check Contrast**: Text should be easily readable
3. **Consistency**: Use similar color families for both variants
4. **Accessibility**: Consider users with visual impairments
5. **Mind Map**: Don't forget to style the Cytoscape mind map gradient!

## Troubleshooting

### Theme Not Importing
- Ensure JSON is valid (use a JSON validator)
- Check that both `-light` and `-dark` variants are included
- Verify all required fields are present

### Colors Not Showing
- Make sure CSS variables are defined
- Check that class names match the theme IDs
- Verify CSS file is in the correct location

### Theme Deleted Accidentally
- If you have the JSON file, just re-import it
- ThoughtWeaver includes failsafe: deleting active theme reverts to default

## Sharing Your Themes

Want to share your theme with the community?
1. Export your theme as JSON
2. Create a matching CSS file
3. Share on GitHub, Discord, or social media
4. Tag `#ThoughtWeaverThemes`

## Default Themes Reference

ThoughtWeaver comes with 3 built-in themes:

1. **Classic** - Traditional gray tones
   - `classic-light`: Clean and professional
   - `classic-dark`: Comfortable slate gray

2. **Sky** - Blue tones
   - `sky-light`: Light blue and white
   - `sky-dark`: Deep midnight blue

3. **Rose** - Pink tones
   - `rose-light`: Soft rose pink
   - `rose-dark`: Deep rose crimson

## Available Extra Themes

ThoughtWeaver also includes 5 additional themes ready to import from the `themes/` folder:

4. **Forest Green** - Nature-inspired
5. **Sunset Orange** - Warm and vibrant
6. **Purple Haze** - Creative and artistic
7. **Ocean Deep** - Ocean-inspired blues
8. **Mocha** - Coffee-inspired browns

See `themes/themes.md` for full catalog with screenshots and descriptions.

## Advanced: CSS Customization

For advanced users, you can add custom CSS beyond the basic variables:

```css
/* Custom styling for specific elements */
.theme-mytheme-light .note-card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.theme-mytheme-dark .note-card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}
```

## Questions or Issues?

If you encounter any problems or have questions about creating themes:
- Check the GitHub Issues page
- Join our community Discord
- Read the main README.md

Happy theming! 🎨

