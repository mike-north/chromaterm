# ChromaTerm

**Terminal colors that adapt to your user's color scheme.**

<p align="center">
  <img src="https://media.githubusercontent.com/media/mike-north/chromaterm/refs/heads/main/demo/vhs/dracula.gif" width="260" alt="Dracula theme">
  <img src="https://media.githubusercontent.com/media/mike-north/chromaterm/refs/heads/main/demo/vhs/solarized-light.gif" width="260" alt="Solarized Light theme">
  <img src="https://media.githubusercontent.com/media/mike-north/chromaterm/refs/heads/main/demo/vhs/monokai.gif" width="260" alt="Monokai theme">
</p>
<p align="center">
  <img src="https://media.githubusercontent.com/media/mike-north/chromaterm/refs/heads/main/demo/vhs/one-dark.gif" width="260" alt="One Dark theme">
  <img src="https://media.githubusercontent.com/media/mike-north/chromaterm/refs/heads/main/demo/vhs/rose-pine.gif" width="260" alt="Rose Pine theme">
  <img src="https://media.githubusercontent.com/media/mike-north/chromaterm/refs/heads/main/demo/vhs/retro.gif" width="260" alt="Retro theme">
</p>

<p align="center"><em>Same code, different themes — colors that harmonize with your user's terminal.</em></p>

ChromaTerm is a Node.js library that expresses colors as transformations of the user's terminal palette. Instead of hardcoding RGB values that clash with carefully chosen themes, your colors harmonize with whatever palette the terminal is using.

```typescript
import { detectTheme } from 'chromaterm';

const theme = await detectTheme();

// These colors adapt to the user's terminal theme
console.log(theme.red('Error: something went wrong'));
console.log(theme.green.bold()('Success!'));
console.log(theme.blue.lighten(0.2)('A lighter blue'));
```

## The Problem

Traditional terminal color libraries use hardcoded ANSI codes or RGB values. This breaks when the user's terminal theme differs from yours:

- Dark-mode colors look muddy on light themes
- Brand colors clash with Solarized/Dracula/Nord palettes
- "Red" means something different in every theme

## The Solution

ChromaTerm probes the terminal's actual colors, then applies your transformations relative to them:

```typescript
// Traditional approach - hardcoded, inflexible
chalk.hex('#ff0000')("This red may not match the user's theme");

// ChromaTerm approach - theme-relative
theme.red("This red IS the user's theme red");
theme.red.lighten(0.2)('A lighter version of their red');
theme.red.saturate(0.3)('A more vivid version of their red');
```

## Installation

```bash
npm install chromaterm
# or
pnpm add chromaterm
# or
yarn add chromaterm
```

## Quick Start

```typescript
import { detectTheme } from 'chromaterm';

async function main() {
  // Create a theme (auto-detects terminal capabilities)
  const theme = await detectTheme();

  // Use the 16 standard ANSI colors
  console.log(theme.red('Red text'));
  console.log(theme.green('Green text'));
  console.log(theme.blue('Blue text'));
  console.log(theme.brightYellow('Bright yellow'));

  // Use semantic colors
  console.log(theme.error('Something went wrong'));
  console.log(theme.warning('Be careful'));
  console.log(theme.success('All done!'));
  console.log(theme.info('FYI...'));
  console.log(theme.muted('Less important'));

  // Apply text modifiers
  console.log(theme.red.bold()('Bold red'));
  console.log(theme.blue.italic()('Italic blue'));
  console.log(theme.green.underline()('Underlined green'));
  console.log(theme.yellow.bold().underline()('Bold + underlined'));

  // Transform colors (at T3 capability level)
  console.log(theme.red.lighten(0.2)('Lighter red'));
  console.log(theme.blue.darken(0.2)('Darker blue'));
  console.log(theme.green.saturate(0.3)('More vivid green'));
  console.log(theme.magenta.rotate(30)('Hue-shifted magenta'));
  console.log(theme.cyan.fade(0.5)('Faded cyan'));

  // Combine foreground and background
  console.log(theme.white.on(theme.red)('White on red'));
  console.log(theme.black.on(theme.yellow).bold()('Bold black on yellow'));
}

main();
```

## Capability Levels

ChromaTerm operates at different capability levels depending on what the terminal supports:

### Color Output (C-levels)

| Level | Name      | Output                                  |
| ----- | --------- | --------------------------------------- |
| C0    | none      | No color (piped output, `NO_COLOR` set) |
| C1    | ansi16    | Standard 16-color ANSI codes            |
| C2    | ansi256   | Extended 256-color palette              |
| C3    | truecolor | Full 24-bit RGB                         |

