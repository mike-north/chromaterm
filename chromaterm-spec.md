# ChromaTerm Specification

## Overview

ChromaTerm is a terminal color library for Node.js that enables CLI authors to express colors as transformations of the user's terminal color scheme. Rather than hardcoding specific RGB values, authors can specify intent like "desaturated red" or "brightened blue" and ChromaTerm resolves this to actual colors derived from whatever palette the user has configured in their terminal emulator.

When theme inference isn't possible, ChromaTerm falls back gracefully to standard ANSI-16 colors. It also provides access to absolute colors (explicit RGB/hex values) via `chalk`, making it the only color library a CLI tool needs.

## Design Principles

1. **Inference-first**: Prefer runtime probing over config file parsing
2. **Graceful degradation**: Always produce usable output, even when capabilities are limited
3. **Framework-agnostic**: No coupling to any TUI framework (Ink, boba-cli, blessed, etc.)
4. **One library**: Handles both theme-relative and absolute colors
5. **Composable**: Color operations chain naturally via builder pattern
6. **Extensible**: Architecture supports adding new color operations over time

---

## Feasibility Validation (January 2025)

Prior to implementation, OSC palette probing was tested across the macOS terminal ecosystem to validate the core premise. Results were overwhelmingly positive.

### Summary

| Metric | Result |
|--------|--------|
| Terminals tested | 8 |
| Full palette support (T3) | 87.5% (7/8) |
| At least light/dark detection | 100% |
| Critical issues (corruption, hangs) | 0 |
| tmux pass-through success | 86% (6/7 outer terminals) |

### Probe Timing Results

Latency testing revealed that OSC probing is effectively free for native terminals:

| Terminal | P95 Latency | Assessment |
|----------|-------------|------------|
| Ghostty | 1.44ms | 🚀 Negligible |
| Alacritty | 1.04ms | 🚀 Negligible |
| Terminal.app | 1.71ms | 🚀 Negligible |
| kitty | 6.02ms | 🚀 Negligible |
| VS Code | 116.81ms | 🐢 Use config parsing |

**Key finding**: Native terminals respond in <2ms (P95). The probe cost is imperceptible - caching is optional, not required.

**VS Code exception**: The xterm.js-based terminal has ~100ms latency due to the Electron/JS layer. However, VS Code (and derivatives) have easily parseable JSON config files, making config parsing the preferred approach for this family.

### Key Findings

1. **OSC probing is viable** - The vast majority of modern terminals respond correctly to OSC 4/10/11 queries.

2. **Probe latency is negligible** - Sub-2ms for native terminals means no caching required for typical CLI startup.

3. **No critical failures** - No terminal corrupted stdin, hung, or returned incorrect data.

4. **tmux works out of the box** - OSC queries pass through tmux to the outer terminal without special configuration.

5. **Terminal detection is reliable** - Most terminals can be identified via `TERM_PROGRAM` or `TERM` environment variables.

6. **VS Code family uses config parsing** - For VS Code, Cursor, and Windsurf, reading JSON settings is faster and more reliable than OSC probing.

### Pending Validation

Windows (WSL2) and Linux desktop terminals have not yet been tested. These are expected to work (xterm is the reference implementation for OSC sequences), but empirical validation is required before v1.0 release. See Test Matrix for the full list.

---

## Conceptual Model

### Two Orthogonal Capability Axes

ChromaTerm reasons about terminal capabilities along two independent axes:

#### Axis A: Output Color Capability (C-level)

What color formats can the terminal render?

| Level | Name | Description |
|-------|------|-------------|
| C0 | None | No color support (non-TTY, `NO_COLOR` set, etc.) |
| C1 | ANSI-16 | Standard 16-color palette |
| C2 | ANSI-256 | Extended 256-color palette |
| C3 | Truecolor | Full 24-bit RGB |

Detection delegated to established libraries (`supports-color` or equivalent).

#### Axis B: Theme Alignment Capability (T-level)

How well can we determine the user's actual palette colors?

| Level | Name | Description |
|-------|------|-------------|
| T1 | Blind | No theme information; use ANSI semantics only |
| T2 | Light/Dark | Can infer light vs dark mode |
| T3 | Palette | Can query actual RGB values for ANSI 0-15 |

T3 is achieved via OSC escape sequence probing. T2 may be inferred from foreground/background luminance even if full palette query fails.

### Effective Capability Tiers

The combination of C-level and T-level determines what ChromaTerm can do:

