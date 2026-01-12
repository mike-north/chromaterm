import type { RGB } from '../types.js';
import { hslToRgb, rgbToHsl } from './conversions.js';

/**
 * Clamps a value between min and max.
 * @internal
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Normalizes hue to 0-360 range by wrapping.
 * @internal
 */
function normalizeHue(hue: number): number {
  let normalized = hue % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return normalized;
}

/**
 * Increases the saturation of a color.
 *
 * @param rgb - RGB color to transform
 * @param amount - Amount to increase saturation (-1.0 to +1.0)
 * @returns New RGB color with adjusted saturation
 *
 * @public
 */
export function saturate(rgb: RGB, amount: number): RGB {
  const hsl = rgbToHsl(rgb);
  hsl.s = clamp(hsl.s + amount, 0, 1);
  return hslToRgb(hsl);
}

/**
 * Decreases the saturation of a color.
 *
 * @param rgb - RGB color to transform
 * @param amount - Amount to decrease saturation (0.0 to +1.0)
 * @returns New RGB color with adjusted saturation
 *
 * @public
 */
export function desaturate(rgb: RGB, amount: number): RGB {
  return saturate(rgb, -amount);
}

/**
 * Increases the lightness of a color.
 *
 * @param rgb - RGB color to transform
 * @param amount - Amount to increase lightness (-1.0 to +1.0)
 * @returns New RGB color with adjusted lightness
 *
 * @public
 */
export function lighten(rgb: RGB, amount: number): RGB {
  const hsl = rgbToHsl(rgb);
  hsl.l = clamp(hsl.l + amount, 0, 1);
  return hslToRgb(hsl);
}

/**
 * Decreases the lightness of a color.
 *
 * @param rgb - RGB color to transform
 * @param amount - Amount to decrease lightness (0.0 to +1.0)
 * @returns New RGB color with adjusted lightness
 *
 * @public
 */
export function darken(rgb: RGB, amount: number): RGB {
  return lighten(rgb, -amount);
}

/**
 * Rotates the hue of a color.
 *
 * @param rgb - RGB color to transform
 * @param degrees - Degrees to rotate hue (-360 to +360)
 * @returns New RGB color with rotated hue
 *
 * @public
 */
export function rotate(rgb: RGB, degrees: number): RGB {
  const hsl = rgbToHsl(rgb);
  hsl.h = normalizeHue(hsl.h + degrees);
  return hslToRgb(hsl);
}
