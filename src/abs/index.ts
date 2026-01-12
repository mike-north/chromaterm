/**
 * Absolute and ANSI color utilities.
 *
 * This module provides two distinct color APIs:
 *
 * - `abs` - Truly absolute colors (hex, rgb, hsl) that render the exact same
 *   color regardless of terminal theme. Use for brand colors, design tokens,
 *   or any case where you need precise color values.
 *
 * - `ansi` - Direct ANSI escape codes without ChromaTerm's theme adaptation.
 *   These use ANSI color indices (0-15) which render differently in each
 *   terminal theme, but bypass ChromaTerm's color transformation system.
 *
 * @example
 * ```typescript
 * import { abs, ansi } from 'chromaterm';
 *
 * // Absolute colors - exact RGB values
 * console.log(abs.hex('#ff6600')('Exact orange'));
 * console.log(abs.rgb(255, 102, 0)('Also exact orange'));
 *
 * // ANSI colors - direct terminal codes
 * console.log(ansi.red('ANSI red'));
 * console.log(ansi.bold('Bold text'));
 * ```
 *
 * @packageDocumentation
 */

// Use createRequire to import CJS module in ESM context
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const chalk = require('chalk') as typeof import('chalk');

/**
 * A function that applies a color/style to text.
 *
 * @public
 */
export type StyleFunction = (text: string) => string;

/**
 * Absolute color utilities for exact RGB/hex values.
 *
 * Use these when you need colors that render identically regardless of
 * the user's terminal theme. Common use cases:
 * - Brand colors that must match exact specifications
 * - Design system tokens
 * - Any color specified as a precise RGB or hex value
 *
 * @example
 * ```typescript
 * import { abs } from 'chromaterm';
 *
 * // Hex colors
 * console.log(abs.hex('#ff6600')('Orange'));
 * console.log(abs.bgHex('#000080')('Navy background'));
 *
 * // RGB colors
 * console.log(abs.rgb(255, 102, 0)('Orange'));
 * console.log(abs.bgRgb(0, 0, 128)('Navy background'));
 * ```
 *
 * @public
 */
export const abs = {
  /**
   * Create a foreground color from a hex string.
   *
   * @param color - Hex color string (e.g., '#ff6600' or 'ff6600')
   * @returns A function that applies the color to text
   */
  hex: (color: string): StyleFunction => {
    return (text: string) => chalk.hex(color)(text);
  },

  /**
   * Create a background color from a hex string.
   *
   * @param color - Hex color string (e.g., '#ff6600' or 'ff6600')
   * @returns A function that applies the background color to text
   */
  bgHex: (color: string): StyleFunction => {
    return (text: string) => chalk.bgHex(color)(text);
  },

  /**
   * Create a foreground color from RGB values.
   *
   * @param r - Red component (0-255)
   * @param g - Green component (0-255)
   * @param b - Blue component (0-255)
   * @returns A function that applies the color to text
   */
  rgb: (r: number, g: number, b: number): StyleFunction => {
    return (text: string) => chalk.rgb(r, g, b)(text);
  },

  /**
   * Create a background color from RGB values.
   *
   * @param r - Red component (0-255)
   * @param g - Green component (0-255)
   * @param b - Blue component (0-255)
   * @returns A function that applies the background color to text
   */
  bgRgb: (r: number, g: number, b: number): StyleFunction => {
    return (text: string) => chalk.bgRgb(r, g, b)(text);
  },
};

/**
 * Direct ANSI escape codes without theme adaptation.
 *
 * These colors use standard ANSI color indices (0-15) and render differently
 * depending on the user's terminal theme. Unlike ChromaTerm's theme colors,
 * these bypass all color transformation and detection - they're raw ANSI codes.
 *
 * Use `ansi` when you want:
 * - Direct control over ANSI codes
 * - Compatibility with chalk-style APIs
 * - To bypass ChromaTerm's theme system entirely
 *
 * For colors that adapt intelligently to the user's theme, use the Theme API instead.
 *
 * @example
 * ```typescript
 * import { ansi } from 'chromaterm';
 *
 * // Standard ANSI colors
 * console.log(ansi.red('Red text'));
 * console.log(ansi.bgBlue('Blue background'));
 *
 * // Modifiers
 * console.log(ansi.bold('Bold'));
 * console.log(ansi.italic('Italic'));
 *
 * // Chaining
 * console.log(ansi.red.bold('Bold red'));
 * ```
 *
 * @public
 */
export const ansi = chalk;
