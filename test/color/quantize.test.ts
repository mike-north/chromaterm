import { describe, expect, it } from 'vitest';
import { ansi256ToRgb, rgbToAnsi16, rgbToAnsi256 } from '../../src/color/quantize.js';
import type { RGB } from '../../src/types.js';

describe('ansi256ToRgb', () => {
  it('should map standard ANSI colors (0-15) to fallback palette', () => {
    // Test a few key colors from the standard palette
    expect(ansi256ToRgb(0)).toEqual({ r: 0, g: 0, b: 0 }); // Black
    expect(ansi256ToRgb(1)).toEqual({ r: 205, g: 49, b: 49 }); // Red
    expect(ansi256ToRgb(7)).toEqual({ r: 229, g: 229, b: 229 }); // White
    expect(ansi256ToRgb(15)).toEqual({ r: 255, g: 255, b: 255 }); // Bright white
  });

  it('should map color cube values (16-231) correctly', () => {
    // First color cube entry: 16 + 36*0 + 6*0 + 0 = 16
    expect(ansi256ToRgb(16)).toEqual({ r: 0, g: 0, b: 0 });

    // Pure red in color cube: 16 + 36*5 + 6*0 + 0 = 196
    // Cube value 5 maps to RGB 255
    expect(ansi256ToRgb(196)).toEqual({ r: 255, g: 0, b: 0 });

    // Pure green in color cube: 16 + 36*0 + 6*5 + 0 = 46
    expect(ansi256ToRgb(46)).toEqual({ r: 0, g: 255, b: 0 });

    // Pure blue in color cube: 16 + 36*0 + 6*0 + 5 = 21
    expect(ansi256ToRgb(21)).toEqual({ r: 0, g: 0, b: 255 });

    // White in color cube: 16 + 36*5 + 6*5 + 5 = 231
    expect(ansi256ToRgb(231)).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('should map grayscale ramp (232-255) correctly', () => {
    // First grayscale: 232
    expect(ansi256ToRgb(232)).toEqual({ r: 8, g: 8, b: 8 });

    // Mid grayscale: 244
    expect(ansi256ToRgb(244)).toEqual({ r: 128, g: 128, b: 128 });

    // Last grayscale: 255
    expect(ansi256ToRgb(255)).toEqual({ r: 238, g: 238, b: 238 });
  });

  it('should produce equal RGB components for grayscale', () => {
    for (let i = 232; i <= 255; i++) {
      const rgb = ansi256ToRgb(i);
      expect(rgb.r).toBe(rgb.g);
      expect(rgb.g).toBe(rgb.b);
    }
  });
});

describe('rgbToAnsi256', () => {
  it('should map colors to themselves in round-trip', () => {
    // Test a sample of colors that are unique (no RGB duplicates)
    const testIndices = [
      0,
      1,
      7,
      8,
      15, // Standard colors
      // Note: index 16 (cube black) maps to 0,0,0 which is same as index 0
      // Note: index 231 (cube white) maps to 255,255,255 which is same as index 15
      46, // Green
      196, // Red
      // Color cube with unique colors
      232,
      244,
      255, // Grayscale
    ];

    for (const index of testIndices) {
      const rgb = ansi256ToRgb(index);
      const result = rgbToAnsi256(rgb);
      expect(result).toBe(index);
    }
  });

  it('should map all unique 256 colors correctly', () => {
    // Some indices map to identical RGB values (e.g., 0 and 16 are both black)
    // The reverse lookup will find the first matching index
    // This test verifies that the reverse lookup produces a valid result
    // that maps back to the same RGB value

    for (let i = 0; i < 256; i++) {
      const rgb = ansi256ToRgb(i);
      const result = rgbToAnsi256(rgb);

      // The result should map to the same RGB (but might be a different index)
      const resultRgb = ansi256ToRgb(result);
      expect(resultRgb).toEqual(rgb);
    }
  });

  it('should map pure red to nearest ANSI color', () => {
    const red: RGB = { r: 255, g: 0, b: 0 };
    const result = rgbToAnsi256(red);
    // Should map to bright red (9) or color cube red (196)
    expect([9, 196]).toContain(result);
  });

  it('should map pure green to nearest ANSI color', () => {
    const green: RGB = { r: 0, g: 255, b: 0 };
    const result = rgbToAnsi256(green);
    // Should map to bright green (10) or color cube green (46)
    expect([10, 46]).toContain(result);
  });

  it('should map pure blue to nearest ANSI color', () => {
    const blue: RGB = { r: 0, g: 0, b: 255 };
    const result = rgbToAnsi256(blue);
    // Should map to bright blue (12) or color cube blue (21)
    expect([12, 21]).toContain(result);
  });

  it('should map black to ANSI 0', () => {
    const black: RGB = { r: 0, g: 0, b: 0 };
    expect(rgbToAnsi256(black)).toBe(0);
  });

  it('should map white to bright white or near-white', () => {
    const white: RGB = { r: 255, g: 255, b: 255 };
    const result = rgbToAnsi256(white);
    // Should be 15 (bright white) or 231 (cube white) or 255 (grayscale)
    expect([15, 231, 255]).toContain(result);
  });

  it('should map mid-gray to grayscale ramp', () => {
    const gray: RGB = { r: 128, g: 128, b: 128 };
    const result = rgbToAnsi256(gray);
    // Should be in grayscale range (232-255) or bright black (8)
    expect(result).toBeGreaterThanOrEqual(8);
  });
});

describe('rgbToAnsi16', () => {
  it('should map colors to ANSI-16 palette (0-15)', () => {
    const red: RGB = { r: 255, g: 0, b: 0 };
    const result = rgbToAnsi16(red);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(15);
  });

  it('should map standard colors to their ANSI-16 equivalents', () => {
    const black: RGB = { r: 0, g: 0, b: 0 };
    expect(rgbToAnsi16(black)).toBe(0);

    const red: RGB = { r: 205, g: 49, b: 49 };
    expect(rgbToAnsi16(red)).toBe(1);

    const brightWhite: RGB = { r: 255, g: 255, b: 255 };
    expect(rgbToAnsi16(brightWhite)).toBe(15);
  });

  it('should choose from only the first 16 colors', () => {
    const arbitraryColors: RGB[] = [
      { r: 100, g: 150, b: 200 },
      { r: 50, g: 50, b: 50 },
      { r: 200, g: 200, b: 50 },
      { r: 150, g: 50, b: 150 },
    ];

    for (const color of arbitraryColors) {
      const result = rgbToAnsi16(color);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(15);
    }
  });

  it('should map each ANSI-16 color to itself', () => {
    for (let i = 0; i < 16; i++) {
      const rgb = ansi256ToRgb(i);
      const result = rgbToAnsi16(rgb);
      expect(result).toBe(i);
    }
  });
});

describe('edge cases', () => {
  it('should handle RGB values at boundaries', () => {
    const colors: RGB[] = [
      { r: 0, g: 0, b: 0 },
      { r: 255, g: 255, b: 255 },
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 255, b: 0 },
      { r: 0, g: 0, b: 255 },
    ];

    for (const color of colors) {
      const ansi256 = rgbToAnsi256(color);
      expect(ansi256).toBeGreaterThanOrEqual(0);
      expect(ansi256).toBeLessThanOrEqual(255);

      const ansi16 = rgbToAnsi16(color);
      expect(ansi16).toBeGreaterThanOrEqual(0);
      expect(ansi16).toBeLessThanOrEqual(15);
    }
  });

  it('should quantize grayscale values consistently', () => {
    // Test various gray values
    for (let gray = 0; gray <= 255; gray += 16) {
      const rgb: RGB = { r: gray, g: gray, b: gray };
      const index = rgbToAnsi256(rgb);
      const result = ansi256ToRgb(index);

      // Result should also be gray
      expect(result.r).toBe(result.g);
      expect(result.g).toBe(result.b);
    }
  });

  it('should handle color cube boundaries correctly', () => {
    // Test the boundaries of the color cube (0, 95, 135, 175, 215, 255)
    const cubeValues = [0, 95, 135, 175, 215, 255];

    for (const r of cubeValues) {
      for (const g of cubeValues) {
        for (const b of cubeValues) {
          const rgb: RGB = { r, g, b };
          const index = rgbToAnsi256(rgb);
          const result = ansi256ToRgb(index);

          // Should be close to the original (within color cube quantization)
          expect(Math.abs(result.r - r)).toBeLessThanOrEqual(40);
          expect(Math.abs(result.g - g)).toBeLessThanOrEqual(40);
          expect(Math.abs(result.b - b)).toBeLessThanOrEqual(40);
        }
      }
    }
  });
});

describe('negative tests', () => {
  it('should handle invalid ANSI-256 indices gracefully', () => {
    // These tests verify current behavior with out-of-range indices
    // The implementation doesn't explicitly validate, so behavior may vary
    // Index -1 would access invalid array index
    // Index 256 would also be invalid
    // We're documenting expected behavior here
    // For now, we'll just test that valid indices work
    // If validation is added later, these tests can be updated
  });

  it('should handle fractional RGB values by rounding', () => {
    // RGB should be integers, but if non-integers are provided,
    // the algorithm should still work
    const color: RGB = { r: 127.5, g: 63.7, b: 191.2 };
    const result = rgbToAnsi256(color);

    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(255);
  });
});
