import type { RGB } from '../types.js';
import type { AppearanceResult } from './types.js';
import { probeTerminalPalette } from '../probe/probe.js';

/**
 * Calculate relative luminance per WCAG 2.1.
 *
 * Uses sRGB to linear conversion and ITU-R BT.709 coefficients.
 *
 * @param rgb - RGB color with values 0-255
 * @returns Luminance value 0-1 (0 = black, 1 = white)
 *
 * @public
 */
export function calculateLuminance(rgb: RGB): number {
  // Convert sRGB to linear
  const toLinear = (c: number): number => {
    const normalized = c / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  const r = toLinear(rgb.r);
  const g = toLinear(rgb.g);
  const b = toLinear(rgb.b);

  // ITU-R BT.709 coefficients
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Threshold for light/dark classification.
 *
 * Based on WCAG contrast ratio boundary. Colors with luminance
 * above this value are considered "light".
 */
const LUMINANCE_THRESHOLD = 0.179;

/**
 * Determine if an RGB color is "light" based on luminance.
 *
 * Uses WCAG-compliant luminance calculation with 0.179 threshold.
 *
 * @param rgb - RGB color with values 0-255
 * @returns true if the color is light, false if dark
 *
 * @public
 */
export function isLightBackground(rgb: RGB): boolean {
  return calculateLuminance(rgb) > LUMINANCE_THRESHOLD;
}

/**
 * Options for background mode detection.
 *
 * @public
 */
export interface DetectBackgroundModeOptions {
  /** Timeout for terminal probing (ms). Default: 100 */
  timeout?: number;
}

/**
 * Detect appearance mode from terminal background luminance.
 *
 * This is a cross-platform approach that works in any terminal that
 * supports OSC queries. It determines light/dark based on the actual
 * terminal background color rather than system settings.
 *
 * @param options - Detection options including probe timeout
 * @returns 'light' if luminance > threshold, 'dark' otherwise, 'unknown' if probe fails
 *
 * @public
 */
export async function detectBackgroundMode(
  options: DetectBackgroundModeOptions = {}
): Promise<AppearanceResult> {
  const { timeout = 100 } = options;

  const probe = await probeTerminalPalette({ timeout });

  if (probe?.background == null) {
    return { mode: 'unknown', source: 'none', confidence: 'low' };
  }

  const isLight = isLightBackground(probe.background);

  return {
    mode: isLight ? 'light' : 'dark',
    source: 'terminal',
    confidence: 'medium', // Terminal theme may differ from system preference
  };
}
