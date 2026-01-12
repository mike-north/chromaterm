import { createColor } from '../builder/builder.js';
import { detectCapabilities } from '../capability/detect.js';
import { probeTerminalPalette } from '../probe/probe.js';
import { readTerminalConfig, detectVSCodeFamily } from '../config/index.js';
import { FALLBACK_PALETTE, ANSI_COLOR_INDICES } from '../color/palette.js';
import type { Theme, ThemeOptions, PaletteData } from './types.js';
import type { AnsiColorIndex, AnsiColorName, RGB } from '../types.js';
import type { Capabilities } from '../capability/types.js';
import type { DetectOptions } from '../capability/types.js';

/**
 * Create a theme by detecting the terminal's color palette.
 *
 * Detection strategy:
 * 1. Check for VS Code family config (fast, ~5ms)
 * 2. Fall back to OSC probing (~1-100ms depending on terminal)
 * 3. Fall back to T1 baseline if all else fails
 *
 * @param options - Theme creation options
 * @returns A theme with colors aligned to the terminal's palette
 *
 * @public
 */
export async function createTheme(options: ThemeOptions = {}): Promise<Theme> {
  const { probeTimeout = 100, forceCapability, skipProbe = false } = options;

  // Detect base capabilities
  const detectOptions: DetectOptions = {};
  if (forceCapability?.color !== undefined) {
    detectOptions.forceColor = forceCapability.color;
  }
  if (forceCapability?.theme !== undefined) {
    detectOptions.forceTheme = forceCapability.theme;
  }
  let capabilities = detectCapabilities(detectOptions);

  let palette: PaletteData | null = null;

  if (!skipProbe && capabilities.theme !== 'palette') {
    // Try to get palette data
    palette = await detectPalette(probeTimeout);

    if (palette !== null) {
      // Upgrade to T3 (palette available)
      capabilities = { ...capabilities, theme: 'palette' };
    }
    // Note: T2 (lightdark) detection would go here if implemented
  }

  // Create the theme object
  return buildTheme(capabilities, palette);
}

/**
 * Attempts to detect the terminal palette from config or probing.
 *
 * @param timeout - Timeout for OSC probing in milliseconds
 * @returns PaletteData if detected, null otherwise
 *
 * @internal
 */
async function detectPalette(timeout: number): Promise<PaletteData | null> {
  // Try VS Code config first (fast)
  if (detectVSCodeFamily() !== null) {
    const configColors = readTerminalConfig();
    if (configColors !== null && configColors.colors.size >= 16) {
      // Try OSC probe specifically for foreground/background (more reliable than config)
      const probeResult = await probeTerminalPalette({ timeout });
      return {
        colors: configColors.colors,
        foreground: probeResult?.foreground ??
          configColors.foreground ?? { r: 229, g: 229, b: 229 },
        background:
          probeResult?.background ??
          configColors.background ??
          inferBackground(configColors.foreground),
      };
    }
  }

  // Fall back to OSC probing for everything
  const probeResult = await probeTerminalPalette({ timeout });
  if (probeResult?.success === true && probeResult.colors.size >= 16) {
    return {
      colors: probeResult.colors,
      foreground: probeResult.foreground ?? { r: 229, g: 229, b: 229 },
      background: probeResult.background ?? inferBackground(probeResult.foreground),
    };
  }

  return null;
}

/**
 * Infers a background color from the foreground color.
 *
 * If foreground is light (luminance > 0.5), assumes dark background.
 * If foreground is dark (luminance <= 0.5), assumes light background.
 *
 * @param foreground - The foreground color, or null
 * @returns Inferred background color
 *
 * @internal
 */
function inferBackground(foreground: RGB | null): RGB {
  if (foreground === null) {
    // Default to dark theme (black background)
    return { r: 0, g: 0, b: 0 };
  }

  // Calculate relative luminance (simplified)
  const luminance = (0.299 * foreground.r + 0.587 * foreground.g + 0.114 * foreground.b) / 255;

  if (luminance > 0.5) {
    // Light foreground → dark background
    return { r: 30, g: 30, b: 30 };
  } else {
    // Dark foreground → light background
    return { r: 250, g: 250, b: 250 };
  }
}

