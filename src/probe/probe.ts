import type { RGB } from '../types.js';
import type { ProbeOptions, ProbeResult } from './types.js';
import { generateAllQueries } from './osc.js';
import { parseOscResponses } from './parse.js';

/**
 * Drains stdin for a given duration to consume any late-arriving data.
 * This prevents terminal responses from leaking to stdout.
 *
 * @param duration - How long to drain in milliseconds
 *
 * @internal
 */
async function drainStdin(duration: number): Promise<void> {
  return new Promise((resolve) => {
    const onData = (): void => {
      // Just consume the data, don't do anything with it
    };

    process.stdin.on('data', onData);

    globalThis.setTimeout(() => {
      process.stdin.removeListener('data', onData);
      resolve();
    }, duration);
  });
}

/**
 * Probe the terminal for its color palette.
 *
 * Uses OSC escape sequences to query the terminal for:
 * - All 16 ANSI colors (indices 0-15)
 * - Default foreground color
 * - Default background color
 *
 * Returns null if probing fails, times out, or if not running in a TTY
 * (when requireTTY is true).
 *
 * @param options - Probe options
 * @returns The probe result, or null if probing fails
 *
 * @public
 */
export async function probeTerminalPalette(
  options: ProbeOptions = {}
): Promise<ProbeResult | null> {
  const { timeout = 100, requireTTY = true } = options;

  // Check if we can probe
  if (requireTTY && !process.stdin.isTTY) {
    return null;
  }

  // Check if stdin has the setRawMode method (it should for TTY)
  if (typeof process.stdin.setRawMode !== 'function') {
    return null;
  }

  // Save current raw mode state and enable raw mode
  // Raw mode is needed to read terminal responses
  const wasRawMode = process.stdin.isRaw || false;
  let buffer = '';

  try {
    process.stdin.setRawMode(true);
    process.stdin.resume();

    // Create a promise that accumulates responses
    const responsePromise = new Promise<string>((resolve) => {
      const onData = (chunk: Buffer): void => {
        buffer += chunk.toString('utf8');
      };

      process.stdin.on('data', onData);

      // After timeout, clean up and resolve
      // Using globalThis to access setTimeout (Node.js environment)
      globalThis.setTimeout(() => {
        process.stdin.removeListener('data', onData);
        resolve(buffer);
      }, timeout);
    });

    // Send all queries at once
    const queries = generateAllQueries();
    process.stdout.write(queries);

    // Wait for responses (or timeout)
    buffer = await responsePromise;

    // Drain any late-arriving responses to prevent them from leaking to stdout
    // Some terminals send responses asynchronously
    await drainStdin(50);

    // Parse accumulated responses
    const parsed = parseOscResponses(buffer);

    // Build result
    const colors = new Map<number, RGB>();
    let foreground: RGB | null = null;
    let background: RGB | null = null;

    for (const response of parsed) {
      if (response.type === 'color' && response.index !== undefined) {
        colors.set(response.index, response.rgb);
      } else if (response.type === 'foreground') {
        foreground = response.rgb;
      } else if (response.type === 'background') {
        background = response.rgb;
      }
    }

    // Consider success if we got at least some responses
    const success = colors.size > 0 || foreground !== null || background !== null;

    return {
      success,
      colors,
      foreground,
      background,
      rawResponses: parsed.length > 0 ? [buffer] : [],
    };
  } catch {
    // If anything goes wrong, return null
    return null;
  } finally {
    // ALWAYS restore stdin mode
    try {
      process.stdin.setRawMode(wasRawMode);
      if (!wasRawMode) {
        process.stdin.pause();
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}