### Theme Alignment (T-levels)

| Level | Name      | Behavior                                                  |
| ----- | --------- | --------------------------------------------------------- |
| T1    | blind     | Uses ANSI color indices only; transforms are no-ops       |
| T2    | lightdark | Detects light/dark theme; basic adaptation                |
| T3    | palette   | Full palette knowledge; transforms produce precise colors |

ChromaTerm automatically detects the highest capability level available:

```typescript
const theme = await detectTheme();
console.log(theme.capabilities);
// { color: 'truecolor', theme: 'palette', isTTY: true }
```

## API Reference

### Theme Colors

Every theme provides these color properties:

**Standard ANSI Colors:**
`black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`

**Bright Variants:**
`brightBlack`, `brightRed`, `brightGreen`, `brightYellow`, `brightBlue`, `brightMagenta`, `brightCyan`, `brightWhite`

**Semantic Colors:**
`error` (red), `warning` (yellow), `success` (green), `info` (blue), `muted` (brightBlack), `foreground` (white), `background` (black)

### Color Methods

Each color is callable and chainable:

```typescript
// Call directly to colorize text
theme.red('text'); // Returns colored string

// Chain modifiers
theme.red.bold()('text');
theme.blue.italic().underline()('text');

// Chain transforms (effective at T3)
theme.red.lighten(0.2)('text');
theme.blue.saturate(0.3).darken(0.1)('text');

// Set background
theme.white.on(theme.red)('white text on red background');
```

### Text Modifiers

| Method             | Effect                     |
| ------------------ | -------------------------- |
| `.bold()`          | Bold/bright text           |
| `.dim()`           | Dimmed text                |
| `.italic()`        | Italic text                |
| `.underline()`     | Underlined text            |
| `.strikethrough()` | Strikethrough text         |
| `.inverse()`       | Swap foreground/background |
| `.hidden()`        | Hidden text                |

### Color Transforms

| Method                | Effect                                   |
| --------------------- | ---------------------------------------- |
| `.lighten(amount)`    | Increase lightness (0-1)                 |
| `.darken(amount)`     | Decrease lightness (0-1)                 |
| `.saturate(amount)`   | Increase saturation (0-1)                |
| `.desaturate(amount)` | Decrease saturation (0-1)                |
| `.rotate(degrees)`    | Shift hue (-360 to 360)                  |
| `.fade(amount)`       | Fade toward background for opacity (0-1) |

The `.fade()` transform creates an opacity effect by interpolating toward the background color (explicit via `.on()`, or the terminal background).

Transforms require T3 capability to produce visible changes. At T1/T2, transforms are no-ops.

### Gradients

ChromaTerm provides gradient utilities for creating smooth color transitions using perceptually uniform OKLCH interpolation.

#### Basic 1D Gradients

```typescript
import { detectTheme, createGradient } from 'chromaterm';

const theme = await detectTheme();

// Create a gradient from red to blue
const gradient = createGradient([
  { position: 0, color: theme.red },
  { position: 1, color: theme.blue },
]);

// Sample the gradient at any position (0-1)
const midColor = gradient.at(0.5); // Purple-ish color halfway between

// Apply gradient colors to text
const text = 'Hello Gradient!';
for (let i = 0; i < text.length; i++) {
  const t = i / (text.length - 1);
  process.stdout.write(gradient.at(t)(text[i]));
}
```

#### Multi-Stop Gradients

```typescript
// Rainbow gradient with multiple stops
const rainbow = createGradient([
  { position: 0, color: theme.red },
  { position: 0.17, color: theme.yellow },
  { position: 0.33, color: theme.green },
  { position: 0.5, color: theme.cyan },
  { position: 0.67, color: theme.blue },
  { position: 0.83, color: theme.magenta },
  { position: 1, color: theme.red },
]);
```

#### Gradient Options

```typescript
// Define stops (using theme colors from detectTheme())
const stops = [
  { position: 0, color: theme.red },
  { position: 0.5, color: theme.yellow },
  { position: 1, color: theme.green },
];

const gradient = createGradient(stops, {
  // Control hue interpolation direction
  hueDirection: 'short', // 'short' | 'long' | 'increasing' | 'decreasing'

  // Apply easing for non-linear interpolation
  easing: (t) => t * t, // Ease-in quadratic

  // Enable looping for seamless animations
  loop: true,
});

// With loop: true, positions outside 0-1 wrap around
gradient.at(1.5); // Same as gradient.at(0.5)
gradient.at(-0.25); // Same as gradient.at(0.75)
```

#### 2D Gradients

