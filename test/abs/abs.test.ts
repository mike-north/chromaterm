import { describe, it, expect } from 'vitest';
import { abs } from '../../src/index.js';

describe('abs (chalk re-export)', () => {
  it('should export chalk as abs', () => {
    expect(abs).toBeDefined();
    expect(typeof abs).toBe('function');
  });

  it('should have chalk color methods', () => {
    expect(typeof abs.red).toBe('function');
    expect(typeof abs.green).toBe('function');
    expect(typeof abs.blue).toBe('function');
    expect(typeof abs.yellow).toBe('function');
    expect(typeof abs.magenta).toBe('function');
    expect(typeof abs.cyan).toBe('function');
    expect(typeof abs.white).toBe('function');
    expect(typeof abs.black).toBe('function');
  });

  it('should have chalk style methods', () => {
    expect(typeof abs.bold).toBe('function');
    expect(typeof abs.dim).toBe('function');
    expect(typeof abs.italic).toBe('function');
    expect(typeof abs.underline).toBe('function');
    expect(typeof abs.strikethrough).toBe('function');
  });

  it('should have chalk hex method', () => {
    expect(typeof abs.hex).toBe('function');
  });

  it('should have chalk rgb method', () => {
    expect(typeof abs.rgb).toBe('function');
  });

  it('should have chalk background color methods', () => {
    expect(typeof abs.bgRed).toBe('function');
    expect(typeof abs.bgGreen).toBe('function');
    expect(typeof abs.bgBlue).toBe('function');
    expect(typeof abs.bgHex).toBe('function');
    expect(typeof abs.bgRgb).toBe('function');
  });

  it('should produce styled strings', () => {
    const result = abs.red('test');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    // The result should either be styled (with ANSI codes) or plain text (if color is disabled)
    // Either way, it should contain the input text
    expect(result).toContain('test');
  });

  it('should support chaining', () => {
    const result = abs.bold.red('test');
    expect(typeof result).toBe('string');
    expect(result).toContain('test');
  });

  it('should support hex colors', () => {
    const orange = abs.hex('#ff6600');
    expect(typeof orange).toBe('function');
    const result = orange('orange');
    expect(typeof result).toBe('string');
    expect(result).toContain('orange');
  });

  it('should support rgb colors', () => {
    const custom = abs.rgb(100, 200, 50);
    expect(typeof custom).toBe('function');
    const result = custom('custom');
    expect(typeof result).toBe('string');
    expect(result).toContain('custom');
  });

  it('should support background hex colors', () => {
    const bgOrange = abs.bgHex('#ff6600');
    expect(typeof bgOrange).toBe('function');
    const result = bgOrange('background');
    expect(typeof result).toBe('string');
    expect(result).toContain('background');
  });

  it('should support background rgb colors', () => {
    const bgCustom = abs.bgRgb(100, 200, 50);
    expect(typeof bgCustom).toBe('function');
    const result = bgCustom('background');
    expect(typeof result).toBe('string');
    expect(result).toContain('background');
  });

  it('should support complex chaining', () => {
    const result = abs.bold.underline.red.bgBlue('complex');
    expect(typeof result).toBe('string');
    expect(result).toContain('complex');
  });

  it('should support multiple color calls', () => {
    const red = abs.red('red');
    const blue = abs.blue('blue');
    expect(red).toContain('red');
    expect(blue).toContain('blue');
  });

  it('should handle empty strings', () => {
    const result = abs.red('');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle multiline strings', () => {
    const input = 'line1\nline2\nline3';
    const result = abs.green(input);
    expect(typeof result).toBe('string');
    expect(result).toContain('line1');
    expect(result).toContain('line2');
    expect(result).toContain('line3');
  });

  it('should be callable directly', () => {
    const result = abs('plain text');
    expect(typeof result).toBe('string');
    expect(result).toContain('plain text');
  });

  // Negative test: invalid hex should not throw (chalk handles gracefully)
  it('should handle invalid hex gracefully', () => {
    expect(() => {
      const invalid = abs.hex('not-a-hex');
      invalid('test');
    }).not.toThrow();
  });

  // Edge case: very long strings
  it('should handle very long strings', () => {
    const longString = 'x'.repeat(10000);
    const result = abs.red(longString);
    expect(typeof result).toBe('string');
    expect(result).toContain('x');
  });

  // Edge case: special characters
  it('should handle special characters', () => {
    const special = 'test\t\r\n\u001b[0m';
    const result = abs.blue(special);
    expect(typeof result).toBe('string');
  });
});
