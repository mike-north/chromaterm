import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  detectCapabilities,
  detectColorLevel,
  isColorDisabled,
  isColorForced,
  type Capabilities,
} from '../../src/capability/index.js';

// Mock supports-color module
vi.mock('supports-color', () => ({
  default: {
    stdout: { level: 3 },
  },
}));

describe('capability detection', () => {
  // Save original values
  const originalEnv = process.env;
  const originalIsTTY = process.stdout.isTTY;

  beforeEach(() => {
    // Reset environment to clean state
    process.env = { ...originalEnv };
    delete process.env['NO_COLOR'];
    delete process.env['FORCE_COLOR'];
    // Reset stdout.isTTY
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore original values
    process.env = originalEnv;
    Object.defineProperty(process.stdout, 'isTTY', {
      value: originalIsTTY,
      writable: true,
      configurable: true,
    });
  });

  describe('isColorDisabled', () => {
    it('should return true when NO_COLOR is set to any value', () => {
      process.env['NO_COLOR'] = '1';
      expect(isColorDisabled()).toBe(true);
    });

    it('should return true when NO_COLOR is empty string', () => {
      process.env['NO_COLOR'] = '';
      expect(isColorDisabled()).toBe(true);
    });

    it('should return false when NO_COLOR is not set', () => {
      delete process.env['NO_COLOR'];
      expect(isColorDisabled()).toBe(false);
    });
  });

  describe('isColorForced', () => {
    it('should return false when FORCE_COLOR is not set', () => {
      delete process.env['FORCE_COLOR'];
      expect(isColorForced()).toBe(false);
    });

    it('should return 1 for empty string', () => {
      process.env['FORCE_COLOR'] = '';
      expect(isColorForced()).toBe(1);
    });

    it('should return 0 for FORCE_COLOR=0', () => {
      process.env['FORCE_COLOR'] = '0';
      expect(isColorForced()).toBe(0);
    });

    it('should return 1 for FORCE_COLOR=1', () => {
      process.env['FORCE_COLOR'] = '1';
      expect(isColorForced()).toBe(1);
    });

    it('should return 2 for FORCE_COLOR=2', () => {
      process.env['FORCE_COLOR'] = '2';
      expect(isColorForced()).toBe(2);
    });

    it('should return 3 for FORCE_COLOR=3', () => {
      process.env['FORCE_COLOR'] = '3';
      expect(isColorForced()).toBe(3);
    });

    it('should clamp values above 3', () => {
      process.env['FORCE_COLOR'] = '999';
      expect(isColorForced()).toBe(3);
    });

    it('should clamp negative values to 0', () => {
      process.env['FORCE_COLOR'] = '-1';
      expect(isColorForced()).toBe(0);
    });

    it('should return 1 for non-numeric values', () => {
      process.env['FORCE_COLOR'] = 'true';
      expect(isColorForced()).toBe(1);
    });
  });

  describe('detectColorLevel', () => {
    it('should return none when NO_COLOR is set', () => {
      process.env['NO_COLOR'] = '1';
      expect(detectColorLevel()).toBe('none');
    });

    it('should return none when NO_COLOR is empty string', () => {
      process.env['NO_COLOR'] = '';
      expect(detectColorLevel()).toBe('none');
    });

    it('should return none for FORCE_COLOR=0', () => {
      process.env['FORCE_COLOR'] = '0';
      expect(detectColorLevel()).toBe('none');
    });

    it('should return ansi16 for FORCE_COLOR=1', () => {
      process.env['FORCE_COLOR'] = '1';
      expect(detectColorLevel()).toBe('ansi16');
    });

    it('should return ansi256 for FORCE_COLOR=2', () => {
      process.env['FORCE_COLOR'] = '2';
      expect(detectColorLevel()).toBe('ansi256');
    });

    it('should return truecolor for FORCE_COLOR=3', () => {
      process.env['FORCE_COLOR'] = '3';
      expect(detectColorLevel()).toBe('truecolor');
    });

    it('should return none when not a TTY', () => {
      Object.defineProperty(process.stdout, 'isTTY', { value: false });
      expect(detectColorLevel()).toBe('none');
    });

    it('should use supports-color when TTY', () => {
      // Mock returns level 3 (truecolor)
      expect(detectColorLevel()).toBe('truecolor');
    });

    it('should respect forceColor option', () => {
      expect(detectColorLevel({ forceColor: 'ansi256' })).toBe('ansi256');
    });

    it('should prioritize forceColor over NO_COLOR', () => {
      process.env['NO_COLOR'] = '1';
      expect(detectColorLevel({ forceColor: 'truecolor' })).toBe('truecolor');
    });

    it('should prioritize forceColor over FORCE_COLOR', () => {
      process.env['FORCE_COLOR'] = '1';
      expect(detectColorLevel({ forceColor: 'ansi256' })).toBe('ansi256');
    });

    it('should respect isTTY option override when true', () => {
      Object.defineProperty(process.stdout, 'isTTY', { value: false });
      expect(detectColorLevel({ isTTY: true })).toBe('truecolor');
    });

    it('should respect isTTY option override when false', () => {
      Object.defineProperty(process.stdout, 'isTTY', { value: true });
      expect(detectColorLevel({ isTTY: false })).toBe('none');
    });
  });

  describe('detectCapabilities', () => {
    it('should return capabilities object with all fields', () => {
      const caps = detectCapabilities();
      expect(caps).toHaveProperty('color');
      expect(caps).toHaveProperty('theme');
      expect(caps).toHaveProperty('isTTY');
    });

    it('should detect truecolor on TTY with supports-color', () => {
      const caps = detectCapabilities();
      expect(caps.color).toBe('truecolor');
      expect(caps.isTTY).toBe(true);
    });

    it('should return blind theme level by default', () => {
      const caps = detectCapabilities();
      expect(caps.theme).toBe('blind');
    });

    it('should respect forceColor option', () => {
      const caps = detectCapabilities({ forceColor: 'ansi16' });
      expect(caps.color).toBe('ansi16');
    });

    it('should respect forceTheme option', () => {
      const caps = detectCapabilities({ forceTheme: 'lightdark' });
      expect(caps.theme).toBe('lightdark');
    });

    it('should respect isTTY option', () => {
      const caps = detectCapabilities({ isTTY: false });
      expect(caps.isTTY).toBe(false);
      expect(caps.color).toBe('none');
    });

    it('should return none when NO_COLOR is set', () => {
      process.env['NO_COLOR'] = '1';
      const caps = detectCapabilities();
      expect(caps.color).toBe('none');
    });

    it('should respect FORCE_COLOR environment variable', () => {
      process.env['FORCE_COLOR'] = '2';
      const caps = detectCapabilities();
      expect(caps.color).toBe('ansi256');
    });

    it('should handle multiple options together', () => {
      const caps = detectCapabilities({
        forceColor: 'truecolor',
        forceTheme: 'palette',
        isTTY: true,
      });
      expect(caps.color).toBe('truecolor');
      expect(caps.theme).toBe('palette');
      expect(caps.isTTY).toBe(true);
    });

    it('should detect isTTY from process.stdout when not overridden', () => {
      Object.defineProperty(process.stdout, 'isTTY', { value: true });
      const caps = detectCapabilities();
      expect(caps.isTTY).toBe(true);
    });

    it('should handle missing isTTY property', () => {
      Object.defineProperty(process.stdout, 'isTTY', { value: undefined });
      const caps = detectCapabilities();
      expect(caps.isTTY).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle NO_COLOR taking precedence over FORCE_COLOR', () => {
      process.env['NO_COLOR'] = '1';
      process.env['FORCE_COLOR'] = '3';
      expect(detectColorLevel()).toBe('none');
    });

    it('should handle empty options object', () => {
      const caps = detectCapabilities({});
      expect(caps).toHaveProperty('color');
      expect(caps).toHaveProperty('theme');
      expect(caps).toHaveProperty('isTTY');
    });

    it('should handle partial options', () => {
      const caps = detectCapabilities({ forceColor: 'ansi256' });
      expect(caps.color).toBe('ansi256');
      expect(caps.theme).toBe('blind'); // Default
      expect(caps.isTTY).toBe(true); // From process.stdout
    });
  });

  describe('integration', () => {
    it('should provide consistent results across multiple calls', () => {
      const caps1 = detectCapabilities();
      const caps2 = detectCapabilities();
      expect(caps1).toEqual(caps2);
    });

    it('should properly type-check return values', () => {
      const caps: Capabilities = detectCapabilities();
      // Type assertion - if this compiles, types are correct
      const _color: 'none' | 'ansi16' | 'ansi256' | 'truecolor' = caps.color;
      const _theme: 'blind' | 'lightdark' | 'palette' = caps.theme;
      const _isTTY: boolean = caps.isTTY;
      expect(caps).toBeDefined();
    });
  });
});
