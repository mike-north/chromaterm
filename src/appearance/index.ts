/**
 * System appearance detection module.
 *
 * Provides helpers for detecting light/dark mode on macOS, Linux, and Windows,
 * as well as terminal background luminance detection.
 *
 * @packageDocumentation
 */

// Types
export type {
  AppearanceMode,
  AppearanceSource,
  AppearanceConfidence,
  AppearanceResult,
  DetectAppearanceOptions,
  WatchAppearanceOptions,
  AppearanceChangeEvent,
  AppearanceWatcher,
} from './types.js';

// System appearance detection
export { detectAppearance, detectAppearanceSync } from './detect.js';

// Event watching
export { watchAppearance } from './watch.js';

// Terminal luminance helpers
export type { DetectBackgroundModeOptions } from './luminance.js';
export { calculateLuminance, isLightBackground, detectBackgroundMode } from './luminance.js';
