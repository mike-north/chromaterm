import type { RGB } from '../types.js';

/**
 * Result of probing the terminal palette.
 *
 * @public
 */
export interface ProbeResult {
  /** Whether the probe was successful */
  success: boolean;
  /** RGB values for ANSI colors 0-15 */
  colors: Map<number, RGB>;
  /** Default foreground color */
  foreground: RGB | null;
  /** Default background color */
  background: RGB | null;
  /** Raw responses for debugging */
  rawResponses: string[];
}

/**
 * Options for terminal palette probing.
 *
 * @public
 */
export interface ProbeOptions {
  /** Timeout in milliseconds (default: 100) */
  timeout?: number;
  /** Skip probe if not a TTY (default: true) */
  requireTTY?: boolean;
}
