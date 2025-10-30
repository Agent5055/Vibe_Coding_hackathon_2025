# ThoughtWeaver Extra Themes

Collection of additional theme presets for ThoughtWeaver. Import these themes to customize your note-taking experience!

## 📦 Available Themes

### 🌲 Forest Green
A calm, nature-inspired theme with soft green tones.
- **File**: [forest-green.json](./forest-green.json)
- **Style**: Light
- **Mood**: Natural, Calming, Focused

### 🌅 Sunset Orange
Warm and vibrant orange theme reminiscent of golden hour.
- **File**: [sunset-orange.json](./sunset-orange.json)
- **Style**: Light
- **Mood**: Warm, Energetic, Creative

### 💜 Purple Haze
Artistic and creative purple theme for inspired thinking.
- **File**: [purple-haze.json](./purple-haze.json)
- **Style**: Light
- **Mood**: Creative, Artistic, Imaginative

### 🌊 Ocean Deep
Deep cyan/teal dark theme inspired by ocean depths.
- **File**: [ocean-deep.json](./ocean-deep.json)
- **Style**: Dark
- **Mood**: Deep, Mysterious, Contemplative

### ☕ Mocha
Rich, warm coffee-inspired dark theme.
- **File**: [mocha.json](./mocha.json)
- **Style**: Dark
- **Mood**: Cozy, Warm, Comfortable

## 📸 Screenshots

_Screenshots coming soon!_

<!-- Add screenshots here:
### Forest Green
![Forest Green Theme](./screenshots/forest-green.png)

### Sunset Orange
![Sunset Orange Theme](./screenshots/sunset-orange.png)

### Purple Haze
![Purple Haze Theme](./screenshots/purple-haze.png)

### Ocean Deep
![Ocean Deep Theme](./screenshots/ocean-deep.png)

### Mocha
![Mocha Theme](./screenshots/mocha.png)
-->

## 🎨 How to Import a Theme

1. **Open ThoughtWeaver** in your browser
2. **Navigate to Settings** (⚙️ icon)
3. **Scroll to "Theme Management"** section
4. **Click "Import Theme"** button
5. **Select** one of the JSON files from this folder
6. **Confirm** the import
7. **Switch themes** using the theme toggle in the header

## 🔧 How to Create Your Own Theme

Themes are simple JSON files with the following structure:

```json
{
  "id": "your-theme-id",
  "name": "Your Theme Name",
  "icon": "sun",
  "color": "blue",
  "bgClass": "bg-blue-50",
  "cardClass": "bg-white",
  "textClass": "text-gray-900",
  "borderClass": "border-blue-200"
}
```

### Field Descriptions:

- **id**: Unique identifier (lowercase, no spaces)
- **name**: Display name shown in theme selector
- **icon**: Either `"sun"` (light themes) or `"moon"` (dark themes)
- **color**: Icon color (`"orange"`, `"blue"`, `"pink"`, `"yellow"`, `"purple"`, `"green"`)
- **bgClass**: Tailwind class for main background
- **cardClass**: Tailwind class for card backgrounds
- **textClass**: Tailwind class for primary text
- **borderClass**: Tailwind class for borders

### Tips for Creating Themes:

1. **Light Themes**: Use `"sun"` icon and light color values (50-100 range)
2. **Dark Themes**: Use `"moon"` icon and dark color values (900-950 range)
3. **Contrast**: Ensure good readability between text and background
4. **Consistency**: Use colors from the same family for cohesion
5. **Test**: Import and preview your theme before sharing

## 📤 Sharing Your Themes

Created an amazing theme? Share it with the community!

1. Export your theme using the "Export Theme" button
2. Save the JSON file with a descriptive name
3. Add a screenshot (optional but recommended)
4. Submit a pull request to the repository

## 🎯 Built-in Themes

ThoughtWeaver comes with 6 built-in themes:

- **Classic Light** - Clean, traditional light theme
- **Sky Blue** - Soft blue light theme
- **Rose Pink** - Gentle pink light theme
- **Slate Dark** - Modern dark theme
- **Midnight Blue** - Deep blue dark theme
- **Pitch Black** - True black dark theme

## 🛠️ CSS Variables

Each theme modifies these CSS variables:

- `--bg-primary`: Main background color
- `--bg-secondary`: Secondary background (cards, panels)
- `--text-primary`: Primary text color
- `--text-secondary`: Secondary text color (muted)
- `--border-color`: Border and divider color
- `--primary-500`: Accent color for buttons and highlights

## 🔒 Privacy

All themes are stored locally in your browser's localStorage. No data is sent to any server.

## 📝 Notes

- Themes are compatible with both Compact and Cozy layout modes
- The app automatically adapts to your system's color scheme preference
- You can switch themes at any time without losing your notes
- Custom imported themes persist across sessions

---

**Enjoy customizing your ThoughtWeaver experience!** 🎨✨

