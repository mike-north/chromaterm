---
'chromaterm': minor
---

Add light/dark mode detection helpers for CLI applications.

**System Appearance Detection:**

- `detectAppearance()` - Async detection of OS light/dark mode (macOS, GNOME, KDE, Windows)
- `detectAppearanceSync()` - Sync detection (macOS only)

**Terminal Background Detection:**

- `detectBackgroundMode()` - Detect light/dark based on terminal background luminance
- `isLightBackground(rgb)` - Check if an RGB color is light
- `calculateLuminance(rgb)` - WCAG-compliant luminance calculation

**Event Watching:**

- `watchAppearance()` - EventEmitter-based watcher for appearance changes with auto-cleanup

**Theme Integration:**

- New `detectAppearance` option for `detectTheme()` to include appearance in theme
- New `appearance` property on `Theme` interface
