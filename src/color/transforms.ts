import type { RGB } from '../types.js';
import { hslToRgb, rgbToHsl } from './conversions.js';
import { oklchToRgb, rgbToOklch } from './oklch.js';

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
 * Interpolates between two hue values, taking the shortest path around the color wheel.
 * @internal
 */
function interpolateHue(
  h1: number | undefined,
  h2: number | undefined,
  t: number
): number | undefined {
  // If both hues are undefined (achromatic colors), return undefined
  if (h1 === undefined && h2 === undefined) {
    return undefined;
  }

  // If only one hue is defined, use that one (achromatic to chromatic transition)
  if (h1 === undefined) {
    return h2;
  }
  if (h2 === undefined) {
    return h1;
  }

  // Both hues are defined - interpolate using shortest path
  let diff = h2 - h1;

  // Normalize the difference to the shortest path
  if (diff > 180) {
    diff -= 360;
  } else if (diff < -180) {
    diff += 360;
  }

  // Interpolate and normalize result
  const result = h1 + diff * t;
  return normalizeHue(result);
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

/**
 * Fades (blends) a color toward a target color using OKLCH interpolation.
 *
 * This creates an opacity effect by interpolating between the source color
 * and the target color in the perceptually uniform OKLCH color space.
 * At amount=0, the result is the source color. At amount=1, the result is
 * the target color.
 *
 * OKLCH interpolation provides smoother, more natural color transitions
 * compared to naive RGB interpolation, avoiding muddy intermediate colors.
 *
 * Use this to create semi-transparent text effects by blending
 * the text color toward the background.
 *
 * @param rgb - RGB color to fade
 * @param target - Target color to fade toward
 * @param amount - Amount to fade (0.0 = fully opaque, 1.0 = fully faded/transparent)
 * @returns New RGB color blended toward the target
 *
 * @public
 */
export function fade(rgb: RGB, target: RGB, amount: number): RGB {
  const t = clamp(amount, 0, 1);

  // Convert both colors to OKLCH
  const sourceOklch = rgbToOklch(rgb);
  const targetOklch = rgbToOklch(target);

  // Interpolate in OKLCH space
  const interpolated = {
    l: sourceOklch.l + (targetOklch.l - sourceOklch.l) * t,
    c: sourceOklch.c + (targetOklch.c - sourceOklch.c) * t,
    h: interpolateHue(sourceOklch.h, targetOklch.h, t),
  };

  // Convert back to RGB
  return oklchToRgb(interpolated);
}
