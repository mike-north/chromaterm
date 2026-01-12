/**
 * Type definitions for supports-color v7.x
 * The package doesn't ship with types, so we provide minimal declarations.
 */
declare module 'supports-color' {
  interface SupportsColorInfo {
    level: 0 | 1 | 2 | 3;
    hasBasic: boolean;
    has256: boolean;
    has16m: boolean;
  }

  interface SupportsColor {
    stdout: SupportsColorInfo | false;
    stderr: SupportsColorInfo | false;
  }

  const supportsColor: SupportsColor;
  export default supportsColor;
}
