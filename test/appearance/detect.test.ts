import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { detectAppearance, detectAppearanceSync } from '../../src/appearance/detect.js';

describe('detectAppearance', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('environment variable override', () => {
    it('should return light mode when CHROMATERM_APPEARANCE=light', async () => {
      process.env['CHROMATERM_APPEARANCE'] = 'light';
      const result = await detectAppearance();
      expect(result.mode).toBe('light');
      expect(result.source).toBe('env');
      expect(result.confidence).toBe('high');
    });

    it('should return dark mode when CHROMATERM_APPEARANCE=dark', async () => {
      process.env['CHROMATERM_APPEARANCE'] = 'dark';
      const result = await detectAppearance();
      expect(result.mode).toBe('dark');
      expect(result.source).toBe('env');
      expect(result.confidence).toBe('high');
    });

    it('should be case-insensitive for env var', async () => {
      process.env['CHROMATERM_APPEARANCE'] = 'DARK';
      const result = await detectAppearance();
      expect(result.mode).toBe('dark');
    });

    it('should ignore invalid env var values', async () => {
      process.env['CHROMATERM_APPEARANCE'] = 'invalid';
      const result = await detectAppearance();
      // Should fall through to platform detection
      expect(result.source).not.toBe('env');
    });
  });

  describe('forceMode option', () => {
    it('should return forced mode when specified', async () => {
      const result = await detectAppearance({ forceMode: 'dark' });
      expect(result.mode).toBe('dark');
      expect(result.source).toBe('none');
      expect(result.confidence).toBe('high');
    });

    it('should respect env override over forceMode', async () => {
      process.env['CHROMATERM_APPEARANCE'] = 'light';
      const result = await detectAppearance({ forceMode: 'dark' });
      expect(result.mode).toBe('light'); // Env takes priority
      expect(result.source).toBe('env');
    });
  });

  describe('platform detection', () => {
    it('should return a result (platform dependent)', async () => {
      // Clear env to ensure we hit platform detection
      delete process.env['CHROMATERM_APPEARANCE'];
      const result = await detectAppearance({ timeout: 100 });
      expect(result).toHaveProperty('mode');
      expect(result).toHaveProperty('source');
      expect(result).toHaveProperty('confidence');
      expect(['light', 'dark', 'unknown']).toContain(result.mode);
    });

    it('should respect timeout option', async () => {
      delete process.env['CHROMATERM_APPEARANCE'];
      const start = Date.now();
      const result = await detectAppearance({ timeout: 50 });
      const elapsed = Date.now() - start;
      // Should complete within reasonable time (timeout + some buffer)
      expect(elapsed).toBeLessThan(500);
      expect(result).toHaveProperty('mode');
    });
  });
});

describe('detectAppearanceSync', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return light mode when CHROMATERM_APPEARANCE=light', () => {
    process.env['CHROMATERM_APPEARANCE'] = 'light';
    const result = detectAppearanceSync();
    expect(result.mode).toBe('light');
    expect(result.source).toBe('env');
  });

  it('should return dark mode when CHROMATERM_APPEARANCE=dark', () => {
    process.env['CHROMATERM_APPEARANCE'] = 'dark';
    const result = detectAppearanceSync();
    expect(result.mode).toBe('dark');
    expect(result.source).toBe('env');
  });

  it('should return forced mode when specified', () => {
    delete process.env['CHROMATERM_APPEARANCE'];
    const result = detectAppearanceSync({ forceMode: 'dark' });
    expect(result.mode).toBe('dark');
    expect(result.source).toBe('none');
  });

  it('should return a result synchronously', () => {
    delete process.env['CHROMATERM_APPEARANCE'];
    const result = detectAppearanceSync();
    expect(result).toHaveProperty('mode');
    expect(result).toHaveProperty('source');
    expect(result).toHaveProperty('confidence');
  });
});
