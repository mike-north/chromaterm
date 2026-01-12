import type { VSCodeFamilyInfo } from './types.js';

/**
 * Detect if running in a VS Code family terminal.
 *
 * Detects VS Code, Cursor, and Windsurf terminals by examining environment
 * variables including TERM_PROGRAM, __CFBundleIdentifier (macOS), and
 * editor-specific variables like CURSOR_CLI.
 *
 * @returns VSCodeFamilyInfo if running in a VS Code family editor, null otherwise
 *
 * @public
 */
export function detectVSCodeFamily(): VSCodeFamilyInfo | null {
  const termProgram = process.env['TERM_PROGRAM']?.toLowerCase();

  if (termProgram !== 'vscode') {
    return null;
  }

  // macOS: check bundle identifier
  const bundleId = process.env['__CFBundleIdentifier'] ?? '';

  if (bundleId.includes('windsurf')) {
    return { editor: 'windsurf', configDir: '.windsurf' };
  }

  if (bundleId.includes('VSCode')) {
    return { editor: 'vscode', configDir: '.vscode' };
  }

  // Cursor: check their env vars (bundle ID is unstable)
  if (process.env['CURSOR_CLI'] || process.env['CURSOR_TRACE_ID']) {
    return { editor: 'cursor', configDir: '.cursor' };
  }

  // Unknown VS Code derivative - default to .vscode
  return { editor: 'vscode', configDir: '.vscode' };
}
