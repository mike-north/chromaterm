/**
 * RGB color representation with values in the range 0-255 per channel.
 *
 * @public
 */
export interface RGB {
  /** Red channel (0-255) */
  r: number;
  /** Green channel (0-255) */
  g: number;
  /** Blue channel (0-255) */
  b: number;
}

/**
 * HSL color representation.
 *
 * @public
 */
export interface HSL {
  /** Hue in degrees (0-360) */
  h: number;
  /** Saturation (0-1) */
  s: number;
  /** Lightness (0-1) */
  l: number;
}

/**
 * OKLCH color representation using the OKLCH color space.
 *
 * OKLCH is a perceptually uniform color space that's particularly useful
 * for color interpolation and gradient generation.
 *
 * @public
 */
export interface OKLCH {
  /** Lightness: 0 (black) to 1 (white) */
  l: number;
  /** Chroma: 0 (gray) to ~0.4 (highly saturated) */
  c: number;
  /** Hue: 0-360 degrees, or undefined for achromatic (gray) colors */
  h: number | undefined;
}

/**
 * ANSI color names for the standard 16-color palette.
 *
 * @public
 */
export type AnsiColorName =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'brightBlack'
  | 'brightRed'
  | 'brightGreen'
  | 'brightYellow'
  | 'brightBlue'
  | 'brightMagenta'
  | 'brightCyan'
  | 'brightWhite';

/**
 * ANSI color index in the standard 16-color palette (0-15).
 *
 * @public
 */
export type AnsiColorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