| Combination | Behavior |
|-------------|----------|
| C0 + any | No color output; all styling is no-op |
| C1 + T1 | ANSI-16 only; modifiers are no-ops |
| C1 + T3 | ANSI-16 only; modifiers still no-ops (can't render derived colors) |
| C2 + T1 | Can render derived colors but not theme-aligned |
| C2 + T3 | Theme-aligned, quantized to nearest ANSI-256 |
| C3 + T1 | Full RGB but not theme-aligned |
| C3 + T3 | **Gold tier**: Full RGB, theme-aligned |

---

## API Surface

### Module Structure

```typescript
import { 
  createTheme,      // Async factory for theme-relative colors
  abs,              // Re-export of chalk for absolute colors
  themes,           // Built-in theme palettes (auto, dracula, nord, etc.)
  definePalette,    // Helper to define custom palettes
  probe,            // Low-level probe utilities (advanced use)
  
  // Cache adapters
  EphemeralCache,   // Default: temp file + env var (session-scoped)
  FileCache,        // Durable: specific file path
  MemoryCache,      // In-process only
  
  // Types
  type Theme,
  type Color,
  type Palette,
  type CacheAdapter,
  type CacheData,
  type ProbeResult,
} from 'chromaterm';
```

### Creating a Theme

```typescript
const theme = await createTheme(options?: ThemeOptions);
```

#### ThemeOptions

```typescript
interface ThemeOptions {
  /**
   * Cache adapter for storing/retrieving probe results.
   * Default: EphemeralCache (temp file + env var)
   * Pass null to disable caching entirely.
   */
  cache?: CacheAdapter | null;
  
  /**
   * Force a fresh probe, ignoring any cached data.
   * The new probe result will still be written to cache.
   * Default: false
   */
  forceProbe?: boolean;
  
  /**
   * Timeout for OSC probe responses (milliseconds).
   * Default: 100
   */
  probeTimeout?: number;
  
  /**
   * Fallback palette to use when probing fails or returns insufficient data.
   * If not specified, falls back to ANSI-16 semantics (T1).
   * If specified, uses this palette for color transforms when probe fails.
   */
  fallback?: Palette;
  
  /**
   * Force a specific capability level (for testing).
   * Default: auto-detect
   */
  forceCapability?: {
    color?: 'none' | 'ansi16' | 'ansi256' | 'truecolor';
    theme?: 'blind' | 'lightdark' | 'palette';
  };
}
```

### Theme Object

The theme object provides access to the 16 ANSI colors as `Color` builders:

```typescript
interface Theme {
  // Standard ANSI colors
  black: Color;
  red: Color;
  green: Color;
  yellow: Color;
  blue: Color;
  magenta: Color;
  cyan: Color;
  white: Color;
  
  // Bright variants
  brightBlack: Color;   // aka gray
  brightRed: Color;
  brightGreen: Color;
  brightYellow: Color;
  brightBlue: Color;
  brightMagenta: Color;
  brightCyan: Color;
  brightWhite: Color;
  
  // Semantic aliases (map to ANSI colors)
  error: Color;         // alias for red
  warning: Color;       // alias for yellow
  success: Color;       // alias for green
  info: Color;          // alias for blue
  muted: Color;         // alias for brightBlack (gray)
  
  // Special
  foreground: Color;    // Terminal's default foreground
  background: Color;    // Terminal's default background
  
  // Capability info
  readonly capabilities: {
    color: 'none' | 'ansi16' | 'ansi256' | 'truecolor';
    theme: 'blind' | 'lightdark' | 'palette';
  };
  
  // For advanced use: raw palette data if available
  readonly palette: PaletteData | null;
}
```

### Color Builder

Colors are builders that support chained transformations:

```typescript
interface Color {
  // HSV transformations (amounts are -1.0 to +1.0)
  saturate(amount: number): Color;
  desaturate(amount: number): Color;  // sugar for saturate(-amount)
  lighten(amount: number): Color;
  darken(amount: number): Color;      // sugar for lighten(-amount)
  rotate(degrees: number): Color;     // hue rotation, -360 to +360
  
  // Foreground/background composition
  on(background: Color): Color;       // set background color
  inverse(): Color;                   // swap foreground and background
  
  // Text modifiers (ANSI SGR attributes)
  bold(): Color;
  dim(): Color;
  italic(): Color;
  underline(): Color;
  strikethrough(): Color;
  hidden(): Color;                    // invisible text (same fg/bg)
  
  // Terminal rendering (returns styled string)
  (text: string): string;
  
  // Introspection
  readonly rgb: [number, number, number] | null;  // resolved RGB if known
  readonly ansi: number;                          // ANSI color index (0-15)
}
```

### Usage Examples

```typescript
import { createTheme, abs } from 'chromaterm';

const theme = await createTheme();

// Basic usage - colors are functions
console.log(theme.red('Error!'));
console.log(theme.green('Success!'));

// Derived colors
const mutedRed = theme.red.desaturate(0.3);
const vividBlue = theme.blue.saturate(0.4).lighten(0.1);
console.log(mutedRed('Soft error'));
console.log(vividBlue('Bright info'));

// Complementary color via hue rotation
const complement = theme.blue.rotate(180);

// Background colors
const alert = theme.white.on(theme.red);
const highlight = theme.black.on(theme.yellow.lighten(0.2));
console.log(alert(' CRITICAL '));
console.log(highlight(' Note '));

// Using semantic aliases
console.log(theme.error('Failed to connect'));
console.log(theme.warning('Deprecated API'));
console.log(theme.success('Build complete'));

// Text modifiers
console.log(theme.red.bold()('Bold red'));
console.log(theme.blue.italic().underline()('Italic underlined blue'));
console.log(theme.yellow.strikethrough()('Deprecated'));

// Combine color transforms with text modifiers
const importantError = theme.red.saturate(0.2).bold().underline();
console.log(importantError('CRITICAL ERROR'));

// Inverse (swap fg/bg)
const inverted = theme.green.inverse();
console.log(inverted('Inverted green'));  // green background, default foreground

// Absolute colors via chalk (escape hatch)
console.log(abs.hex('#ff6600')('Exact orange'));
console.log(abs.rgb(100, 200, 50)('Exact green'));

// Check capabilities
if (theme.capabilities.theme === 'palette') {
  console.log('Full theme alignment available');
}
```

### Absolute Colors (`abs`)

The `abs` export is a re-export of `chalk`, providing access to absolute (non-theme-relative) colors:

```typescript
import { abs } from 'chromaterm';

// All chalk methods available
abs.red('Red text');
abs.hex('#ff6600')('Orange');
abs.rgb(255, 128, 0)('Also orange');
abs.bgBlue.white('White on blue');

// Composing with theme colors is NOT directly supported
// (they're different systems), but you can use them in the same output:
console.log(theme.red('themed') + ' vs ' + abs.red('absolute'));
```

---

## Theme Selection

ChromaTerm treats "auto-detect from terminal" as just one theme among many. CLI authors can offer users a choice of themes, including the special `auto` theme that probes the terminal.

### Built-in Themes

```typescript
import { createTheme, themes } from 'chromaterm';

// Auto-detect from terminal (the core use case)
const theme = await createTheme(themes.auto);

// Static palettes (no probing, always consistent)
const theme = await createTheme(themes.dracula);
const theme = await createTheme(themes.nord);
const theme = await createTheme(themes.solarizedLight);
const theme = await createTheme(themes.solarizedDark);
const theme = await createTheme(themes.gruvboxLight);
const theme = await createTheme(themes.gruvboxDark);
```

### CLI Configuration Pattern

```typescript
import { createTheme, themes } from 'chromaterm';
import { loadConfig } from './config';

// User's config file might contain:
// { "theme": "auto" }
// { "theme": "dracula" }
// { "theme": "nord" }

const userConfig = loadConfig();
const themeName = userConfig.theme ?? 'auto';
const theme = await createTheme(themes[themeName] ?? themes.auto);
```

### Full-Screen TUI with Theme Picker

```typescript
import { createTheme, themes } from 'chromaterm';

// Offer users a choice
const availableThemes = {
  'Match my terminal': themes.auto,
  'Dracula': themes.dracula,
  'Nord': themes.nord,
  'Solarized Light': themes.solarizedLight,
  'Solarized Dark': themes.solarizedDark,
};

// User selects from menu, app stores preference
function onThemeSelected(choice: string) {
  const palette = availableThemes[choice];
  const theme = await createTheme(palette);
  applyTheme(theme);
}
```

### Fallback Strategy

When probe-based theme detection fails, CLI authors can choose how to degrade:

**Option 1: Prefer theme alignment (default)**

Stay on ANSI-16 semantic colors. Transformations become no-ops, but colors still harmonize with the user's terminal theme.

```typescript
// This is the default behavior
const theme = await createTheme(themes.auto);
// If probe fails → T1, ANSI-16, transforms are no-ops
```

**Option 2: Prefer color richness**

Fall back to a designed palette. Lose theme alignment but keep the ability to render derived colors.

```typescript
const theme = await createTheme(themes.auto, {
  fallback: themes.dracula
});
// If probe fails → use Dracula palette, transforms work
```

This is useful for full-screen TUIs that have a designed aesthetic they'd rather preserve than lose all color richness.

### Custom Palettes

CLI authors can define their own static palettes:

```typescript
import { createTheme, definePalette } from 'chromaterm';

const myAppPalette = definePalette({
  black:   [30, 30, 30],
  red:     [220, 80, 80],
  green:   [80, 200, 120],
  yellow:  [240, 200, 80],
  blue:    [80, 140, 220],
  magenta: [180, 100, 200],
  cyan:    [80, 200, 200],
  white:   [240, 240, 240],
  // Bright variants...
  foreground: [240, 240, 240],
  background: [30, 30, 30],
});

const theme = await createTheme(myAppPalette);
```

---

## Caching Strategy

### Problem

While OSC probing is fast for native terminals (<2ms P95), some environments benefit from caching:
- VS Code family when config parsing fails (fallback to slow probe)
- Terminals with high latency (SSH, exotic setups)
- CLI tools that want to guarantee zero probe overhead

### Solution

ChromaTerm provides a pluggable caching system. **Caching is optional** - most terminals are fast enough that probing on every invocation is acceptable.
1. Use the default ephemeral cache (temp file + env var)
2. Provide a custom cache adapter to integrate with their own config system
3. Disable caching entirely

### Cache Interface

```typescript
interface CacheAdapter {
  /**
   * Retrieve cached palette data.
   * Return null if no cache exists or cache is invalid.
   */
  read(): Promise<CacheData | null> | CacheData | null;
  
  /**
   * Store palette data.
   * Implementation determines durability and location.
   */
  write(data: CacheData): Promise<void> | void;
  
  /**
   * Optional: Clear cached data.
   */
  clear?(): Promise<void> | void;
}

interface CacheData {
  version: 1;
  timestamp: number;          // Unix ms
  termProgram: string | null; // $TERM_PROGRAM if available
  capabilities: {
    color: 'none' | 'ansi16' | 'ansi256' | 'truecolor';
    theme: 'blind' | 'lightdark' | 'palette';
  };
  palette: PaletteData | null;
}

interface PaletteData {
  colors: Array<[number, number, number]>;  // RGB for ANSI 0-15
  foreground: [number, number, number];
  background: [number, number, number];
}
```

### Built-in Cache Adapters

#### 1. Ephemeral Cache (Default)

Session-scoped caching via temp file + environment variable.

```typescript
import { createTheme, EphemeralCache } from 'chromaterm';

// This is the default behavior
const theme = await createTheme();

// Equivalent to:
const theme = await createTheme({
  cache: new EphemeralCache()
});
```

**Behavior:**
- On first probe, writes results to `os.tmpdir()/chromaterm-<pid>.json`
- Sets `CHROMATERM_CACHE` env var pointing to the file
- Child processes inherit the env var and skip probing
- When terminal session ends, env var disappears; next session re-probes
- Files older than 24 hours are ignored (TTL)

#### 2. File Cache

Durable caching at a specific file path. Useful for CLI tools that want to embed palette data in their own config directory.

```typescript
import { createTheme, FileCache } from 'chromaterm';
import { join } from 'path';
import { homedir } from 'os';

const configDir = join(homedir(), '.my-cli');
const theme = await createTheme({
  cache: new FileCache(join(configDir, 'terminal-palette.json'))
});
```

**Behavior:**
- Reads/writes to the specified path
- No automatic TTL (file persists until explicitly cleared)
- CLI tool is responsible for cache invalidation (e.g., via `mycli setup` command)

#### 3. Memory Cache

In-process caching only. No persistence across invocations.

```typescript
import { createTheme, MemoryCache } from 'chromaterm';

const cache = new MemoryCache();

// First call probes
const theme1 = await createTheme({ cache });

// Second call in same process uses cache
const theme2 = await createTheme({ cache });
```

#### 4. No Cache

Force fresh probing every time.

```typescript
const theme = await createTheme({ cache: null });
```

### Custom Cache Adapters

CLI authors can implement `CacheAdapter` to integrate with their existing config systems:

```typescript
import { createTheme, CacheAdapter, CacheData } from 'chromaterm';
import { readConfig, writeConfig } from './my-cli-config';

class MyCliCache implements CacheAdapter {
  read(): CacheData | null {
    const config = readConfig();
    return config.terminalPalette ?? null;
  }
  
  write(data: CacheData): void {
    const config = readConfig();
    config.terminalPalette = data;
    writeConfig(config);
  }
  
  clear(): void {
    const config = readConfig();
    delete config.terminalPalette;
    writeConfig(config);
  }
}

const theme = await createTheme({
  cache: new MyCliCache()
});
```

### CLI Setup Commands

CLI tools that use durable caching should provide a setup command that:
1. Forces a fresh probe (bypasses cache)
2. Writes results to durable storage
3. Optionally validates the probe succeeded

Example pattern:

```typescript
// mycli setup command
import { createTheme, FileCache } from 'chromaterm';

async function setupCommand() {
  const cache = new FileCache('~/.mycli/palette.json');
  
  // Force fresh probe
  const theme = await createTheme({ 
    cache,
    forceProbe: true  // Ignores existing cache, writes new result
  });
  
  if (theme.capabilities.theme === 'palette') {
    console.log('✓ Terminal palette detected and cached');
    console.log('  Your theme-aligned colors are ready!');
  } else {
    console.log('⚠ Could not detect terminal palette');
    console.log('  Falling back to standard ANSI colors');
  }
}
```

### Cache Validation

All cache adapters should validate data before use:
- Schema version matches
- Required fields present
- Palette data has correct structure

ChromaTerm validates automatically; invalid cache data is treated as cache miss.

---

## OSC Probing

### Mechanism

ChromaTerm uses OSC (Operating System Command) escape sequences to query the terminal's palette. Specifically:

- **OSC 4** - Query palette color by index (0-15 for ANSI colors)
- **OSC 10** - Query default foreground color
- **OSC 11** - Query default background color

#### Query Format

```
ESC ] 4 ; <index> ; ? BEL
ESC ] 10 ; ? BEL
ESC ] 11 ; ? BEL
```

#### Response Format

Terminals that support these queries respond with:

```
ESC ] 4 ; <index> ; rgb:<rrrr>/<gggg>/<bbbb> BEL
```

Where `rrrr`, `gggg`, `bbbb` are 16-bit hex values (we use the high 8 bits).

### Probe Procedure

1. Write all queries to stdout in a single batch
2. Set stdin to raw mode
3. Read with timeout (default 100ms)
4. Parse responses with loose matching (handle terminal quirks)
5. Restore stdin mode
6. Classify T-level based on which queries succeeded

### Terminal Behavior Notes

#### Tested Terminals (macOS - January 2025)

| Terminal | T-Level | P95 Latency | Detection Method | Terminator |
|----------|---------|-------------|------------------|------------|
| Ghostty | T3 ✅ | 1.44ms | `TERM_PROGRAM=ghostty` | BEL |
| Alacritty | T3 ✅ | 1.04ms | (none reliable) | BEL |
| Terminal.app | T3 ✅ | 1.71ms | `TERM_PROGRAM=Apple_Terminal` | BEL |
| kitty | T3 ✅ | 6.02ms | `TERM=xterm-kitty` | ST |
| iTerm2 | T3 ✅ | (not timed) | `TERM_PROGRAM=iTerm.app` | ST |
| Hyper | T3 ✅ | (not timed) | `TERM_PROGRAM=Hyper` | ST |
| VS Code | T3 ✅ | 116ms | Config parsing preferred | ST |
| Warp | T2 ⚠️ | N/A | `TERM_PROGRAM=WarpTerminal` | BEL |

#### Tested Terminals (Linux - January 2025)

| Terminal | T-Level | Detection Method | Notes |
|----------|---------|------------------|-------|
| GNOME Terminal (Ubuntu) | T3 ✅ | `TERM=xterm-256color` | Works out of the box |

**Native terminal P95: <7ms** - Probe cost is negligible, caching optional.

**VS Code family: Use config parsing** - 100ms+ probe latency makes OSC impractical, but JSON settings are fast to read.

#### tmux Pass-through Behavior (Tested)

| Outer Terminal | tmux Result | Notes |
|----------------|-------------|-------|
| kitty | T3 ✅ | Pass-through works |
| Ghostty | T3 ✅ | Pass-through works |
| iTerm2 | T3 ✅ | Pass-through works |
| Alacritty | T3 ✅ | Pass-through works |
| VS Code | T3 ✅ | Pass-through works |
| Hyper | T3 ✅ | Pass-through works |
| Warp | T1 ❌ | Complete failure (worse than bare Warp) |

**Key finding**: tmux passes through OSC queries without special configuration. Detect tmux via `TERM_PROGRAM=tmux` or `$TMUX` env var being set.

#### Pending Tests (Required Before v1.0)

The following platforms require testing before the library is considered production-ready:

**Windows (WSL2)**
- [ ] Windows Terminal
- [ ] Windows Terminal + tmux

**Linux Desktop**
- [ ] GNOME Terminal
- [ ] Konsole (KDE)
- [ ] xterm (reference implementation)
- [ ] xfce4-terminal
- [ ] Tilix

**Linux Server/Remote**
- [ ] SSH sessions (latency considerations)
- [ ] mosh

These are expected to work (xterm is the origin of OSC 4/10/11 sequences), but must be validated empirically.

#### Response Format Variations

All tested terminals use 16-bit hex values for RGB (e.g., `ebeb/dbdb/b2b2`). Two terminator formats observed:

- **BEL (`\x07`)**: Alacritty, Terminal.app, Ghostty, Warp
- **ST (`\x1b\\`)**: kitty, iTerm2, Hyper, VS Code

ChromaTerm must parse both formats.

#### Terminal Detection Strategy

```typescript
function detectTerminal(): string | null {
  // Check TERM_PROGRAM first (most reliable)
  const termProgram = process.env.TERM_PROGRAM;
  if (termProgram) {
    return {
      'Apple_Terminal': 'terminal.app',
      'iTerm.app': 'iterm2',
      'vscode': 'vscode',
      'Hyper': 'hyper',
      'WarpTerminal': 'warp',
      'ghostty': 'ghostty',
      'tmux': 'tmux',
    }[termProgram] ?? termProgram.toLowerCase();
  }
  
  // Fall back to TERM patterns
  const term = process.env.TERM;
  if (term?.includes('kitty')) return 'kitty';
  if (term?.includes('ghostty')) return 'ghostty';
  
  // Alacritty has no unique identifier
  return null;
}
```

#### Known Terminal-Specific Handling

| Terminal | Special Handling |
|----------|------------------|
| Warp | Detect via `TERM_PROGRAM=WarpTerminal`, cap at T2 (fg/bg only) |
| tmux + Warp | Detect via `$TMUX` + parent detection, fall back to T1 |

### Failure Modes

- **Timeout**: No response within deadline → T1 (blind)
- **Partial response**: Some colors returned → Use what we get, T2 or T3
- **Garbage response**: Unparseable → T1 (blind)
- **Not a TTY**: Skip probe entirely → T1 (blind)

---

## VS Code Family Config Parsing

VS Code and its derivatives (Cursor, Windsurf) use xterm.js for their integrated terminal, which has ~100ms probe latency. Instead of probing, ChromaTerm reads their JSON settings files directly - this is faster and more reliable.

### Detection

All VS Code derivatives report `TERM_PROGRAM=vscode`, so we differentiate using additional signals:

```typescript
function detectVSCodeFamily(): { editor: string; configDir: string } | null {
  const termProgram = process.env.TERM_PROGRAM?.toLowerCase();
  
  if (termProgram !== 'vscode') {
    return null;
  }
  
  // macOS: use bundle identifier
  const bundleId = process.env.__CFBundleIdentifier ?? '';
  
  if (bundleId.includes('windsurf')) {
    return { editor: 'windsurf', configDir: '.windsurf' };
  }
  
  if (bundleId.includes('VSCode')) {
    return { editor: 'vscode', configDir: '.vscode' };
  }
  
  // Cursor: use their explicit env vars (bundle ID is unstable build hash)
  if (process.env.CURSOR_CLI || process.env.CURSOR_TRACE_ID) {
    return { editor: 'cursor', configDir: '.cursor' };
  }
  
  // Unknown derivative or Linux/Windows - default to .vscode
  return { editor: 'vscode', configDir: '.vscode' };
}
```

### Environment Variable Signatures (Tested January 2025)

| Editor | `TERM_PROGRAM` | `__CFBundleIdentifier` | Other Signals |
|--------|----------------|------------------------|---------------|
| VS Code | `vscode` | `com.microsoft.VSCode` | - |
| Cursor | `vscode` | `com.todesktop.*` (unstable) | `CURSOR_CLI`, `CURSOR_TRACE_ID` |
| Windsurf | `vscode` | `com.exafunction.windsurf` | - |

### Settings File Location

```
~/.vscode/settings.json      # VS Code
~/.cursor/settings.json      # Cursor
~/.windsurf/settings.json    # Windsurf
```

### Settings Schema

Terminal colors are defined in `workbench.colorCustomizations`:

```json
{
  "workbench.colorCustomizations": {
    "terminal.foreground": "#d4d4d4",
    "terminal.background": "#1e1e1e",
    "terminal.ansiBlack": "#000000",
    "terminal.ansiRed": "#cd3131",
    "terminal.ansiGreen": "#0dbc79",
    "terminal.ansiYellow": "#e5e510",
    "terminal.ansiBlue": "#2472c4",
    "terminal.ansiMagenta": "#bc3fbc",
    "terminal.ansiCyan": "#11a8cd",
    "terminal.ansiWhite": "#e5e5e5",
    "terminal.ansiBrightBlack": "#666666",
    "terminal.ansiBrightRed": "#f14c4c",
    "terminal.ansiBrightGreen": "#23d18b",
    "terminal.ansiBrightYellow": "#f5f543",
    "terminal.ansiBrightBlue": "#3b8eea",
    "terminal.ansiBrightMagenta": "#d670d6",
    "terminal.ansiBrightCyan": "#29b8db",
    "terminal.ansiBrightWhite": "#e5e5e5"
  }
}
```

This schema is stable - the entire VS Code theme ecosystem depends on it.

### Fallback Chain

If the detected config file is missing or unparseable:

1. Try detected config path (e.g., `~/.cursor/settings.json`)
2. Try `~/.vscode/settings.json`
3. Try `~/.windsurf/settings.json`
4. Fall back to OSC probe (slow but works)
5. Fall back to T1 (ANSI-16 semantics)

Since all editors share the same theme system and likely the same user preferences, reading the "wrong" config still produces reasonable colors.

### Testing Strategy

Use attest-it to snapshot environment signatures across editors:

```typescript
test('detect vscode family environment', () => {
  const detection = {
    TERM_PROGRAM: process.env.TERM_PROGRAM,
    __CFBundleIdentifier: process.env.__CFBundleIdentifier,
    CURSOR_CLI: !!process.env.CURSOR_CLI,
    CURSOR_TRACE_ID: !!process.env.CURSOR_TRACE_ID,
  };
  
  attest(detection).snap();
});
```

Run periodically in each editor to detect changes in detection signals.

---

## Color Resolution

### Transformation Pipeline

When a derived color is rendered to a string, ChromaTerm:

1. **Start** with base color (ANSI index or probed RGB)
2. **Apply** each transformation in order (saturate, lighten, rotate, etc.)
3. **Resolve** to final RGB (if T3) or keep as ANSI index (if T1)
4. **Render** based on C-level:
   - C3: Output as 24-bit RGB escape
   - C2: Quantize to nearest ANSI-256
   - C1: Collapse to original ANSI index
   - C0: No escape sequences

### Color Space

Transformations operate in HSL color space:
- **Hue**: 0-360 degrees
- **Saturation**: 0-1 (0 = gray, 1 = fully saturated)
- **Lightness**: 0-1 (0 = black, 1 = white)

#### Transformation Definitions

```typescript
saturate(amount):   S' = clamp(S + amount, 0, 1)
desaturate(amount): S' = clamp(S - amount, 0, 1)
lighten(amount):    L' = clamp(L + amount, 0, 1)
darken(amount):     L' = clamp(L - amount, 0, 1)
rotate(degrees):    H' = (H + degrees) mod 360
```

### Degradation Behavior

| Scenario | Behavior |
|----------|----------|
| C3 + T3 | Full fidelity: derive RGB from probed palette |
| C3 + T1 | Use hardcoded "typical" RGB for ANSI colors, then transform |
| C2 + T3 | Derive RGB, quantize to ANSI-256 |
| C2 + T1 | Use hardcoded RGB, quantize to ANSI-256 |
| C1 + any | Transformations are no-ops; output base ANSI color |
| C0 + any | No escape sequences; return plain text |

### Hardcoded Fallback Palette

When T1 (blind), ChromaTerm uses these RGB values as starting points:

```typescript
const FALLBACK_PALETTE = {
  black:         [0, 0, 0],
  red:           [205, 49, 49],
  green:         [13, 188, 121],
  yellow:        [229, 229, 16],
  blue:          [36, 114, 200],
  magenta:       [188, 63, 188],
  cyan:          [17, 168, 205],
  white:         [229, 229, 229],
  brightBlack:   [102, 102, 102],
  brightRed:     [241, 76, 76],
  brightGreen:   [35, 209, 139],
  brightYellow:  [245, 245, 67],
  brightBlue:    [59, 142, 234],
  brightMagenta: [214, 112, 214],
  brightCyan:    [41, 184, 219],
  brightWhite:   [255, 255, 255],
};
```

These are based on typical terminal defaults and provide reasonable starting points for transformations even when we can't probe the actual palette.

---

## Error Handling

### Philosophy

ChromaTerm never throws on capability detection or probing failures. It degrades gracefully and always produces usable output.

### Specific Behaviors

| Situation | Behavior |
|-----------|----------|
| `createTheme()` probe timeout | Resolve with T1 capabilities |
| `createTheme()` in non-TTY | Resolve with C0+T1 |
| Invalid cache file | Ignore cache, re-probe |
| Transformation on C1 | No-op, return base color |
| `chalk` not available | Throw on import (hard dependency) |

### Debugging

```typescript
const theme = await createTheme();

// Log capability detection results
console.error('ChromaTerm capabilities:', theme.capabilities);

// Log resolved color info
const derived = theme.red.desaturate(0.3);
console.error('Resolved RGB:', derived.rgb);
console.error('Base ANSI:', derived.ansi);
```

---

## Testing Strategy

### Unit Tests (via attest-it)

Test pure functions in isolation:

1. **Color math**: HSL ↔ RGB conversion, transformations
2. **ANSI-256 quantization**: RGB → nearest index
3. **Escape sequence generation**: Given RGB, produce correct codes
4. **Cache serialization**: Round-trip cache data
5. **OSC response parsing**: Handle well-formed and malformed responses

```typescript
import { attest } from '@ark/attest';

// Example: test saturation transformation
attest(saturate([180, 0.5, 0.5], 0.2)).equals([180, 0.7, 0.5]);

// Example: test quantization
attest(quantizeToAnsi256([255, 128, 0])).equals(208);
```

### Golden Tests (via attest-it)

Snapshot-based tests for integration behavior:

1. **Probe result → capabilities**: Given mock probe responses, assert inferred T-level
2. **Full resolution chain**: Given palette + transformations, assert final escape sequence

```typescript
// Mock probe returns these RGB values for ANSI colors
const mockPalette = { /* ... */ };

// Snapshot the full output
attest(
  resolveColor(mockPalette, 'red', [{ saturate: -0.3 }])
).snap();
```

### Real Terminal Smoke Tests

Manual and semi-automated tests in actual terminal emulators.

#### Test Harness

A CLI tool that displays color swatches:

```bash
npx chromaterm-smoke
```

Output:
```
ChromaTerm Smoke Test
=====================
Capabilities: color=truecolor, theme=palette

Base Colors:
  black   red   green   yellow   blue   magenta   cyan   white

Derived Colors (desaturate 0.3):
  black   red   green   yellow   blue   magenta   cyan   white

Derived Colors (lighten 0.2):
  black   red   green   yellow   blue   magenta   cyan   white

Derived Colors (rotate 30°):
  black   red   green   yellow   blue   magenta   cyan   white

Change your terminal theme and run again to verify alignment.
```

#### Test Matrix

**macOS (Tested ✅)**
- [x] kitty - T3 ✅
- [x] Ghostty - T3 ✅
- [x] Alacritty - T3 ✅
- [x] iTerm2 - T3 ✅
- [x] Terminal.app - T3 ✅
- [x] VS Code integrated terminal - T3 ✅
- [x] Hyper - T3 ✅
- [x] Warp - T2 ⚠️ (fg/bg only)
- [x] tmux (in kitty, Ghostty, iTerm2, Alacritty, VS Code, Hyper) - T3 ✅
- [x] tmux (in Warp) - T1 ❌

**Windows WSL2 (Pending)**
- [ ] Windows Terminal
- [ ] Windows Terminal + tmux

**Linux Desktop (Partial)**
- [x] GNOME Terminal (Ubuntu) - T3 ✅
- [ ] Konsole (KDE)
- [ ] xterm
- [ ] xfce4-terminal
- [ ] Tilix

**Remote (Pending)**
- [ ] SSH session (test with extended timeout)
- [ ] mosh

For each, verify:
1. Capabilities detected correctly
2. Base colors match terminal theme
3. Derived colors are visually correct transformations
4. Changing terminal theme + re-running shows updated colors

#### attest-it Integration for Terminal Tests

For terminals that can be scripted or run headlessly, capture probe results:

```typescript
// Capture actual probe results from real terminal
const probeResult = await captureProbeInTerminal('kitty');
attest(probeResult).snap({
  // Snapshot includes T-level, whether each color was probed, etc.
});
```

---

## Future Extensions

These are explicitly out of scope for v0.1 but the architecture should accommodate them:

### Contrast Ratio Operations

```typescript
// Future: ensure minimum contrast
const readable = theme.blue.ensureContrast(theme.background, 4.5);

// Future: clamp luminance
const notTooDark = theme.red.darken(0.5).minLuminance(0.2);
```

### Config File Parsing (T4)

If probing proves insufficient for important terminals:

```typescript
// Future: opt-in config parsing
const theme = await createTheme({
  configParsing: {
    enabled: true,
    terminals: ['kitty', 'alacritty'],
  }
});
```

### xterm.js Support

Browser runtime where OSC probing works differently:

```typescript
// Future: xterm.js integration
import { createThemeForXterm } from 'chromaterm/xterm';

const theme = createThemeForXterm(xtermInstance);
```

---

## Dependencies

### Runtime
- `chalk` (^5.x) - Escape sequence generation, absolute colors

### Development
- `@ark/attest` - Testing
- `typescript` (^5.x)

### Peer/Optional
- None

---

## Package Structure

```
chromaterm/
├── src/
│   ├── index.ts           # Public API
│   ├── theme.ts           # Theme creation, caching
│   ├── color.ts           # Color builder
│   ├── probe.ts           # OSC probing
│   ├── detect.ts          # Capability detection
│   ├── transform.ts       # Color math (HSL transforms)
│   ├── quantize.ts        # ANSI-256 quantization
│   ├── render.ts          # Escape sequence generation
│   └── cache.ts           # Cache read/write
├── test/
│   ├── unit/              # Pure function tests
│   ├── golden/            # Snapshot tests
│   └── smoke/             # Real terminal test CLI
├── package.json
├── tsconfig.json
└── README.md
```

---

## Glossary

| Term | Definition |
|------|------------|
| **C-level** | Color output capability (C0-C3) |
| **T-level** | Theme alignment capability (T1-T3) |
| **OSC** | Operating System Command escape sequences |
| **Probe** | Runtime query to determine terminal palette |
| **Derived color** | A color computed by transforming a base ANSI color |
| **Absolute color** | A color specified by exact RGB/hex, not theme-relative |
| **Quantize** | Convert RGB to nearest ANSI-256 index |
