import { execSync, exec } from 'node:child_process';
import type { AppearanceResult } from '../types.js';

/**
 * Detect macOS appearance using `defaults read`.
 *
 * AppleInterfaceStyle is only present when dark mode is active.
 * Absence of the key means light mode.
 *
 * @param timeout - Timeout for the command (ms)
 * @returns Appearance result
 *
 * @internal
 */
export async function detectMacOSAppearance(timeout: number): Promise<AppearanceResult> {
  return new Promise((resolve) => {
    const timer = globalThis.setTimeout(() => {
      resolve({ mode: 'unknown', source: 'none', confidence: 'low' });
    }, timeout);

    exec('defaults read -g AppleInterfaceStyle', { encoding: 'utf8' }, (error, stdout) => {
      globalThis.clearTimeout(timer);

      if (error !== null) {
        // Error means light mode (key doesn't exist)
        resolve({ mode: 'light', source: 'macos', confidence: 'high' });
        return;
      }

      const output = stdout.trim().toLowerCase();
      if (output === 'dark') {
        resolve({ mode: 'dark', source: 'macos', confidence: 'high' });
      } else {
        resolve({ mode: 'light', source: 'macos', confidence: 'high' });
      }
    });
  });
}

/**
 * Synchronously detect macOS appearance.
 *
 * @returns Appearance result
 *
 * @internal
 */
export function detectMacOSAppearanceSync(): AppearanceResult {
  try {
    const output = execSync('defaults read -g AppleInterfaceStyle', {
      encoding: 'utf8',
      timeout: 100,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (output.trim().toLowerCase() === 'dark') {
      return { mode: 'dark', source: 'macos', confidence: 'high' };
    }
    return { mode: 'light', source: 'macos', confidence: 'high' };
  } catch {
    // Error means light mode (key doesn't exist) or command failed
    // On macOS, missing key = light mode
    if (process.platform === 'darwin') {
      return { mode: 'light', source: 'macos', confidence: 'high' };
    }
    return { mode: 'unknown', source: 'none', confidence: 'low' };
  }
}