Create gradients that vary in two dimensions, useful for ASCII art effects:

```typescript
import { detectTheme, createGradient2D } from 'chromaterm';

const theme = await detectTheme();

const gradient2D = createGradient2D(
  {
    x: [
      { position: 0, color: theme.red },
      { position: 1, color: theme.yellow },
    ],
    y: [
      { position: 0, color: theme.blue },
      { position: 1, color: theme.green },
    ],
  },
  {
    blendMode: 'average', // 'multiply' | 'overlay' | 'average'
  }
);

// Sample at any (x, y) coordinate
const color = gradient2D.at(0.5, 0.5);

// Create a colored grid
for (let y = 0; y < 10; y++) {
  for (let x = 0; x < 40; x++) {
    const color = gradient2D.at(x / 39, y / 9);
    process.stdout.write(color('█'));
  }
  console.log();
}
```

#### Direct OKLCH Interpolation

For low-level control, use `interpolateOklch` directly:

```typescript
import { interpolateOklch } from 'chromaterm';
import type { RGB } from 'chromaterm';

const red: RGB = { r: 255, g: 0, b: 0 };
const blue: RGB = { r: 0, g: 0, b: 255 };

// Interpolate between two RGB colors in OKLCH space
const purple = interpolateOklch(red, blue, 0.5);
// Result: perceptually uniform purple

// Control hue direction
const longWay = interpolateOklch(red, blue, 0.5, 'long');
// Takes the long way around the color wheel (through green/yellow)
```

### Color Introspection

```typescript
// Get the ANSI index (0-15)
theme.red.ansi; // 1

// Get RGB values (if known at T3, null otherwise)
theme.red.rgb; // [205, 49, 49] or null
```

### Theme Creation Options

```typescript
const theme = await detectTheme({
  // Skip probing, use T1 baseline only
  skipProbe: true,

  // Timeout for OSC probe (ms)
  probeTimeout: 100,

  // Force specific capability levels (for testing)
  forceCapability: {
    color: 'truecolor', // 'none' | 'ansi16' | 'ansi256' | 'truecolor'
    theme: 'palette', // 'blind' | 'lightdark' | 'palette'
  },
});
```

### Synchronous Theme (T1 only)

If you don't need palette probing:

```typescript
import { createT1Theme } from 'chromaterm';

// Synchronous, no async/await needed
const theme = createT1Theme();
```

## Absolute Colors with `abs`

When you need exact colors that don't adapt (brand colors, specific design tokens), use the `abs` export for truly absolute RGB/hex colors:

```typescript
import { detectTheme, abs } from 'chromaterm';

const theme = await detectTheme();

// Theme-relative: adapts to user's palette
console.log(theme.red('This matches their terminal red'));

// Absolute: exact color regardless of theme
console.log(abs.hex('#ff6600')('This is always #ff6600'));
console.log(abs.rgb(255, 102, 0)('Same orange via RGB'));

// Background colors
console.log(abs.bgHex('#000080')('Navy background'));
console.log(abs.bgRgb(0, 0, 128)('Also navy background'));
```

The `abs` object provides:

- `abs.hex(color)` - Foreground color from hex string
- `abs.bgHex(color)` - Background color from hex string
- `abs.rgb(r, g, b)` - Foreground color from RGB values
- `abs.bgRgb(r, g, b)` - Background color from RGB values

## Direct ANSI with `ansi`

If you want raw ANSI escape codes without ChromaTerm's theme system, use the `ansi` export (a direct re-export of chalk):

```typescript
import { ansi } from 'chromaterm';

// Standard ANSI colors (look different in each terminal theme)
console.log(ansi.red('ANSI red'));
console.log(ansi.bgBlue('Blue background'));

// Modifiers
console.log(ansi.bold('Bold text'));
console.log(ansi.italic('Italic text'));

// Chaining
console.log(ansi.red.bold('Bold red'));
console.log(ansi.bgYellow.black('Black on yellow'));
```

Use `ansi` when you want chalk-compatible behavior without theme adaptation.

## Environment Variables

ChromaTerm respects standard color environment variables:

| Variable                | Effect                                  |
| ----------------------- | --------------------------------------- |
| `NO_COLOR`              | Disables all color output (C0)          |
| `FORCE_COLOR=0-3`       | Forces specific color level             |
| `CHROMATERM_APPEARANCE` | Forces light/dark mode (`light`/`dark`) |

## Light/Dark Mode Detection

ChromaTerm provides helpers for detecting whether the system is in light or dark mode, useful for CLIs that need to adapt their output accordingly.

### System Appearance Detection

