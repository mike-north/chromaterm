import type { RGB } from '../types.js';
import type { HueDirection } from './types.js';
import { rgbToOklch, oklchToRgb } from '../color/oklch.js';

/**
 * Clamps a value between min and max.
 * @internal
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation helper.
 * @internal
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
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
 * Interpolate hue values with direction control.
 *
 * @param h1 - Starting hue (0-360) or undefined for achromatic
 * @param h2 - Ending hue (0-360) or undefined for achromatic
 * @param t - Interpolation factor (0-1)
 * @param direction - How to traverse the hue wheel
 * @returns Interpolated hue (0-360) or undefined if both inputs are achromatic
 *
 * @internal
 */
function interpolateHue(
  h1: number | undefined,
  h2: number | undefined,
  t: number,
  direction: HueDirection
): number | undefined {
  // Handle achromatic colors
  if (h1 === undefined && h2 === undefined) {
    return undefined;
  }
  if (h1 === undefined) {
    return h2;
  }
  if (h2 === undefined) {
    return h1;
  }

  // Normalize hues to 0-360
  const hue1 = normalizeHue(h1);
  const hue2 = normalizeHue(h2);

  // Calculate the difference
  let diff = hue2 - hue1;

  // Adjust based on direction
  switch (direction) {
    case 'short': {
      // Take shortest path
      if (diff > 180) {
        diff -= 360;
      } else if (diff < -180) {
        diff += 360;
      }
      break;
    }
    case 'long': {
      // Take longest path
      if (diff > 0 && diff < 180) {
        diff -= 360;
      } else if (diff < 0 && diff > -180) {
        diff += 360;
      }
      break;
    }
    case 'increasing': {
      // Always increase
      if (diff < 0) {
        diff += 360;
      }
      break;
    }
    case 'decreasing': {
      // Always decrease
      if (diff > 0) {
        diff -= 360;
      }
      break;
    }
  }

  // Interpolate and normalize
  const result = hue1 + diff * t;
  return normalizeHue(result);
}

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
