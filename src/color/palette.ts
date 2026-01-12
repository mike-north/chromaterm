import type { AnsiColorIndex, AnsiColorName, RGB } from '../types.js';

/**
 * Fallback ANSI 16-color palette used when terminal color probing is not available.
 * These values are based on common terminal defaults.
 *
 * @public
 */
export const FALLBACK_PALETTE: Record<AnsiColorName, RGB> = {
  black: { r: 0, g: 0, b: 0 },
  red: { r: 205, g: 49, b: 49 },
  green: { r: 13, g: 188, b: 121 },
  yellow: { r: 229, g: 229, b: 16 },
  blue: { r: 36, g: 114, b: 200 },
  magenta: { r: 188, g: 63, b: 188 },
  cyan: { r: 17, g: 168, b: 205 },
  white: { r: 229, g: 229, b: 229 },
  brightBlack: { r: 102, g: 102, b: 102 },
  brightRed: { r: 241, g: 76, b: 76 },
  brightGreen: { r: 35, g: 209, b: 139 },
  brightYellow: { r: 245, g: 245, b: 67 },
  brightBlue: { r: 59, g: 142, b: 234 },
  brightMagenta: { r: 214, g: 112, b: 214 },
  brightCyan: { r: 41, g: 184, b: 219 },
  brightWhite: { r: 255, g: 255, b: 255 },
};

/**
 * Maps ANSI color names to their corresponding index (0-15).
 *
 * @public
 */
export const ANSI_COLOR_INDICES: Record<AnsiColorName, AnsiColorIndex> = {
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7,
  brightBlack: 8,
  brightRed: 9,
  brightGreen: 10,
  brightYellow: 11,
  brightBlue: 12,
  brightMagenta: 13,
  brightCyan: 14,
  brightWhite: 15,
};

/**
 * Maps ANSI color indices (0-15) to their corresponding color names.
 *
 * @public
 */
export const ANSI_INDEX_NAMES: Record<AnsiColorIndex, AnsiColorName> = {
  0: 'black',
  1: 'red',
  2: 'green',
  3: 'yellow',
  4: 'blue',
  5: 'magenta',
  6: 'cyan',
  7: 'white',
  8: 'brightBlack',
  9: 'brightRed',
  10: 'brightGreen',
  11: 'brightYellow',
  12: 'brightBlue',
  13: 'brightMagenta',
  14: 'brightCyan',
  15: 'brightWhite',
};