/**
 * Builds a theme from capabilities and optional palette data.
 *
 * @param capabilities - Detected terminal capabilities
 * @param palette - Palette data if available (T3), null otherwise (T1)
 * @returns A complete theme object
 *
 * @internal
 */
function buildTheme(capabilities: Capabilities, palette: PaletteData | null): Theme {
  // Get terminal background for fade transform
  const terminalBackground = palette?.background ?? null;

  /**
   * Creates a Color instance for a given ANSI color name.
   */
  const makeColor = (name: AnsiColorName): ReturnType<typeof createColor> => {
    const index = ANSI_COLOR_INDICES[name];
    const baseRgb = palette?.colors.get(index) ?? FALLBACK_PALETTE[name];

    return createColor({
      ansiIndex: index,
      baseRgb: palette !== null ? baseRgb : null, // Only set baseRgb if we have a real palette
      transforms: [],
      modifiers: {},
      background: null,
      capabilities,
      terminalBackground,
    });
  };

  return {
    // Standard ANSI colors (0-7)
    black: makeColor('black'),
    red: makeColor('red'),
    green: makeColor('green'),
    yellow: makeColor('yellow'),
    blue: makeColor('blue'),
    magenta: makeColor('magenta'),
    cyan: makeColor('cyan'),
    white: makeColor('white'),

    // Bright variants (8-15)
    brightBlack: makeColor('brightBlack'),
    brightRed: makeColor('brightRed'),
    brightGreen: makeColor('brightGreen'),
    brightYellow: makeColor('brightYellow'),
    brightBlue: makeColor('brightBlue'),
    brightMagenta: makeColor('brightMagenta'),
    brightCyan: makeColor('brightCyan'),
    brightWhite: makeColor('brightWhite'),

    // Semantic aliases
    error: makeColor('red'),
    warning: makeColor('yellow'),
    success: makeColor('green'),
    info: makeColor('blue'),
    muted: makeColor('brightBlack'),

    // Special colors from palette
    foreground: createColor({
      ansiIndex: 7, // white
      baseRgb: palette?.foreground ?? null,
      transforms: [],
      modifiers: {},
      background: null,
      capabilities,
      terminalBackground,
    }),
    background: createColor({
      ansiIndex: 0, // black
      baseRgb: palette?.background ?? null,
      transforms: [],
      modifiers: {},
      background: null,
      capabilities,
      terminalBackground,
    }),

    // Capabilities
    capabilities,

    // Palette
    palette,
  };
}

/**
 * Creates a T1 theme with ANSI-16 colors.
 *
 * At T1 level, colors use ANSI color indices (0-15) with no RGB resolution.
 * Transformations are accumulated but not applied until T3 is available.
 *
 * @param options - Optional capability detection options
 * @returns A theme with all standard ANSI colors
 *
 * @public
 */
export function createT1Theme(options?: DetectOptions): Theme {
  const capabilities = detectCapabilities(options);

  /**
   * Creates a Color instance for a given ANSI index.
   */
  const makeColor = (ansiIndex: AnsiColorIndex) => {
    return createColor({
      ansiIndex,
      baseRgb: null,
      transforms: [],
      modifiers: {},
      background: null,
      capabilities,
      terminalBackground: null, // No terminal background at T1
    });
  };

  return {
    // Standard ANSI colors (0-7)
    black: makeColor(0),
    red: makeColor(1),
    green: makeColor(2),
    yellow: makeColor(3),
    blue: makeColor(4),
    magenta: makeColor(5),
    cyan: makeColor(6),
    white: makeColor(7),

    // Bright variants (8-15)
    brightBlack: makeColor(8),
    brightRed: makeColor(9),
    brightGreen: makeColor(10),
    brightYellow: makeColor(11),
    brightBlue: makeColor(12),
    brightMagenta: makeColor(13),
    brightCyan: makeColor(14),
    brightWhite: makeColor(15),

    // Semantic aliases
    error: makeColor(1), // red
    warning: makeColor(3), // yellow
    success: makeColor(2), // green
    info: makeColor(4), // blue
    muted: makeColor(8), // brightBlack (gray)

    // Special
    foreground: makeColor(7), // white (default foreground)
    background: makeColor(0), // black (default background)

    // Capabilities
    capabilities,

    // Palette (T1 has no palette)
    palette: null,
  };
}
