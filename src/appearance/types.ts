import type { EventEmitter } from 'node:events';

/**
 * System appearance modes.
 *
 * @public
 */
export type AppearanceMode = 'light' | 'dark' | 'unknown';

/**
 * Source of appearance detection.
 *
 * @public
 */
export type AppearanceSource = 'macos' | 'gnome' | 'kde' | 'windows' | 'terminal' | 'env' | 'none';

/**
 * Confidence level of the detection result.
 *
 * @public
 */
export type AppearanceConfidence = 'high' | 'medium' | 'low';

/**
 * Result from appearance detection.
 *
 * @public
 */
export interface AppearanceResult {
  /** The detected mode */
  mode: AppearanceMode;
  /** Source of detection (for debugging) */
  source: AppearanceSource;
  /** Confidence level */
  confidence: AppearanceConfidence;
}

/**
 * Options for appearance detection.
 *
 * @public
 */
export interface DetectAppearanceOptions {
  /** Force a specific mode (for testing) */
  forceMode?: AppearanceMode;
  /** Timeout for system calls (ms). Default: 500 */
  timeout?: number;
}

/**
 * Options for watching appearance changes.
 *
 * @public
 */
export interface WatchAppearanceOptions {
  /** Polling interval in milliseconds (default: 5000) */
  pollInterval?: number;
  /** AbortSignal for cleanup */
  signal?: globalThis.AbortSignal;
  /** Timeout for each detection (ms). Default: 500 */
  timeout?: number;
}

/**
 * Event data emitted on appearance change.
 *
 * @public
 */
export interface AppearanceChangeEvent {
  /** Previous mode (null on first detection) */
  previousMode: AppearanceMode | null;
  /** Current mode */
  currentMode: AppearanceMode;
  /** Detection result with source info */
  result: AppearanceResult;
  /** Timestamp of change */
  timestamp: Date;
}

/**
 * Appearance watcher interface.
 *
 * @public
 */
export interface AppearanceWatcher extends EventEmitter {
  /** Current detected mode */
  readonly currentMode: AppearanceMode;

  /** Stop watching and clean up resources */
  dispose(): void;

  // All 'on' overloads grouped together
  /** Event: appearance changed */
  on(event: 'change', listener: (event: AppearanceChangeEvent) => void): this;
  /** Event: error during detection */
  on(event: 'error', listener: (error: Error) => void): this;
  /** Event: disposed */
  on(event: 'dispose', listener: () => void): this;
  /** Generic event listener */
  on(event: string | symbol, listener: (...args: unknown[]) => void): this;

  // All 'once' overloads grouped together
  once(event: 'change', listener: (event: AppearanceChangeEvent) => void): this;
  once(event: 'error', listener: (error: Error) => void): this;
  once(event: 'dispose', listener: () => void): this;
  once(event: string | symbol, listener: (...args: unknown[]) => void): this;

  emit(event: string | symbol, ...args: unknown[]): boolean;
  removeListener(event: string | symbol, listener: (...args: unknown[]) => void): this;
  removeAllListeners(event?: string | symbol): this;
}
