import type {
  Gradient,
  Gradient2D,
  Gradient2DInput,
  Gradient2DOptions,
  GradientOptions,
  GradientStop,
  BlendMode,
} from './types.js';
import type { Color } from '../builder/builder.js';
import type { RGB } from '../types.js';
import { interpolateOklch } from './interpolate.js';
import { createColor, getColorState } from '../builder/builder.js';

/**
 * Extract RGB value from a Color instance.
 * @internal
 */
function colorToRgb(color: Color): RGB {
  const state = getColorState(color);
  if (state.baseRgb === null) {
    throw new Error('Cannot create gradient from ANSI-only color without RGB values');
  }
  return state.baseRgb;
}

/**
 * Create a 1D gradient from an array of gradient stops.
 *
 * @param stops - Array of gradient stops defining colors at specific positions
 * @param options - Optional configuration (easing, hue direction, loop)
 * @returns A Gradient object that can be sampled at any position
 *
 * @example
 * ```typescript
 * const gradient = createGradient([
 *   { position: 0, color: theme.cyan },
 *   { position: 0.5, color: theme.magenta },
 *   { position: 1, color: theme.yellow },
 * ]);
 * const color = gradient.at(0.25); // Color between cyan and magenta
 * ```
 *
 * @public
 */
export function createGradient(stops: GradientStop[], options: GradientOptions = {}): Gradient {
  // Validate stops
  if (stops.length < 2) {
    throw new Error('Gradient requires at least 2 stops');
  }

  // Sort stops by position
  const sortedStops = [...stops].sort((a, b) => a.position - b.position);

  // Validate positions
  for (const stop of sortedStops) {
    if (stop.position < 0 || stop.position > 1) {
      throw new Error(
        `Invalid gradient stop position: ${String(stop.position)}. Must be between 0 and 1.`
      );
    }
  }

  const { easing, hueDirection = 'short', loop = false } = options;

  return {
    at(position: number): Color {
      let pos = position;

      // Handle looping
      if (loop) {
        // Wrap position to 0-1 range
        pos = pos % 1;
        if (pos < 0) {
          pos += 1;
        }
      } else {
        // Clamp to 0-1
        pos = Math.max(0, Math.min(1, pos));
      }

      // Apply easing if provided
      if (easing) {
        pos = easing(pos);
      }

      // Find the two stops to interpolate between
      // We know sortedStops has at least 2 elements due to validation
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      let startStop = sortedStops[0]!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      let endStop = sortedStops[sortedStops.length - 1]!;
      let localT = 0;

      // Find the segment containing this position
      for (let i = 0; i < sortedStops.length - 1; i++) {
        // These are guaranteed to exist because i < length - 1
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const current = sortedStops[i]!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const next = sortedStops[i + 1]!;

        if (pos >= current.position && pos <= next.position) {
          startStop = current;
          endStop = next;

          // Calculate local interpolation factor within this segment
          const segmentRange = next.position - current.position;
          if (segmentRange > 0) {
            localT = (pos - current.position) / segmentRange;
          }
          break;
        }
      }

      // If position is exactly at a stop, return that stop's color
      if (localT === 0) {
        return startStop.color;
      }
      if (localT === 1) {
        return endStop.color;
      }

      // Interpolate between the two colors
      const startRgb = colorToRgb(startStop.color);
      const endRgb = colorToRgb(endStop.color);
      const interpolatedRgb = interpolateOklch(startRgb, endRgb, localT, hueDirection);

      // Get state from start color to preserve capabilities
      const startState = getColorState(startStop.color);

      // Create new color with interpolated RGB
      return createColor({
        ansiIndex: startState.ansiIndex,
        baseRgb: interpolatedRgb,
        transforms: [],
        modifiers: {},
        background: null,
        capabilities: startState.capabilities,
        terminalBackground: startState.terminalBackground,
      });
    },

    get stops() {
      return sortedStops;
    },

    get loop() {
      return loop;
    },
  };
}

/**
 * Create a 2D gradient from X and Y axis gradient stops.
 *
 * @param input - Object with `x` and `y` arrays of gradient stops
 * @param options - Optional configuration (easing, hue direction, blend mode, loop)
 * @returns A Gradient2D object that can be sampled at any (x, y) coordinate
 *
 * @example
 * ```typescript
 * const gradient = createGradient2D({
 *   x: [
 *     { position: 0, color: theme.cyan },
 *     { position: 1, color: theme.magenta },
 *   ],
 *   y: [
 *     { position: 0, color: theme.white },
 *     { position: 1, color: theme.black },
 *   ],
 * });
 * const color = gradient.at(0.5, 0.5); // Blended result
 * ```
 *
 * @public
 */
export function createGradient2D(
  input: Gradient2DInput,
  options: Gradient2DOptions = {}
): Gradient2D {
  const { blendMode = 'average', loop, easing, hueDirection } = options;

  // Build gradient options, only including defined values
  const xOptions: GradientOptions = {};
  if (easing !== undefined) {
    xOptions.easing = easing;
  }
  if (hueDirection !== undefined) {
    xOptions.hueDirection = hueDirection;
  }
  if (loop?.x !== undefined) {
    xOptions.loop = loop.x;
  }

  const yOptions: GradientOptions = {};
  if (easing !== undefined) {
    yOptions.easing = easing;
  }
  if (hueDirection !== undefined) {
    yOptions.hueDirection = hueDirection;
  }
  if (loop?.y !== undefined) {
    yOptions.loop = loop.y;
  }

  // Create underlying 1D gradients
  const xGradient = createGradient(input.x, xOptions);
  const yGradient = createGradient(input.y, yOptions);

  return {
    at(x: number, y: number): Color {
      // Sample both gradients
      const colorX = xGradient.at(x);
      const colorY = yGradient.at(y);

      // Get RGB values
      const rgbX = colorToRgb(colorX);
      const rgbY = colorToRgb(colorY);

      // Blend based on mode
      const blended = blendColors(rgbX, rgbY, blendMode);

      // Get state from X color to preserve capabilities
      const stateX = getColorState(colorX);

      // Create and return Color
      return createColor({
        ansiIndex: stateX.ansiIndex,
        baseRgb: blended,
        transforms: [],
        modifiers: {},
        background: null,
        capabilities: stateX.capabilities,
        terminalBackground: stateX.terminalBackground,
      });
    },

    get xGradient() {
      return xGradient;
    },

    get yGradient() {
      return yGradient;
    },
  };
}

/**
 * Blend two colors using the specified blend mode.
 * @internal
 */
function blendColors(color1: RGB, color2: RGB, mode: BlendMode): RGB {
  switch (mode) {
    case 'multiply': {
      // Multiply: darkens where both are dark
      return {
        r: Math.round((color1.r * color2.r) / 255),
        g: Math.round((color1.g * color2.g) / 255),
        b: Math.round((color1.b * color2.b) / 255),
      };
    }

    case 'overlay': {
      // Overlay: preserves contrast
      return {
        r: overlay(color1.r, color2.r),
        g: overlay(color1.g, color2.g),
        b: overlay(color1.b, color2.b),
      };
    }

    case 'average':
    default: {
      // Simple average
      return {
        r: Math.round((color1.r + color2.r) / 2),
        g: Math.round((color1.g + color2.g) / 2),
        b: Math.round((color1.b + color2.b) / 2),
      };
    }
  }
}

/**
 * Overlay blend mode formula.
 * @internal
 */
function overlay(a: number, b: number): number {
  // Overlay blend mode formula
  if (a < 128) {
    return Math.round((2 * a * b) / 255);
  }
  return Math.round(255 - (2 * (255 - a) * (255 - b)) / 255);
}
