import type { RGB } from '../types.js';

/**
 * VS Code family editor identifiers.
 *
 * @public
 */
export type VSCodeEditor = 'vscode' | 'cursor' | 'windsurf';

/**
 * Information about a detected VS Code family editor.
 *
 * @public
 */
export interface VSCodeFamilyInfo {
  /** The detected editor (vscode, cursor, or windsurf) */
  editor: VSCodeEditor;
  /** Config directory name (e.g., '.vscode', '.cursor', '.windsurf') */
  configDir: string;
}

/**
 * Parsed terminal color configuration from editor settings.
 *
 * @public
 */
export interface ParsedTerminalColors {
  /** Terminal foreground color, if configured */
  foreground: RGB | null;
  /** Terminal background color, if configured */
  background: RGB | null;
  /** ANSI color palette (indices 0-15) */
  colors: Map<number, RGB>;
}
