import { exec } from 'node:child_process';
import type { AppearanceResult } from '../types.js';

/**
 * Detect Windows appearance from registry.
 *
 * AppsUseLightTheme: 0 = dark, 1 = light
 *
 * @param timeout - Timeout for the command (ms)
 * @returns Appearance result
 *
 * @internal
 */
export async function detectWindowsAppearance(timeout: number): Promise<AppearanceResult> {
  return new Promise((resolve) => {
    const timer = globalThis.setTimeout(() => {
      resolve({ mode: 'unknown', source: 'none', confidence: 'low' });
    }, timeout);

    const regPath = 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize';
    const cmd = `reg query "${regPath}" /v AppsUseLightTheme`;

    exec(cmd, { encoding: 'utf8' }, (error, stdout) => {
      globalThis.clearTimeout(timer);

      if (error !== null) {
        resolve({ mode: 'unknown', source: 'none', confidence: 'low' });
        return;
      }

      // Parse REG_DWORD value
      const match = /AppsUseLightTheme\s+REG_DWORD\s+(0x[0-9a-fA-F]+)/i.exec(stdout);
      const hexValue = match?.[1];
      if (hexValue !== undefined) {
        const value = parseInt(hexValue, 16);
        resolve({
          mode: value === 0 ? 'dark' : 'light',
          source: 'windows',
          confidence: 'high',
        });
      } else {
        resolve({ mode: 'unknown', source: 'none', confidence: 'low' });
      }
    });
  });
}
