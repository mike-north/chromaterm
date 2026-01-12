import type { AppearanceResult, DetectAppearanceOptions } from './types.js';
import { detectPlatformAppearance, detectPlatformAppearanceSync } from './platforms/index.js';

/**
 * Environment variable to override appearance detection.
 */
const APPEARANCE_ENV_VAR = 'CHROMATERM_APPEARANCE';

/**
 * Default timeout for detection (ms).
 */
const DEFAULT_TIMEOUT = 500;

/**
 * Check for environment variable override.
 *
 * @returns Appearance result if override is set, null otherwise
 *
 * @internal
 */
function checkEnvOverride(): AppearanceResult | null {
  const envValue = process.env[APPEARANCE_ENV_VAR]?.toLowerCase();

  if (envValue === 'light') {
    return { mode: 'light', source: 'env', confidence: 'high' };
  }
  if (envValue === 'dark') {
    return { mode: 'dark', source: 'env', confidence: 'high' };
  }

  return null;
}

/**
 * Detect the system's current appearance mode (light/dark).
 *
 * Detection priority:
 * 1. Environment variable override (CHROMATERM_APPEARANCE)
 * 2. forceMode option
 * 3. Platform-specific detection:
 *    - macOS: `defaults read -g AppleInterfaceStyle`
 *    - Linux/GNOME: `gsettings get org.gnome.desktop.interface color-scheme`
 *    - Linux/KDE: Parse `~/.config/kdeglobals`
 *    - Windows: Registry `HKCU\...\AppsUseLightTheme`
 * 4. Fallback: 'unknown'
 *
 * @param options - Detection options
 * @returns Appearance result with mode, source, and confidence
 *
 * @example
 * ```typescript
 * const result = await detectAppearance();
 * console.log(result.mode); // 'light', 'dark', or 'unknown'
 * ```
 *
 * @public
 */
export async function detectAppearance(
  options: DetectAppearanceOptions = {}
): Promise<AppearanceResult> {
  const { forceMode, timeout = DEFAULT_TIMEOUT } = options;

  // 1. Check environment variable override
  const envOverride = checkEnvOverride();
  if (envOverride !== null) {
    return envOverride;
  }

  // 2. Check forceMode option
  if (forceMode !== undefined) {
    return { mode: forceMode, source: 'none', confidence: 'high' };
  }

  // 3. Platform-specific detection
  return detectPlatformAppearance(timeout);
}

/**
 * Synchronously detect the system's current appearance mode.
 *
 * This is a fast path that only checks:
 * 1. Environment variable override (CHROMATERM_APPEARANCE)
 * 2. macOS defaults (if on macOS)
 *
 * For other platforms, returns 'unknown'. Use the async `detectAppearance()`
 * for more accurate cross-platform detection.
 *
 * @param options - Detection options (only forceMode is supported)
 * @returns Appearance result
 *
 * @example
 * ```typescript
 * const result = detectAppearanceSync();
 * if (result.mode === 'unknown') {
 *   // Fall back to async detection
 *   const asyncResult = await detectAppearance();
 * }
 * ```
 *
 * @public
 */
export function detectAppearanceSync(
  options: Pick<DetectAppearanceOptions, 'forceMode'> = {}
): AppearanceResult {
  const { forceMode } = options;

  // 1. Check environment variable override
  const envOverride = checkEnvOverride();
  if (envOverride !== null) {
    return envOverride;
  }

  // 2. Check forceMode option
  if (forceMode !== undefined) {
    return { mode: forceMode, source: 'none', confidence: 'high' };
  }

  // 3. Platform-specific sync detection (macOS only)
  return detectPlatformAppearanceSync();
}
