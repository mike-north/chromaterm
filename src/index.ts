/**
 * ChromaTerm - Terminal color library
 *
 * @packageDocumentation
 */

/**
 * The current version of ChromaTerm
 *
 * @public
 */
export const VERSION: string = '0.0.0';

export * from './capability/index.js';
export * from './color/index.js';
export * from './types.js';
export * from './builder/index.js';
export * from './theme/index.js';
export * from './probe/index.js';
export * from './config/index.js';

// Absolute colors and direct ANSI access
export { abs, ansi } from './abs/index.js';
export type { StyleFunction } from './abs/index.js';

// Gradient support
export { createGradient, createGradient2D, interpolateOklch } from './gradient/index.js';

export type {
  Gradient,
  GradientStop,
  GradientOptions,
  Gradient2D,
  Gradient2DInput,
  Gradient2DOptions,
  HueDirection,
  BlendMode,
} from './gradient/index.js';
