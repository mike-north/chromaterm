import { exec } from 'node:child_process';
import type { AppearanceResult } from '../types.js';

/**
 * Detect GNOME appearance using gsettings.
 *
 * Possible values:
 * - 'default' or 'prefer-light' -> light
 * - 'prefer-dark' -> dark
 *
 * @param timeout - Timeout for the command (ms)
 * @returns Appearance result
 *
 * @internal
 */
export async function detectGnomeAppearance(timeout: number): Promise<AppearanceResult> {
  return new Promise((resolve) => {
    const timer = globalThis.setTimeout(() => {
      resolve({ mode: 'unknown', source: 'none', confidence: 'low' });
    }, timeout);

    exec(
      'gsettings get org.gnome.desktop.interface color-scheme',
      { encoding: 'utf8' },
      (error, stdout) => {
        globalThis.clearTimeout(timer);

        if (error !== null) {
          resolve({ mode: 'unknown', source: 'none', confidence: 'low' });
          return;
        }

        const output = stdout.trim().toLowerCase().replace(/'/g, '');
        if (output.includes('dark')) {
          resolve({ mode: 'dark', source: 'gnome', confidence: 'high' });
        } else {
          resolve({ mode: 'light', source: 'gnome', confidence: 'high' });
        }
      }
    );
  });
}
