// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../types/supports-color.d.ts" />
import supportsColor from 'supports-color';
import type { Capabilities, ColorLevel, DetectOptions, ThemeLevel } from './types.js';

/**
 * Check if color output is explicitly disabled via NO_COLOR environment variable.
 *
 * @returns True if NO_COLOR is present (with any value including empty string).
 * @internal
 */
export function isColorDisabled(): boolean {
  return 'NO_COLOR' in process.env;
}

/**
 * Check if color output is explicitly forced via FORCE_COLOR environment variable.
 *
 * @returns False if not forced, or the numeric level (0-3) if forced.
 * @internal
 */
export function isColorForced(): boolean | number {
  const force = process.env['FORCE_COLOR'];
  if (force === undefined) {
    return false;
  }

  // Empty string or non-numeric means force with default level
  if (force === '' || Number.isNaN(Number(force))) {
    return 1;
  }

  const level = parseInt(force, 10);
  // Clamp to valid range 0-3
  return Math.max(0, Math.min(3, level));
}

/**
 * Detect the terminal's color capability level.
 *
 * @param options - Detection options for overriding behavior.
 * @returns The detected or forced color capability level.
 * @internal
 */
export function detectColorLevel(options?: DetectOptions): ColorLevel {
  // Option override takes highest priority
  if (options?.forceColor !== undefined) {
    return options.forceColor;
  }

  // NO_COLOR disables all color output
  if (isColorDisabled()) {
    return 'none';
  }

  // FORCE_COLOR explicitly enables color at specified level
  const forced = isColorForced();
  if (forced !== false) {
    const levelMap: ColorLevel[] = ['none', 'ansi16', 'ansi256', 'truecolor'];
    return levelMap[forced as number] ?? 'none';
  }

  // Check TTY status
  const isTTY = options?.isTTY ?? (process.stdout.isTTY || false);
  if (!isTTY) {
    return 'none';
  }

  // Use supports-color to detect capability
  const support = supportsColor.stdout;
  if (!support) {
    return 'none';
  }

  const levelMap: ColorLevel[] = ['none', 'ansi16', 'ansi256', 'truecolor'];
  return levelMap[support.level] ?? 'none';
}

/**
 * Detect the terminal's theme alignment capability level.
 *
 * @param options - Detection options for overriding behavior.
 * @returns The detected or forced theme capability level.
 * @internal
 */
function detectThemeLevel(options?: DetectOptions): ThemeLevel {
  // Option override takes highest priority
  if (options?.forceTheme !== undefined) {
    return options.forceTheme;
  }

  // Default to blind (T1) - will be upgraded by M4/M5
  return 'blind';
}

/**
 * Detect all terminal capabilities.
 *
 * This function determines what the terminal is capable of in terms of:
 * - Color output (C0-C3): none, ansi16, ansi256, truecolor
 * - Theme alignment (T1-T3): blind, lightdark, palette
 * - TTY status: whether output is to a terminal device
 *
 * Detection respects standard environment variables:
 * - `NO_COLOR`: Disables all color output when present
 * - `FORCE_COLOR`: Forces color output at specified level (0-3)
 *
 * @param options - Options to override detection behavior.
 * @returns The detected or configured capabilities.
 *
 * @example
 * ```typescript
 * const caps = detectCapabilities();
 * if (caps.color === 'truecolor') {
 *   // Use 24-bit RGB colors
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Force specific capabilities for testing
 * const caps = detectCapabilities({
 *   forceColor: 'ansi256',
 *   forceTheme: 'lightdark'
 * });
 * ```
 *
 * @public
 */
export function detectCapabilities(options?: DetectOptions): Capabilities {
  const color = detectColorLevel(options);
  const theme = detectThemeLevel(options);
  const isTTY = options?.isTTY ?? (process.stdout.isTTY || false);

  return {
    color,
    theme,
    isTTY,
  };
}
