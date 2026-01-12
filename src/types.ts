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
