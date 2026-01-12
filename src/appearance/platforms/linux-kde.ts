import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { AppearanceResult } from '../types.js';

/**
 * Detect KDE appearance from kdeglobals config.
 *
 * Looks for [General] ColorScheme or [KDE] LookAndFeelPackage
 *
 * @param timeout - Timeout for file reading (ms)
 * @returns Appearance result
 *
 * @internal
 */
export async function detectKDEAppearance(timeout: number): Promise<AppearanceResult> {
  const configPath = join(homedir(), '.config', 'kdeglobals');

  try {
    const controller = new globalThis.AbortController();
    const timeoutId = globalThis.setTimeout(() => {
      controller.abort();
    }, timeout);

    const content = await readFile(configPath, {
      encoding: 'utf8',
      signal: controller.signal,
    });
    globalThis.clearTimeout(timeoutId);

    // Look for dark-themed color schemes
    const colorSchemeMatch = /ColorScheme\s*=\s*(.+)/i.exec(content);
    const schemeValue = colorSchemeMatch?.[1];
    if (schemeValue !== undefined) {
      const scheme = schemeValue.toLowerCase();
      if (scheme.includes('dark') || scheme.includes('breeze-dark')) {
        return { mode: 'dark', source: 'kde', confidence: 'high' };
      }
      if (scheme.includes('light') || scheme.includes('breeze')) {
        return { mode: 'light', source: 'kde', confidence: 'high' };
      }
    }

    // Fallback: check LookAndFeelPackage
    const lafMatch = /LookAndFeelPackage\s*=\s*(.+)/i.exec(content);
    const lafValue = lafMatch?.[1];
    if (lafValue !== undefined) {
      const laf = lafValue.toLowerCase();
      if (laf.includes('dark')) {
        return { mode: 'dark', source: 'kde', confidence: 'medium' };
      }
      if (laf.includes('light')) {
        return { mode: 'light', source: 'kde', confidence: 'medium' };
      }
    }

    return { mode: 'unknown', source: 'kde', confidence: 'low' };
  } catch {
    return { mode: 'unknown', source: 'none', confidence: 'low' };
  }
}
