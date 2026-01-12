import type { HSL, RGB } from '../types.js';

/**
 * Converts an RGB color to HSL color space.
 *
 * @param rgb - RGB color with values 0-255
 * @returns HSL color with h: 0-360, s: 0-1, l: 0-1
 *
 * @public
 */
export function rgbToHsl(rgb: RGB): HSL {
  // Normalize RGB values to 0-1 range
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  // Calculate lightness
  const l = (max + min) / 2;

  // Achromatic (gray) - no hue or saturation
  if (delta === 0) {
    return { h: 0, s: 0, l };
  }

  // Calculate saturation
  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  // Calculate hue
  let h: number;
  if (max === r) {
    h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
  } else if (max === g) {
    h = ((b - r) / delta + 2) / 6;
  } else {
    h = ((r - g) / delta + 4) / 6;
  }

  return {
    h: h * 360,
    s,
    l,
  };
}

/**
 * Helper function to convert HSL component to RGB.
 * @internal
 */
function hueToRgb(p: number, q: number, t: number): number {
  let normalizedT = t;
  if (normalizedT < 0) normalizedT += 1;
  if (normalizedT > 1) normalizedT -= 1;
  if (normalizedT < 1 / 6) return p + (q - p) * 6 * normalizedT;
  if (normalizedT < 1 / 2) return q;
  if (normalizedT < 2 / 3) return p + (q - p) * (2 / 3 - normalizedT) * 6;
  return p;
}

/**
 * Converts an HSL color to RGB color space.
 *
 * @param hsl - HSL color with h: 0-360, s: 0-1, l: 0-1
 * @returns RGB color with values 0-255 (rounded to nearest integer)
 *
 * @public
 */
export function hslToRgb(hsl: HSL): RGB {
  const { h, s, l } = hsl;

  // Achromatic (gray)
  if (s === 0) {
    const value = Math.round(l * 255);
    return { r: value, g: value, b: value };
  }

  // Normalize hue to 0-1 range
  const normalizedH = h / 360;

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = hueToRgb(p, q, normalizedH + 1 / 3);
  const g = hueToRgb(p, q, normalizedH);
  const b = hueToRgb(p, q, normalizedH - 1 / 3);

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}
