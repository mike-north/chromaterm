# chromaterm

## 0.1.0

### Minor Changes

- [#7](https://github.com/mike-north/chromaterm/pull/7) [`2bce7f2`](https://github.com/mike-north/chromaterm/commit/2bce7f255ccabd6a8f799cd85694e364254fef94) Thanks [@mike-north](https://github.com/mike-north)! - Add gradient builder with OKLCH interpolation for smooth, perceptually uniform color transitions.

  **1D Gradients:**
  - `createGradient(stops, options?)` - Create gradients with any number of color stops
  - Sample at any position with `gradient.at(t)` where t is 0-1
  - Support for looping gradients (seamless animation)
  - Configurable hue interpolation direction: `short`, `long`, `increasing`, `decreasing`
  - Optional easing functions for non-linear interpolation

  **2D Gradients:**
  - `createGradient2D({ x, y }, options?)` - Create gradients with separate X and Y axes
  - Sample at any coordinate with `gradient.at(x, y)`
  - Blend modes: `multiply`, `overlay`, `average`
  - Independent loop settings per axis

  **Color Interpolation:**
  - `interpolateOklch(color1, color2, t, hueDirection?)` - Direct OKLCH interpolation
  - OKLCH color space provides perceptually uniform transitions
  - Proper handling of achromatic (gray) colors

  **Updated Transforms:**
  - `fade()` now uses OKLCH interpolation for smoother results

- [#5](https://github.com/mike-north/chromaterm/pull/5) [`53cd588`](https://github.com/mike-north/chromaterm/commit/53cd5880552efd713686d581b471ee9e7d531096) Thanks [@mike-north](https://github.com/mike-north)! - Add light/dark mode detection helpers for CLI applications.

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
