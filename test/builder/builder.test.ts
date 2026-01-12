/* eslint-disable no-control-regex */
import { describe, it, expect } from 'vitest';
import { createT1Theme } from '../../src/theme/theme.js';

describe('Color builder', () => {
  const theme = createT1Theme({ forceColor: 'ansi16', isTTY: true });

  describe('callable interface', () => {
    it('should be callable with text', () => {
      const result = theme.red('Hello');
      expect(typeof result).toBe('string');
      expect(result).toContain('Hello');
    });

    it('should return plain text when color is disabled', () => {
      const noColorTheme = createT1Theme({ forceColor: 'none', isTTY: false });
      const result = noColorTheme.red('Hello');
      expect(result).toBe('Hello');
    });

    it('should produce ANSI escape codes when color is enabled', () => {
      const result = theme.red('Hello');
      // Should contain ANSI escape sequences (ESC[...m)
      expect(result).toMatch(/\x1b\[/);
    });
  });

  describe('transform methods', () => {
    it('should return new Color instance from saturate', () => {
      const original = theme.red;
      const saturated = original.saturate(0.5);
      expect(saturated).not.toBe(original);
      expect(typeof saturated).toBe('function'); // Color is callable
    });

    it('should return new Color instance from desaturate', () => {
      const original = theme.red;
      const desaturated = original.desaturate(0.5);
      expect(desaturated).not.toBe(original);
      expect(typeof desaturated).toBe('function');
    });

    it('should return new Color instance from lighten', () => {
      const original = theme.red;
      const lightened = original.lighten(0.2);
      expect(lightened).not.toBe(original);
      expect(typeof lightened).toBe('function');
    });

    it('should return new Color instance from darken', () => {
      const original = theme.red;
      const darkened = original.darken(0.2);
      expect(darkened).not.toBe(original);
      expect(typeof darkened).toBe('function');
    });

    it('should return new Color instance from rotate', () => {
      const original = theme.red;
      const rotated = original.rotate(180);
      expect(rotated).not.toBe(original);
      expect(typeof rotated).toBe('function');
    });

    it('should allow chaining transforms', () => {
      const result = theme.red.saturate(0.5).lighten(0.2).rotate(30);
      expect(typeof result).toBe('function');
    });

    it('should not change output at T1 (transforms are no-ops)', () => {
      const original = theme.red('test');
      const transformed = theme.red.saturate(0.5).lighten(0.2)('test');
      // At T1, transforms don't change the output - still uses ANSI red
      expect(transformed).toBe(original);
    });

    it('should handle negative transform amounts', () => {
      const result = theme.red.saturate(-0.5).lighten(-0.2);
      expect(typeof result).toBe('function');
    });

    it('should handle large rotation angles', () => {
      const result = theme.red.rotate(720);
      expect(typeof result).toBe('function');
    });
  });

  describe('modifier methods', () => {
    it('should apply bold modifier', () => {
      const result = theme.red.bold()('test');
      expect(result).toContain('test');
      // Should have bold escape code
      expect(result).toMatch(/\x1b\[1m/);
    });

    it('should apply dim modifier', () => {
      const result = theme.red.dim()('test');
      expect(result).toContain('test');
    });

    it('should apply italic modifier', () => {
      const result = theme.red.italic()('test');
      expect(result).toContain('test');
    });

    it('should apply underline modifier', () => {
      const result = theme.red.underline()('test');
      expect(result).toContain('test');
      // Should have underline escape code
      expect(result).toMatch(/\x1b\[4m/);
    });

    it('should apply strikethrough modifier', () => {
      const result = theme.red.strikethrough()('test');
      expect(result).toContain('test');
    });

    it('should apply hidden modifier', () => {
      const result = theme.red.hidden()('test');
      expect(result).toContain('test');
    });

    it('should return new Color instance from bold', () => {
      const original = theme.red;
      const bolded = original.bold();
      expect(bolded).not.toBe(original);
    });

    it('should return new Color instance from each modifier', () => {
      const original = theme.red;
      expect(original.dim()).not.toBe(original);
      expect(original.italic()).not.toBe(original);
      expect(original.underline()).not.toBe(original);
      expect(original.strikethrough()).not.toBe(original);
      expect(original.hidden()).not.toBe(original);
    });

    it('should allow chaining modifiers', () => {
      const result = theme.red.bold().underline().italic()('test');
      expect(result).toContain('test');
      // Should have multiple escape codes
      expect(result).toMatch(/\x1b\[1m/); // bold
      expect(result).toMatch(/\x1b\[4m/); // underline
    });

    it('should combine transforms and modifiers', () => {
      const result = theme.red.saturate(0.5).bold().lighten(0.2).underline()('test');
      expect(result).toContain('test');
      expect(result).toMatch(/\x1b\[1m/); // bold
      expect(result).toMatch(/\x1b\[4m/); // underline
    });
  });

  describe('composition methods', () => {
    it('should apply background color with on()', () => {
      const result = theme.red.on(theme.blue)('test');
      expect(result).toContain('test');
      // Should have both foreground and background escape codes
      expect(result).toMatch(/\x1b\[/);
    });

    it('should return new Color instance from on()', () => {
      const original = theme.red;
      const withBg = original.on(theme.blue);
      expect(withBg).not.toBe(original);
    });

    it('should apply inverse modifier', () => {
      const result = theme.red.inverse()('test');
      expect(result).toContain('test');
      // Should have inverse escape code
      expect(result).toMatch(/\x1b\[7m/);
    });

    it('should return new Color instance from inverse()', () => {
      const original = theme.red;
      const inverted = original.inverse();
      expect(inverted).not.toBe(original);
    });

    it('should chain on() with modifiers', () => {
      const result = theme.red.on(theme.blue).bold().underline()('test');
      expect(result).toContain('test');
    });

    it('should allow multiple background changes', () => {
      const firstBg = theme.red.on(theme.blue);
      const secondBg = firstBg.on(theme.green);
      expect(secondBg).not.toBe(firstBg);
      const result = secondBg('test');
      expect(result).toContain('test');
    });
  });

  describe('introspection', () => {
    it('should expose ansi property', () => {
      expect(theme.red.ansi).toBe(1);
      expect(theme.green.ansi).toBe(2);
      expect(theme.blue.ansi).toBe(4);
      expect(theme.brightRed.ansi).toBe(9);
    });

    it('should expose rgb property as null at T1', () => {
      expect(theme.red.rgb).toBeNull();
      expect(theme.green.rgb).toBeNull();
      expect(theme.blue.rgb).toBeNull();
    });

    it('should preserve ansi after transforms', () => {
      const transformed = theme.red.saturate(0.5).lighten(0.2);
      expect(transformed.ansi).toBe(1);
    });

    it('should preserve ansi after modifiers', () => {
      const modified = theme.red.bold().underline();
      expect(modified.ansi).toBe(1);
    });

    it('should preserve ansi after composition', () => {
      const composed = theme.red.on(theme.blue);
      expect(composed.ansi).toBe(1);
    });
  });

  describe('immutability', () => {
    it('should not mutate original Color on transform', () => {
      const original = theme.red;
      const originalAnsi = original.ansi;
      const transformed = original.saturate(0.5);

      expect(original.ansi).toBe(originalAnsi);
      expect(transformed.ansi).toBe(originalAnsi);
    });

    it('should not mutate original Color on modifier', () => {
      const original = theme.red;
      const modified = original.bold();

      // Both should render differently
      const originalResult = original('test');
      const modifiedResult = modified('test');

      expect(originalResult).not.toBe(modifiedResult);
    });

    it('should not mutate original Color on composition', () => {
      const original = theme.red;
      const composed = original.on(theme.blue);

      const originalResult = original('test');
      const composedResult = composed('test');

      expect(originalResult).not.toBe(composedResult);
    });
  });

  describe('theme structure', () => {
    it('should have all standard ANSI colors', () => {
      expect(theme.black).toBeDefined();
      expect(theme.red).toBeDefined();
      expect(theme.green).toBeDefined();
      expect(theme.yellow).toBeDefined();
      expect(theme.blue).toBeDefined();
      expect(theme.magenta).toBeDefined();
      expect(theme.cyan).toBeDefined();
      expect(theme.white).toBeDefined();
    });

    it('should have all bright ANSI colors', () => {
      expect(theme.brightBlack).toBeDefined();
      expect(theme.brightRed).toBeDefined();
      expect(theme.brightGreen).toBeDefined();
      expect(theme.brightYellow).toBeDefined();
      expect(theme.brightBlue).toBeDefined();
      expect(theme.brightMagenta).toBeDefined();
      expect(theme.brightCyan).toBeDefined();
      expect(theme.brightWhite).toBeDefined();
    });

    it('should have semantic aliases', () => {
      expect(theme.error).toBeDefined();
      expect(theme.warning).toBeDefined();
      expect(theme.success).toBeDefined();
      expect(theme.info).toBeDefined();
      expect(theme.muted).toBeDefined();
    });

    it('should have special colors', () => {
      expect(theme.foreground).toBeDefined();
      expect(theme.background).toBeDefined();
    });

    it('should map semantic colors to correct ANSI indices', () => {
      expect(theme.error.ansi).toBe(1); // red
      expect(theme.warning.ansi).toBe(3); // yellow
      expect(theme.success.ansi).toBe(2); // green
      expect(theme.info.ansi).toBe(4); // blue
      expect(theme.muted.ansi).toBe(8); // brightBlack
    });

    it('should expose capabilities', () => {
      expect(theme.capabilities).toBeDefined();
      expect(theme.capabilities.color).toBe('ansi16');
      expect(theme.capabilities.isTTY).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const result = theme.red('');
      expect(result).toBeDefined();
    });

    it('should handle multiline text', () => {
      const result = theme.red('line1\nline2\nline3');
      expect(result).toContain('line1');
      expect(result).toContain('line2');
      expect(result).toContain('line3');
    });

    it('should handle special characters', () => {
      const result = theme.red('!@#$%^&*()');
      expect(result).toContain('!@#$%^&*()');
    });

    it('should handle unicode', () => {
      const result = theme.red('Hello 世界 🌍');
      expect(result).toContain('Hello 世界 🌍');
    });

    it('should handle zero-width transforms', () => {
      const result = theme.red.saturate(0).lighten(0).rotate(0)('test');
      expect(result).toContain('test');
    });
  });
});
