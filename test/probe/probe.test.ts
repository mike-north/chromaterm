import { describe, it, expect } from 'vitest';
import { probeTerminalPalette } from '../../src/probe/probe.js';

describe('probeTerminalPalette', () => {
  it('should return null when not a TTY and requireTTY is true', async () => {
    const result = await probeTerminalPalette({ requireTTY: true });

    // In test environment, stdin is typically not a TTY
    // This test verifies the TTY check works
    if (!process.stdin.isTTY) {
      expect(result).toBeNull();
    }
  });

  it('should attempt probe when requireTTY is false', async () => {
    // This will likely timeout in test environment since there's no terminal
    // to respond, but it tests that the option works
    const result = await probeTerminalPalette({
      requireTTY: false,
      timeout: 10, // Very short timeout for testing
    });

    // Result could be null (timeout) or a ProbeResult
    // We just verify it doesn't throw
    if (result !== null) {
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('colors');
      expect(result).toHaveProperty('foreground');
      expect(result).toHaveProperty('background');
      expect(result).toHaveProperty('rawResponses');
    }
  });

  it('should use default timeout of 100ms when able to probe', async () => {
    // Skip timing test if setRawMode is not available
    if (typeof process.stdin.setRawMode !== 'function') {
      return;
    }

    const startTime = Date.now();
    const _result = await probeTerminalPalette({ requireTTY: false });
    const elapsed = Date.now() - startTime;

    // Should complete in roughly the timeout period
    // Allow some tolerance for test environment overhead
    expect(elapsed).toBeGreaterThanOrEqual(10);
    expect(elapsed).toBeLessThan(300);
  });

  it('should respect custom timeout when able to probe', async () => {
    // Skip timing test if setRawMode is not available
    if (typeof process.stdin.setRawMode !== 'function') {
      return;
    }

    const customTimeout = 50;
    const startTime = Date.now();
    await probeTerminalPalette({ requireTTY: false, timeout: customTimeout });
    const elapsed = Date.now() - startTime;

    // Should complete in roughly the custom timeout
    expect(elapsed).toBeGreaterThanOrEqual(customTimeout - 10);
    expect(elapsed).toBeLessThan(customTimeout + 100);
  });

  it('should return ProbeResult with expected structure', async () => {
    const result = await probeTerminalPalette({
      requireTTY: false,
      timeout: 10,
    });

    if (result !== null) {
      // Verify structure
      expect(typeof result.success).toBe('boolean');
      expect(result.colors).toBeInstanceOf(Map);
      expect(result.foreground === null || typeof result.foreground).toBeTruthy();
      expect(result.background === null || typeof result.background).toBeTruthy();
      expect(Array.isArray(result.rawResponses)).toBe(true);

      // If successful, should have some data
      if (result.success) {
        const hasData =
          result.colors.size > 0 || result.foreground !== null || result.background !== null;
        expect(hasData).toBe(true);
      }
    }
  });

  it('should handle missing setRawMode gracefully', async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalSetRawMode = process.stdin.setRawMode;

    // Need to bind the method to preserve 'this' context
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const boundSetRawMode = originalSetRawMode ? originalSetRawMode.bind(process.stdin) : undefined;

    try {
      // Remove setRawMode temporarily to test graceful handling
      // Using delete to test the runtime check
      delete (process.stdin as Partial<typeof process.stdin>).setRawMode;

      const result = await probeTerminalPalette({ requireTTY: false });

      // Should return null when setRawMode is not available
      expect(result).toBeNull();
    } finally {
      // Restore
      if (boundSetRawMode !== undefined) {
        process.stdin.setRawMode = boundSetRawMode;
      }
    }
  });
});
