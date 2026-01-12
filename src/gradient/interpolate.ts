import type { RGB } from '../types.js';
import type { HueDirection } from './types.js';
import { rgbToOklch, oklchToRgb } from '../color/oklch.js';
import { clamp, lerp, interpolateHue } from '../color/utils.js';

/**
 * Interpolate between two RGB colors using OKLCH color space.
 *
 * This provides perceptually uniform interpolation, meaning that
 * the visual change appears constant as t varies from 0 to 1.
 *
 * @param color1 - Starting color
 * @param color2 - Ending color
 * @param t - Interpolation factor (0 = color1, 1 = color2)
 * @param hueDirection - How to traverse the hue wheel
 * @returns Interpolated RGB color
 *
 * @public
 */
export function interpolateOklch(
  color1: RGB,
  color2: RGB,
  t: number,
  hueDirection: HueDirection = 'short'
): RGB {
  // Clamp t to valid range
  const clampedT = clamp(t, 0, 1);

  // Convert both colors to OKLCH
  const oklch1 = rgbToOklch(color1);
  const oklch2 = rgbToOklch(color2);

  // Interpolate L (lightness) and C (chroma) linearly
  const l = lerp(oklch1.l, oklch2.l, clampedT);
  const c = lerp(oklch1.c, oklch2.c, clampedT);

  // Interpolate H (hue) based on direction
  const h = interpolateHue(oklch1.h, oklch2.h, clampedT, hueDirection);

  // Convert result back to RGB
  return oklchToRgb({ l, c, h });
}