Detect the operating system's light/dark mode setting:

```typescript
import { detectAppearance, detectAppearanceSync } from 'chromaterm';

// Async detection (recommended - works on all platforms)
const result = await detectAppearance();
console.log(result.mode); // 'light', 'dark', or 'unknown'
console.log(result.source); // 'macos', 'gnome', 'kde', 'windows', 'env', or 'none'
console.log(result.confidence); // 'high', 'medium', or 'low'

// Sync detection (fast, but only works on macOS)
const syncResult = detectAppearanceSync();
```

**Platform Support:**

| Platform    | Detection Method                                         |
| ----------- | -------------------------------------------------------- |
| macOS       | `defaults read -g AppleInterfaceStyle`                   |
| Linux/GNOME | `gsettings get org.gnome.desktop.interface color-scheme` |
| Linux/KDE   | `~/.config/kdeglobals` ColorScheme                       |
| Windows     | Registry `AppsUseLightTheme`                             |

### Terminal Background Detection

For a simpler cross-platform approach, detect light/dark based on the terminal's actual background color luminance:

```typescript
import { detectBackgroundMode, isLightBackground } from 'chromaterm';

// Probe the terminal and classify based on background luminance
const result = await detectBackgroundMode();
console.log(result.mode); // 'light' or 'dark' based on background brightness

// Or check an RGB color directly
import type { RGB } from 'chromaterm';
const bg: RGB = { r: 30, g: 30, b: 30 };
console.log(isLightBackground(bg)); // false (dark background)
```

This approach works in any terminal that supports OSC escape sequences, regardless of OS.

### Watching for Changes

Subscribe to appearance changes with an EventEmitter-based watcher:

```typescript
import { watchAppearance } from 'chromaterm';

const watcher = watchAppearance({
  pollInterval: 5000, // Check every 5 seconds (default)
});

watcher.on('change', (event) => {
  console.log(`Appearance changed: ${event.previousMode} -> ${event.currentMode}`);
  // Re-render your UI, switch color schemes, etc.
});

watcher.on('error', (error) => {
  console.error('Detection error:', error);
});

// Current mode is always accessible
console.log(watcher.currentMode); // 'light', 'dark', or 'unknown'

// Clean up when done
watcher.dispose();

// Or use AbortSignal for cleanup
const controller = new AbortController();
const watcher2 = watchAppearance({ signal: controller.signal });
// Later: controller.abort();
```

The watcher automatically cleans up when:

- `dispose()` is called
- The AbortSignal is triggered
- The process exits

The polling interval is unref'd, so it won't keep your Node.js process alive.

### Integration with detectTheme

You can include appearance detection when creating a theme:

```typescript
const theme = await detectTheme({
  detectAppearance: true,
});

if (theme.appearance?.mode === 'dark') {
  // Use dark-mode-friendly colors
}
```

## How Detection Works

ChromaTerm uses multiple strategies to detect terminal capabilities:

1. **Color Level**: Uses [supports-color](https://github.com/chalk/supports-color) to detect ANSI support
2. **VS Code Family**: Parses `settings.json` for `workbench.colorCustomizations` (VS Code, Cursor, Windsurf)
3. **OSC Probing**: Sends OSC 4/10/11 escape sequences to query the terminal's actual palette colors

## TypeScript Support

ChromaTerm is written in TypeScript and provides full type definitions:

```typescript
import type { Theme, Color, Capabilities, RGB } from 'chromaterm';

function logError(theme: Theme, message: string): void {
  console.log(theme.error.bold()(message));
}
```

## Comparison with Chalk

| Feature               | Chalk   | ChromaTerm                              |
| --------------------- | ------- | --------------------------------------- |
| Hardcoded ANSI colors | Yes     | Via `ansi` export (re-exports chalk)    |
| Absolute RGB/hex      | Yes     | Via `abs` export (hex, rgb only)        |
| Theme-relative colors | No      | Yes (main API)                          |
| Color transforms      | No      | Yes (lighten, darken, saturate, rotate) |
| Palette probing       | No      | Yes (OSC 4/10/11)                       |
| Graceful degradation  | Partial | Full (T3→T2→T1)                         |

## Running the Demo

See the library in action:

```bash
# Clone the repo
git clone https://github.com/mike-north/chromaterm.git
cd chromaterm

# Install dependencies
pnpm install

# Run the interactive demo
pnpm demo

# Run the smoke test (visual verification)
pnpm smoke
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm nx test

# Run all checks (lint, types, format)
pnpm nx check

# Build
pnpm nx build

# Run the smoke test CLI
pnpm smoke
```

## License

MIT
