import type { ParsedTerminalColors } from './types.js';
import { detectVSCodeFamily } from './detect-editor.js';
import { parseVSCodeSettings } from './vscode.js';

export * from './types.js';
export { detectVSCodeFamily } from './detect-editor.js';
export { parseVSCodeSettings } from './vscode.js';
export { parseHexColor } from './parse-hex.js';

/**
 * Try to read terminal colors from config files.
 *
 * Currently supports VS Code family editors (VS Code, Cursor, Windsurf).
 * Detects the current editor and attempts to parse its settings.json file
 * to extract terminal color customizations.
 *
 * @returns Parsed terminal colors if found and configured, null otherwise
 *
 * @public
 */
export function readTerminalConfig(): ParsedTerminalColors | null {
  const vsCodeInfo = detectVSCodeFamily();
  if (vsCodeInfo) {
    return parseVSCodeSettings(vsCodeInfo);
  }

  return null;
}
