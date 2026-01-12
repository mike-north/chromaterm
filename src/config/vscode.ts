import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { RGB } from '../types.js';
import type { ParsedTerminalColors, VSCodeFamilyInfo } from './types.js';
import { parseHexColor } from './parse-hex.js';

/**
 * Mapping of VS Code color customization keys to ANSI color indices.
 */
const COLOR_KEYS = {
  'terminal.ansiBlack': 0,
  'terminal.ansiRed': 1,
  'terminal.ansiGreen': 2,
  'terminal.ansiYellow': 3,
  'terminal.ansiBlue': 4,
  'terminal.ansiMagenta': 5,
  'terminal.ansiCyan': 6,
  'terminal.ansiWhite': 7,
  'terminal.ansiBrightBlack': 8,
  'terminal.ansiBrightRed': 9,
  'terminal.ansiBrightGreen': 10,
  'terminal.ansiBrightYellow': 11,
  'terminal.ansiBrightBlue': 12,
  'terminal.ansiBrightMagenta': 13,
  'terminal.ansiBrightCyan': 14,
  'terminal.ansiBrightWhite': 15,
} as const;

/**
 * Read and parse VS Code family settings.json.
 *
 * Attempts to read settings from the detected editor's config directory,
 * with fallback paths for other VS Code family editors. Extracts terminal
 * color customizations from workbench.colorCustomizations.
 *
 * @param info - VS Code family editor information from detectVSCodeFamily
 * @returns Parsed terminal colors, or null if no settings file found or no colors configured
 *
 * @public
 */
export function parseVSCodeSettings(info: VSCodeFamilyInfo): ParsedTerminalColors | null {
  // Try detected config path first, then fallback paths
  const paths = [
    join(homedir(), info.configDir, 'User', 'settings.json'),
    // Fallback paths for other VS Code family editors
    join(homedir(), '.vscode', 'User', 'settings.json'),
    join(homedir(), '.cursor', 'User', 'settings.json'),
    join(homedir(), '.windsurf', 'User', 'settings.json'),
  ];

  for (const path of paths) {
    try {
      const content = readFileSync(path, 'utf-8');
      const settings = JSON.parse(content) as Record<string, unknown>;
      const colorCustomizations = settings['workbench.colorCustomizations'] as
        | Record<string, string>
        | undefined;

      if (!colorCustomizations) {
        continue;
      }

      return extractColors(colorCustomizations);
    } catch {
      // File doesn't exist or invalid JSON - try next
      continue;
    }
  }

  return null;
}

/**
 * Extract terminal colors from VS Code color customizations.
 */
function extractColors(customizations: Record<string, string>): ParsedTerminalColors {
  const colors = new Map<number, RGB>();

  // Extract ANSI colors
  for (const [key, index] of Object.entries(COLOR_KEYS)) {
    const hex = customizations[key];
    if (hex) {
      const rgb = parseHexColor(hex);
      if (rgb) {
        colors.set(index, rgb);
      }
    }
  }

  // Extract foreground and background
  const foreground = customizations['terminal.foreground']
    ? parseHexColor(customizations['terminal.foreground'])
    : null;

  const background = customizations['terminal.background']
    ? parseHexColor(customizations['terminal.background'])
    : null;

  return { colors, foreground, background };
}
