import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { watchAppearance } from '../../src/appearance/watch.js';
import type { AppearanceWatcher } from '../../src/appearance/types.js';

describe('watchAppearance', () => {
  const originalEnv = process.env;
  let watcher: AppearanceWatcher | null = null;

  // Helper to get watcher with type safety
  const getWatcher = (): AppearanceWatcher => {
    if (watcher === null) {
      throw new Error('Watcher not initialized');
    }
    return watcher;
  };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    // Set a known appearance to make tests deterministic
    process.env['CHROMATERM_APPEARANCE'] = 'light';
  });

  afterEach(() => {
    process.env = originalEnv;
    if (watcher !== null) {
      watcher.dispose();
      watcher = null;
    }
  });

  it('should create a watcher with currentMode property', () => {
    watcher = watchAppearance();
    expect(watcher).toHaveProperty('currentMode');
    expect(watcher).toHaveProperty('dispose');
  });

  it('should emit change event on initial detection', async () => {
    process.env['CHROMATERM_APPEARANCE'] = 'dark';
    watcher = watchAppearance();
    const w = getWatcher();

    const changeEvent = await new Promise<{
      currentMode: string;
      previousMode: string | null;
    }>((resolve) => {
      w.once('change', (event) => {
        resolve(event);
      });
    });

    expect(changeEvent.currentMode).toBe('dark');
    expect(changeEvent.previousMode).toBe(null);
  });

  it('should update currentMode after detection', async () => {
    process.env['CHROMATERM_APPEARANCE'] = 'dark';
    watcher = watchAppearance();
    const w = getWatcher();

    // Wait for initial detection
    await new Promise<void>((resolve) => {
      w.once('change', () => {
        resolve();
      });
    });

    expect(watcher.currentMode).toBe('dark');
  });

  it('should dispose and stop emitting events', async () => {
    watcher = watchAppearance({ pollInterval: 50 });
    const w = getWatcher();

    // Wait for initial detection
    await new Promise<void>((resolve) => {
      w.once('change', () => {
        resolve();
      });
    });

    const changeHandler = vi.fn();
    watcher.on('change', changeHandler);

    watcher.dispose();

    // Wait a bit to ensure no more events are emitted
    await new Promise((resolve) => {
      globalThis.setTimeout(resolve, 100);
    });

    // Only the initial event should have occurred
    expect(changeHandler).not.toHaveBeenCalled();
  });

  it('should respect AbortSignal', async () => {
    const controller = new globalThis.AbortController();
    watcher = watchAppearance({ signal: controller.signal });
    const w = getWatcher();

    // Wait for initial detection
    await new Promise<void>((resolve) => {
      w.once('change', () => {
        resolve();
      });
    });

    const disposeHandler = vi.fn();
    watcher.once('dispose', disposeHandler);

    controller.abort();

    // Give it time to process
    await new Promise((resolve) => {
      globalThis.setTimeout(resolve, 10);
    });

    expect(disposeHandler).toHaveBeenCalled();
  });

  it('should handle already aborted signal', () => {
    const controller = new globalThis.AbortController();
    controller.abort();

    watcher = watchAppearance({ signal: controller.signal });

    // Should be disposed immediately
    const changeHandler = vi.fn();
    watcher.on('change', changeHandler);

    // No events should be emitted
    expect(changeHandler).not.toHaveBeenCalled();
  });

  it('should emit dispose event when disposed', async () => {
    watcher = watchAppearance();
    const w = getWatcher();

    const disposePromise = new Promise<void>((resolve) => {
      w.once('dispose', () => {
        resolve();
      });
    });

    watcher.dispose();

    await expect(disposePromise).resolves.toBeUndefined();
  });

  it('should allow configuring poll interval', () => {
    watcher = watchAppearance({ pollInterval: 1000 });
    expect(watcher).toBeDefined();
    // The interval is internal, so we just verify it doesn't throw
  });

  it('should not throw when dispose is called multiple times', () => {
    watcher = watchAppearance();
    const w = getWatcher();
    expect(() => {
      w.dispose();
      w.dispose();
      w.dispose();
    }).not.toThrow();
  });
});
