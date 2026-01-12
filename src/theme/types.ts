import type { Color } from '../builder/builder.js';
import type { Capabilities } from '../capability/types.js';
import type { RGB } from '../types.js';

/**
 * Palette data from terminal probing or config.
 *
 * @public
 */
export interface PaletteData {
  /** RGB values for ANSI colors 0-15 */
  colors: Map<number, RGB>;
  /** Default foreground color */
  foreground: RGB;
  /** Default background color */
  background: RGB;
}

/**
 * Options for theme creation.
 *
 * @public
 */
export interface ThemeOptions {
  /** Timeout for OSC probe (ms). Default: 100 */
  probeTimeout?: number;

  /** Force specific capability levels (for testing) */
  forceCapability?: {
    color?: 'none' | 'ansi16' | 'ansi256' | 'truecolor';
    theme?: 'blind' | 'lightdark' | 'palette';
  };

  /** Skip probing, use T1 baseline only */
  skipProbe?: boolean;
}

/**
 * A theme provides a consistent set of colors for terminal output.
 *
 * @public
 */
export interface Theme {
  // Standard ANSI colors
  /**
   * ANSI black (index 0)
   */
  black: Color;
  /**
   * ANSI red (index 1)
   */
  red: Color;
  /**
   * ANSI green (index 2)
   */
  green: Color;
  /**
   * ANSI yellow (index 3)
   */
  yellow: Color;
  /**
   * ANSI blue (index 4)
   */
  blue: Color;
  /**
   * ANSI magenta (index 5)
   */
  magenta: Color;
  /**
   * ANSI cyan (index 6)
   */
  cyan: Color;
  /**
   * ANSI white (index 7)
   */
  white: Color;

  // Bright variants
  /**
   * ANSI bright black / gray (index 8)
   */
  brightBlack: Color;
  /**
   * ANSI bright red (index 9)
   */
  brightRed: Color;
  /**
   * ANSI bright green (index 10)
   */
  brightGreen: Color;
  /**
   * ANSI bright yellow (index 11)
   */
  brightYellow: Color;
  /**
   * ANSI bright blue (index 12)
   */
  brightBlue: Color;
  /**
   * ANSI bright magenta (index 13)
   */
  brightMagenta: Color;
  /**
   * ANSI bright cyan (index 14)
   */
  brightCyan: Color;
  /**
   * ANSI bright white (index 15)
   */
  brightWhite: Color;

  // Semantic aliases
  /**
   * Semantic error color (red)
   */
  error: Color;
  /**
   * Semantic warning color (yellow)
   */
  warning: Color;
  /**
   * Semantic success color (green)
   */
  success: Color;
  /**
   * Semantic info color (blue)
   */
  info: Color;
  /**
   * Semantic muted color (brightBlack)
   */
  muted: Color;

  // Special
  /**
   * Default foreground color (white)
   */
  foreground: Color;
  /**
   * Default background color (black)
   */
  background: Color;

  /**
   * Terminal capabilities for this theme.
   */
  readonly capabilities: Capabilities;

  /**
   * Raw palette data if T3, null otherwise
   */
  readonly palette: PaletteData | null;
}
