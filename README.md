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

| Variable          | Effect                         |
| ----------------- | ------------------------------ |
| `NO_COLOR`        | Disables all color output (C0) |
| `FORCE_COLOR=0-3` | Forces specific color level    |

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
git clone https://github.com/anthropics/chromaterm.git
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
