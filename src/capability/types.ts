/**
 * Color capability levels supported by the terminal.
 *
 * @public
 */
export type ColorLevel = 'none' | 'ansi16' | 'ansi256' | 'truecolor';

/**
 * Theme alignment capability levels for intelligent color selection.
 *
 * @public
 */
export type ThemeLevel = 'blind' | 'lightdark' | 'palette';

/**
 * Terminal capabilities detected or configured.
 *
 * @public
 */
export interface Capabilities {
  /**
   * Color output capability level (C0-C3).
   */
  color: ColorLevel;

  /**
   * Theme alignment capability level (T1-T3).
   */
  theme: ThemeLevel;

  /**
   * Whether output is to a TTY device.
   */
  isTTY: boolean;
}

/**
 * Options for capability detection.
 *
 * @public
 */
export interface DetectOptions {
  /**
   * Force a specific color capability level (for testing).
   */
  forceColor?: ColorLevel;

  /**
   * Force a specific theme capability level (for testing).
   */
  forceTheme?: ThemeLevel;

  /**
   * Override TTY detection.
   */
  isTTY?: boolean;
}
