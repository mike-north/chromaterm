import type { AnsiColorIndex, RGB } from '../types.js';
import { FALLBACK_PALETTE } from './palette.js';

/**
 * Calculates the squared Euclidean distance between two RGB colors.
 * Used for color matching without the expensive sqrt operation.
 * @internal
 */
function colorDistanceSquared(c1: RGB, c2: RGB): number {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return dr * dr + dg * dg + db * db;
}

/**
 * Converts an ANSI-256 color index to RGB.
 *
 * @param index - ANSI-256 color index (0-255)
 * @returns RGB color
 *
 * @public
 */
export function ansi256ToRgb(index: number): RGB {
  // 0-15: Standard ANSI colors (use fallback palette)
  if (index < 16) {
    const colorNames = [
      'black',
      'red',
      'green',
      'yellow',
      'blue',
      'magenta',
      'cyan',
      'white',
      'brightBlack',
      'brightRed',
      'brightGreen',
      'brightYellow',
      'brightBlue',
      'brightMagenta',
      'brightCyan',
      'brightWhite',
    ] as const;
    // index is guaranteed to be 0-15 by the if check above, so colorName will be defined
    const colorName = colorNames[index];
    if (colorName === undefined) {
      // This should never happen, but provides type safety
      throw new Error(`Invalid ANSI-16 color index: ${String(index)}`);
    }
    return { ...FALLBACK_PALETTE[colorName] };
  }

  // 16-231: 6×6×6 color cube
  if (index < 232) {
    const cubeIndex = index - 16;
    const r = Math.floor(cubeIndex / 36);
    const g = Math.floor((cubeIndex % 36) / 6);
    const b = cubeIndex % 6;

    // Map 0-5 to 0-255 using standard ANSI-256 values
    const toRgbValue = (value: number): number => {
      if (value === 0) return 0;
      return 55 + value * 40;
    };

    return {
      r: toRgbValue(r),
      g: toRgbValue(g),
      b: toRgbValue(b),
    };
  }

  // 232-255: Grayscale ramp (24 shades)
  const grayIndex = index - 232;
  const grayValue = 8 + grayIndex * 10;
  return { r: grayValue, g: grayValue, b: grayValue };
}

/**
 * Converts an RGB color to the nearest ANSI-256 color index.
 *
 * @param rgb - RGB color with values 0-255
 * @returns ANSI-256 color index (0-255)
 *
 * @public
 */
export function rgbToAnsi256(rgb: RGB): number {
  let bestIndex = 0;
  let bestDistance = Infinity;

  // Check all 256 colors for the closest match
  for (let i = 0; i < 256; i++) {
    const ansiRgb = ansi256ToRgb(i);
    const distance = colorDistanceSquared(rgb, ansiRgb);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }

    // Perfect match - no need to continue
    if (distance === 0) {
      break;
    }
  }

  return bestIndex;
}

/**
 * Converts an RGB color to the nearest ANSI-16 color index.
 *
 * @param rgb - RGB color with values 0-255
 * @returns ANSI-16 color index (0-15)
 *
 * @public
 */
export function rgbToAnsi16(rgb: RGB): AnsiColorIndex {
  let bestIndex = 0 as AnsiColorIndex;
  let bestDistance = Infinity;

  // Check only the first 16 colors
  for (let i = 0; i < 16; i++) {
    const ansiRgb = ansi256ToRgb(i);
    const distance = colorDistanceSquared(rgb, ansiRgb);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i as AnsiColorIndex;
    }

    // Perfect match - no need to continue
    if (distance === 0) {
      break;
    }
  }

  return bestIndex;
}
