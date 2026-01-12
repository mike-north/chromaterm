import type { Color } from '../builder/builder.js';

/**
 * A stop in a gradient, defining a color at a specific position.
 *
 * @public
 */
export interface GradientStop {
  /**
   * Position in the gradient, from 0 to 1.
   */
  position: number;
  /**
   * The color at this position.
   */
  color: Color;
}

/**
 * Controls how hue interpolation traverses the color wheel.
 *
 * @public
 */
export type HueDirection =
  /** Take the shortest path around the color wheel */
  | 'short'
  /** Take the longest path around the color wheel */
  | 'long'
  /** Always increase hue values (may wrap from 360 to 0) */
  | 'increasing'
  /** Always decrease hue values (may wrap from 0 to 360) */
  | 'decreasing';

/**
 * Options for creating a gradient.
 *
 * @public
 */
export interface GradientOptions {
  /**
   * Easing function applied to position before color interpolation.
   * Default: linear (identity function).
   *
   * @param t - Input position (0-1)
   * @returns Eased position (0-1)
   */
  easing?: (t: number) => number;

  /**
   * How to interpolate hue between colors in HSL space.
   * Default: 'short' (shortest path around the color wheel).
   */
  hueDirection?: HueDirection;

  /**
   * If true, gradient loops seamlessly from end back to start.
   * Positions outside 0-1 will wrap around.
   * Default: false.
   */
  loop?: boolean;
}

/**
 * A 1D gradient that can be sampled at any position.
 *
 * @public
 */
export interface Gradient {
  /**
   * Sample the gradient at a specific position.
   *
   * @param position - Position to sample (0-1, or any value if looping enabled)
   * @returns The color at that position
   */
  at(position: number): Color;

  /**
   * The stops defining this gradient (immutable).
   */
  readonly stops: readonly GradientStop[];

  /**
   * Whether this gradient loops seamlessly.
   */
  readonly loop: boolean;
}

/**
 * Blend mode for combining X and Y gradients in 2D space.
 *
 * @public
 */
export type BlendMode =
  /** Multiply the RGB channels of both gradients */
  | 'multiply'
  /** Apply overlay blend mode (combination of multiply and screen) */
  | 'overlay'
  /** Average the RGB channels of both gradients */
  | 'average';

/**
 * Options for creating a 2D gradient.
 *
 * @public
 */
export interface Gradient2DOptions {
  /**
   * Easing function applied to both X and Y axes before color interpolation.
   * Default: linear (identity function).
   *
   * @param t - Input position (0-1)
   * @returns Eased position (0-1)
   */
  easing?: (t: number) => number;

  /**
   * How to interpolate hue between colors in HSL space.
   * Default: 'short' (shortest path around the color wheel).
   */
  hueDirection?: HueDirection;

  /**
   * How to blend X and Y gradient results.
   * Default: 'average'.
   */
  blendMode?: BlendMode;

  /**
   * Loop configuration for each axis.
   */
  loop?: {
    /**
     * If true, X-axis gradient loops seamlessly.
     * Default: false.
     */
    x?: boolean;
    /**
     * If true, Y-axis gradient loops seamlessly.
     * Default: false.
     */
    y?: boolean;
  };
}

/**
 * Input for creating a 2D gradient.
 *
 * @public
 */
export interface Gradient2DInput {
  /**
   * Gradient stops for the X axis.
   */
  x: GradientStop[];

  /**
   * Gradient stops for the Y axis.
   */
  y: GradientStop[];
}

/**
 * A 2D gradient that can be sampled at any (x, y) coordinate.
 *
 * @public
 */
export interface Gradient2D {
  /**
   * Sample the gradient at specific coordinates.
   *
   * @param x - X coordinate (0-1, or any value if X-axis looping enabled)
   * @param y - Y coordinate (0-1, or any value if Y-axis looping enabled)
   * @returns The blended color at those coordinates
   */
  at(x: number, y: number): Color;

  /**
   * The underlying X-axis gradient (immutable).
   */
  readonly xGradient: Gradient;

  /**
   * The underlying Y-axis gradient (immutable).
   */
  readonly yGradient: Gradient;
}
