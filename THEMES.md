# ThoughtWeaver Themes

ThoughtWeaver offers **6 beautiful themes** to personalize your learning experience. Choose from 3 light themes and 3 dark themes, each with its own unique color palette and aesthetic.

![Theme System Overview](./docs/screenshots/theme-overview.png)

## Available Themes

### Light Themes

#### 🌞 Classic Light
The default light theme with a clean, professional look featuring warm gray tones and excellent readability.

- **Color Palette**: Soft grays with white cards
- **Best For**: Extended reading sessions, professional documentation
- **Icon**: Orange sun

![Classic Light Theme](./docs/screenshots/theme-light.png)

---

#### 🌞 Sky Blue
A refreshing light theme with calming blue tones that evoke clarity and focus.

- **Color Palette**: Light blue background with white cards
- **Best For**: Creative brainstorming, morning work sessions
- **Icon**: Blue sun

![Sky Blue Theme](./docs/screenshots/theme-sky.png)

---

#### 🌞 Rose Pink
A gentle light theme with soft pink hues for a warm and inviting atmosphere.

- **Color Palette**: Subtle pink background with white cards
- **Best For**: Personal journaling, creative writing
- **Icon**: Pink sun

![Rose Pink Theme](./docs/screenshots/theme-rose.png)

---

### Dark Themes

#### 🌙 Slate Dark
A modern dark theme with balanced contrast, perfect for reducing eye strain during evening work.

- **Color Palette**: Dark gray background with slate cards
- **Best For**: Night-time study sessions, reducing eye fatigue
- **Icon**: Yellow moon

![Slate Dark Theme](./docs/screenshots/theme-dark.png)

---

#### 🌙 Midnight Blue
An elegant dark theme with deep blue tones that create a focused, immersive environment.

- **Color Palette**: Dark navy background with blue-tinted cards
- **Best For**: Deep focus work, late-night coding
- **Icon**: Blue moon

![Midnight Blue Theme](./docs/screenshots/theme-midnight.png)

---

#### 🌙 Pitch Black
The ultimate dark theme with true black background for maximum contrast and OLED-friendly design.

- **Color Palette**: Pure black background with charcoal cards
- **Best For**: OLED displays, minimal distraction, cinema-like focus
- **Icon**: Orange moon

![Pitch Black Theme](./docs/screenshots/theme-pitch.png)

---

## How to Use Themes

### Switching Themes

1. **Locate the Theme Toggle**: Find the theme button in the top-right corner of the application header
2. **Click to Cycle**: Click the button to cycle through all 6 themes in order
3. **Automatic Save**: Your theme preference is automatically saved to your browser's local storage
4. **Persistent Across Sessions**: Your chosen theme will be remembered when you return to the application

![Theme Toggle Button](./docs/screenshots/theme-toggle.png)

### Theme Toggle Button

The theme toggle button displays a dynamic icon that reflects the current theme:
- **Sun Icon**: Displayed for light themes (Classic Light, Sky Blue, Rose Pink)
- **Moon Icon**: Displayed for dark themes (Slate Dark, Midnight Blue, Pitch Black)
- **Color-Coded**: Each theme has a unique icon color for easy identification

## Technical Details

### Theme Implementation

ThoughtWeaver's theme system is built with modern CSS variables and React state management:

```javascript
// Themes are defined in src/utils/themes.js
export const THEMES = [
  { id: 'light', name: 'Classic Light', icon: 'sun', color: 'orange' },
  { id: 'sky', name: 'Sky Blue', icon: 'sun', color: 'blue' },
  { id: 'rose', name: 'Rose Pink', icon: 'sun', color: 'pink' },
  { id: 'dark', name: 'Slate Dark', icon: 'moon', color: 'yellow' },
  { id: 'midnight', name: 'Midnight Blue', icon: 'moon', color: 'blue' },
  { id: 'pitch', name: 'Pitch Black', icon: 'moon', color: 'orange' }
];
```

### CSS Variables

Each theme applies CSS custom properties to the document root:
- `--bg-primary`: Main background color
- `--bg-secondary`: Card and panel backgrounds
- `--text-primary`: Primary text color
- `--text-secondary`: Secondary text color
- `--border-color`: Border and divider colors
- `--accent-color`: Interactive elements and highlights

### Theme Persistence

Your theme preference is stored in the browser's localStorage:
```javascript
localStorage.setItem('thoughtweaver_theme', themeId);
```

When you return to the application, your saved theme is automatically loaded and applied.

## Accessibility Considerations

All themes are designed with accessibility in mind:
- **Sufficient Contrast**: All text meets WCAG 2.1 AA standards for contrast ratios
- **Color Independence**: Information is never conveyed by color alone
- **Keyboard Navigation**: Theme toggle is fully accessible via keyboard
- **Screen Reader Support**: Theme changes are announced to assistive technologies

## Performance

The theme system is optimized for performance:
- **CSS-Only Switching**: Theme changes use CSS classes, no re-renders required
- **Minimal Bundle Impact**: Theme definitions add <2KB to bundle size
- **Instant Apply**: Theme switching is instantaneous with no flicker
- **Efficient Storage**: Only theme ID is stored (not entire theme object)

## Customization

Want to add your own theme? The theme system is easily extensible:

1. Add your theme definition to `src/utils/themes.js`
2. Define CSS variables for your theme in `src/index.css`
3. Add the theme class selector (e.g., `.theme-yourtheme`)
4. Your theme will automatically appear in the cycle

---

**Enjoy personalizing your ThoughtWeaver experience with themes that match your mood and workflow!** 🎨

