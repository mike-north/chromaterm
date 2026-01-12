/**
 * Gradient support for ChromaTerm.
 *
 * This module provides 1D and 2D gradient functionality for creating
 * smooth color transitions across terminal output.
 *
 * @packageDocumentation
 */

// Export types
export type {
  GradientStop,
  GradientOptions,
  Gradient,
  HueDirection,
  Gradient2DOptions,
  Gradient2DInput,
  Gradient2D,
  BlendMode,
} from './types.js';

// Export functions
export { createGradient, createGradient2D } from './gradient.js';
export { interpolateOklch } from './interpolate.js';
