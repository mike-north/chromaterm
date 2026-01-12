import type { RGB } from '../types.js';

/**
 * Parse a hex color string to RGB.
 *
 * Supports both short form (#RGB) and long form (#RRGGBB) hex colors.
 * The # prefix is optional.
 *
 * @param hex - Hex color string (e.g., '#cd3131', 'cd3131', '#fff', 'fff')
 * @returns RGB object with r, g, b values (0-255), or null if invalid
 *
 * @public
 */
export function parseHexColor(hex: string): RGB | null {
  // Remove # prefix if present
  const cleaned = hex.replace(/^#/, '');

  if (cleaned.length === 3) {
    // #RGB -> #RRGGBB
    const rChar = cleaned.charAt(0);
    const gChar = cleaned.charAt(1);
    const bChar = cleaned.charAt(2);
    const r = parseInt(rChar + rChar, 16);
    const g = parseInt(gChar + gChar, 16);
    const b = parseInt(bChar + bChar, 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return null;
    }
    return { r, g, b };
  }

  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return null;
    }
    return { r, g, b };
  }

  return null;
}
