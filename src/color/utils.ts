import type { HueDirection } from '../gradient/types.js';

/**
 * Clamps a value between min and max.
 * @internal
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation helper.
 * @internal
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Normalizes hue to 0-360 range by wrapping.
 * @internal
 */
export function normalizeHue(hue: number): number {
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
export function interpolateHue(
  h1: number | undefined,
  h2: number | undefined,
  t: number,
  direction: HueDirection = 'short'
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
