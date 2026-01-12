import { EventEmitter } from 'node:events';
import type {
  AppearanceMode,
  AppearanceChangeEvent,
  WatchAppearanceOptions,
  AppearanceWatcher,
} from './types.js';
import { detectAppearance } from './detect.js';

/**
 * Default polling interval (ms).
 */
const DEFAULT_POLL_INTERVAL = 5000;

/**
 * Default timeout for detection (ms).
 */
const DEFAULT_TIMEOUT = 500;

/**
 * Watch for system appearance changes.
 *
 * Returns an EventEmitter that emits 'change' events when the
 * system appearance mode changes. The watcher polls at regular
 * intervals (default: 5 seconds) and automatically cleans up when:
 * - The AbortSignal is triggered
 * - dispose() is called
 * - The process exits
 *
 * The interval is unref'd so it won't keep the Node.js process alive.
 *
 * @param options - Watch options
 * @returns An AppearanceWatcher that emits 'change' and 'error' events
 *
 * @example
 * ```typescript
 * const watcher = watchAppearance();
 *
 * watcher.on('change', (event) => {
 *   console.log(`Appearance changed: ${event.previousMode} -> ${event.currentMode}`);
 * });
 *
 * // Later, clean up
 * watcher.dispose();
 * ```
 *
 * @example
 * Using AbortSignal for cleanup:
 * ```typescript
 * const controller = new AbortController();
 * const watcher = watchAppearance({ signal: controller.signal });
 *
 * watcher.on('change', (event) => {
 *   console.log(`Mode: ${event.currentMode}`);
 * });
 *
 * // Later, abort to clean up
 * controller.abort();
 * ```
 *
 * @public
 */
export function watchAppearance(options: WatchAppearanceOptions = {}): AppearanceWatcher {
  const { pollInterval = DEFAULT_POLL_INTERVAL, signal, timeout = DEFAULT_TIMEOUT } = options;

  const emitter = new EventEmitter() as AppearanceWatcher;
  let currentMode: AppearanceMode = 'unknown';
  let intervalId: ReturnType<typeof globalThis.setInterval> | null = null;
  let disposed = false;

  // Make currentMode accessible
  Object.defineProperty(emitter, 'currentMode', {
    get: () => currentMode,
    enumerable: true,
  });

  const dispose = (): void => {
    if (disposed) return;
    disposed = true;

    if (intervalId !== null) {
      globalThis.clearInterval(intervalId);
      intervalId = null;
    }

    // Remove process listeners
    process.removeListener('exit', dispose);
    process.removeListener('SIGINT', dispose);
    process.removeListener('SIGTERM', dispose);

    emitter.emit('dispose');
    emitter.removeAllListeners();
  };

  emitter.dispose = dispose;

  const poll = async (): Promise<void> => {
    if (disposed) return;

    try {
      const result = await detectAppearance({ timeout });

      // Only emit if mode changed and is not unknown
      if (result.mode !== currentMode && result.mode !== 'unknown') {
        const event: AppearanceChangeEvent = {
          previousMode: currentMode === 'unknown' ? null : currentMode,
          currentMode: result.mode,
          result,
          timestamp: new Date(),
        };

        currentMode = result.mode;
        emitter.emit('change', event);
      } else if (currentMode === 'unknown' && result.mode !== 'unknown') {
        // First successful detection
        currentMode = result.mode;
        const event: AppearanceChangeEvent = {
          previousMode: null,
          currentMode: result.mode,
          result,
          timestamp: new Date(),
        };
        emitter.emit('change', event);
      }
    } catch (error) {
      emitter.emit('error', error instanceof Error ? error : new Error(String(error)));
    }
  };

  // Handle AbortSignal
  if (signal !== undefined) {
    if (signal.aborted) {
      disposed = true;
    } else {
      signal.addEventListener('abort', dispose, { once: true });
    }
  }

  // Cleanup on process exit
  process.on('exit', dispose);
  process.on('SIGINT', dispose);
  process.on('SIGTERM', dispose);

  // Start polling (if not aborted)
  if (!disposed) {
    // Initial poll (fire and forget - don't block construction)
    void poll();

    // Setup interval
    intervalId = globalThis.setInterval(() => {
      void poll();
    }, pollInterval);

    // Prevent interval from keeping process alive
    if (typeof intervalId === 'object' && 'unref' in intervalId) {
      intervalId.unref();
    }
  }

  return emitter;
}
