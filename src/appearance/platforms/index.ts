import type { AppearanceResult } from '../types.js';
import { detectMacOSAppearance, detectMacOSAppearanceSync } from './macos.js';
import { detectGnomeAppearance } from './linux-gnome.js';
import { detectKDEAppearance } from './linux-kde.js';
import { detectWindowsAppearance } from './windows.js';

/**
 * Detected platform for appearance detection.
 *
 * @internal
 */
export type Platform = 'macos' | 'linux-gnome' | 'linux-kde' | 'windows' | 'unknown';

/**
 * Detect the current platform for appearance detection.
 *
 * @returns The detected platform
 *
 * @internal
 */
export function detectPlatform(): Platform {
  const platform = process.platform;

  if (platform === 'darwin') return 'macos';
  if (platform === 'win32') return 'windows';
  if (platform === 'linux') {
    // Check for desktop environment
    const desktop = process.env['XDG_CURRENT_DESKTOP']?.toLowerCase() ?? '';
    const session = process.env['DESKTOP_SESSION']?.toLowerCase() ?? '';

    if (desktop.includes('gnome') || session.includes('gnome')) {
      return 'linux-gnome';
    }
    if (desktop.includes('kde') || desktop.includes('plasma') || session.includes('kde')) {
      return 'linux-kde';
    }
    // Default to GNOME detection (most common)
    return 'linux-gnome';
  }
  return 'unknown';
}

/**
 * Detect appearance for the current platform.
 *
 * @param timeout - Timeout for system calls (ms)
 * @returns Appearance result
 *
 * @internal
 */
export async function detectPlatformAppearance(timeout: number): Promise<AppearanceResult> {
  const platform = detectPlatform();

  switch (platform) {
    case 'macos':
      return detectMacOSAppearance(timeout);
    case 'linux-gnome':
      return detectGnomeAppearance(timeout);
    case 'linux-kde':
      return detectKDEAppearance(timeout);
    case 'windows':
      return detectWindowsAppearance(timeout);
    default:
      return { mode: 'unknown', source: 'none', confidence: 'low' };
  }
}

/**
 * Synchronously detect appearance for the current platform.
 *
 * Only works on macOS currently. Returns 'unknown' for other platforms.
 *
 * @returns Appearance result
 *
 * @internal
 */
export function detectPlatformAppearanceSync(): AppearanceResult {
  const platform = detectPlatform();

  if (platform === 'macos') {
    return detectMacOSAppearanceSync();
  }

  // Sync detection not supported on other platforms
  return { mode: 'unknown', source: 'none', confidence: 'low' };
}
