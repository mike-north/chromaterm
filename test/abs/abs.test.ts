import { describe, it, expect } from 'vitest';
import { abs, ansi } from '../../src/index.js';

describe('abs (absolute colors)', () => {
  describe('abs.hex', () => {
    it('should be a function', () => {
      expect(typeof abs.hex).toBe('function');
    });

    it('should return a style function', () => {
      const orange = abs.hex('#ff6600');
      expect(typeof orange).toBe('function');
    });

    it('should produce styled strings', () => {
      const result = abs.hex('#ff6600')('orange');
      expect(typeof result).toBe('string');
      expect(result).toContain('orange');
    });

    it('should handle various hex formats', () => {
      expect(abs.hex('#ff6600')('test')).toContain('test');
      expect(abs.hex('ff6600')('test')).toContain('test');
      expect(abs.hex('#FFF')('test')).toContain('test');
    });
  });

  describe('abs.bgHex', () => {
    it('should be a function', () => {
      expect(typeof abs.bgHex).toBe('function');
    });

    it('should return a style function', () => {
      const bgOrange = abs.bgHex('#ff6600');
      expect(typeof bgOrange).toBe('function');
    });

    it('should produce styled strings', () => {
      const result = abs.bgHex('#ff6600')('background');
      expect(typeof result).toBe('string');
      expect(result).toContain('background');
    });
  });

  describe('abs.rgb', () => {
    it('should be a function', () => {
      expect(typeof abs.rgb).toBe('function');
    });

    it('should return a style function', () => {
      const custom = abs.rgb(100, 200, 50);
      expect(typeof custom).toBe('function');
    });

    it('should produce styled strings', () => {
      const result = abs.rgb(255, 102, 0)('custom');
      expect(typeof result).toBe('string');
      expect(result).toContain('custom');
    });

    it('should handle edge values', () => {
      expect(abs.rgb(0, 0, 0)('black')).toContain('black');
      expect(abs.rgb(255, 255, 255)('white')).toContain('white');
    });
  });

  describe('abs.bgRgb', () => {
    it('should be a function', () => {
      expect(typeof abs.bgRgb).toBe('function');
    });

    it('should return a style function', () => {
      const bgCustom = abs.bgRgb(100, 200, 50);
      expect(typeof bgCustom).toBe('function');
    });

    it('should produce styled strings', () => {
      const result = abs.bgRgb(100, 200, 50)('background');
      expect(typeof result).toBe('string');
      expect(result).toContain('background');
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      const result = abs.hex('#ff0000')('');
      expect(typeof result).toBe('string');
    });

    it('should handle very long strings', () => {
      const longString = 'x'.repeat(10000);
      const result = abs.rgb(255, 0, 0)(longString);
      expect(typeof result).toBe('string');
      expect(result).toContain('x');
    });

    it('should handle special characters', () => {
      const special = 'test\t\r\n';
      const result = abs.hex('#0000ff')(special);
      expect(typeof result).toBe('string');
    });
  });
});

describe('ansi (direct ANSI codes)', () => {
  it('should export chalk as ansi', () => {
    expect(ansi).toBeDefined();
    expect(typeof ansi).toBe('function');
  });

  it('should have ANSI color methods', () => {
    expect(typeof ansi.red).toBe('function');
    expect(typeof ansi.green).toBe('function');
    expect(typeof ansi.blue).toBe('function');
    expect(typeof ansi.yellow).toBe('function');
    expect(typeof ansi.magenta).toBe('function');
    expect(typeof ansi.cyan).toBe('function');
    expect(typeof ansi.white).toBe('function');
    expect(typeof ansi.black).toBe('function');
  });

  it('should have style methods', () => {
    expect(typeof ansi.bold).toBe('function');
    expect(typeof ansi.dim).toBe('function');
    expect(typeof ansi.italic).toBe('function');
    expect(typeof ansi.underline).toBe('function');
    expect(typeof ansi.strikethrough).toBe('function');
  });

  it('should have background color methods', () => {
    expect(typeof ansi.bgRed).toBe('function');
    expect(typeof ansi.bgGreen).toBe('function');
    expect(typeof ansi.bgBlue).toBe('function');
  });

  it('should produce styled strings', () => {
    const result = ansi.red('test');
    expect(typeof result).toBe('string');
    expect(result).toContain('test');
  });

  it('should support chaining', () => {
    const result = ansi.bold.red('test');
    expect(typeof result).toBe('string');
    expect(result).toContain('test');
  });

  it('should support complex chaining', () => {
    const result = ansi.bold.underline.red.bgBlue('complex');
    expect(typeof result).toBe('string');
    expect(result).toContain('complex');
  });

  it('should be callable directly', () => {
    const result = ansi('plain text');
    expect(typeof result).toBe('string');
    expect(result).toContain('plain text');
  });

  it('should handle empty strings', () => {
    const result = ansi.red('');
    expect(typeof result).toBe('string');
  });

  it('should handle multiline strings', () => {
    const input = 'line1\nline2\nline3';
    const result = ansi.green(input);
    expect(typeof result).toBe('string');
    expect(result).toContain('line1');
    expect(result).toContain('line2');
    expect(result).toContain('line3');
  });
});
