/**
 * Capability detection module for ChromaTerm.
 *
 * This module provides functionality to detect terminal capabilities
 * across two orthogonal axes:
 * - Color capability (C-level): none, ansi16, ansi256, truecolor
 * - Theme alignment (T-level): blind, lightdark, palette
 *
 * @packageDocumentation
 */

export * from './types.js';
export * from './detect.js';
