import { describe, it, expect } from 'vitest';
import { rgbToOklch, oklchToRgb } from '../../src/color/oklch.js';
import type { RGB } from '../../src/types.js';

/**
 * Helper to check if two RGB colors are approximately equal.
 * Allows for small rounding differences from color space conversions.
 */
function expectRgbClose(actual: RGB, expected: RGB, tolerance = 2): void {
  expect(Math.abs(actual.r - expected.r)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(actual.g - expected.g)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(actual.b - expected.b)).toBeLessThanOrEqual(tolerance);
}

describe('rgbToOklch', () => {
  describe('achromatic colors', () => {
    it('should convert pure black', () => {
      const result = rgbToOklch({ r: 0, g: 0, b: 0 });
      expect(result.l).toBeCloseTo(0, 2);
      expect(result.c).toBeCloseTo(0, 4);
      expect(result.h).toBeUndefined();
    });

    it('should convert pure white', () => {
      const result = rgbToOklch({ r: 255, g: 255, b: 255 });
      expect(result.l).toBeCloseTo(1, 2);
      expect(result.c).toBeCloseTo(0, 4);
      expect(result.h).toBeUndefined();
    });

    it('should convert grayscale values', () => {
      const gray128 = rgbToOklch({ r: 128, g: 128, b: 128 });
      expect(gray128.l).toBeGreaterThan(0);
      expect(gray128.l).toBeLessThan(1);
      expect(gray128.c).toBeCloseTo(0, 4);
      expect(gray128.h).toBeUndefined();

      const gray192 = rgbToOklch({ r: 192, g: 192, b: 192 });
      expect(gray192.l).toBeGreaterThan(gray128.l);
      expect(gray192.c).toBeCloseTo(0, 4);
      expect(gray192.h).toBeUndefined();
    });
  });

  describe('chromatic colors', () => {
    it('should convert pure red', () => {
      const result = rgbToOklch({ r: 255, g: 0, b: 0 });
      expect(result.l).toBeGreaterThan(0);
      expect(result.l).toBeLessThan(1);
      expect(result.c).toBeGreaterThan(0);
      expect(result.h).toBeDefined();
      expect(result.h).toBeGreaterThan(0);
      expect(result.h).toBeLessThan(90);
    });

    it('should convert pure green', () => {
      const result = rgbToOklch({ r: 0, g: 255, b: 0 });
      expect(result.l).toBeGreaterThan(0);
      expect(result.l).toBeLessThan(1);
      expect(result.c).toBeGreaterThan(0);
      expect(result.h).toBeDefined();
      expect(result.h).toBeGreaterThan(90);
      expect(result.h).toBeLessThan(180);
    });

    it('should convert pure blue', () => {
      const result = rgbToOklch({ r: 0, g: 0, b: 255 });
      expect(result.l).toBeGreaterThan(0);
      expect(result.l).toBeLessThan(1);
      expect(result.c).toBeGreaterThan(0);
      expect(result.h).toBeDefined();
      expect(result.h).toBeGreaterThan(180);
      expect(result.h).toBeLessThan(360);
    });

    it('should convert cyan', () => {
      const result = rgbToOklch({ r: 0, g: 255, b: 255 });
      expect(result.l).toBeGreaterThan(0);
      expect(result.l).toBeLessThan(1);
      expect(result.c).toBeGreaterThan(0);
      expect(result.h).toBeDefined();
    });

    it('should convert magenta', () => {
      const result = rgbToOklch({ r: 255, g: 0, b: 255 });
      expect(result.l).toBeGreaterThan(0);
      expect(result.l).toBeLessThan(1);
      expect(result.c).toBeGreaterThan(0);
      expect(result.h).toBeDefined();
    });

    it('should convert yellow', () => {
      const result = rgbToOklch({ r: 255, g: 255, b: 0 });
      expect(result.l).toBeGreaterThan(0);
      expect(result.l).toBeLessThan(1);
      expect(result.c).toBeGreaterThan(0);
      expect(result.h).toBeDefined();
    });
  });

  describe('hue normalization', () => {
    it('should return hue in 0-360 range', () => {
      const colors: RGB[] = [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 255, b: 0 },
        { r: 0, g: 0, b: 255 },
        { r: 128, g: 64, b: 200 },
      ];

      for (const color of colors) {
        const result = rgbToOklch(color);
        if (result.h !== undefined) {
          expect(result.h).toBeGreaterThanOrEqual(0);
          expect(result.h).toBeLessThan(360);
        }
      }
    });
  });

  describe('edge cases', () => {
    it('should handle very dark colors', () => {
      const result = rgbToOklch({ r: 1, g: 1, b: 1 });
      expect(result.l).toBeGreaterThan(0);
      expect(result.l).toBeLessThan(0.1);
    });

    it('should handle very light colors', () => {
      const result = rgbToOklch({ r: 254, g: 254, b: 254 });
      expect(result.l).toBeGreaterThan(0.9);
      expect(result.l).toBeLessThan(1);
    });

    it('should handle low saturation colors as achromatic', () => {
      const result = rgbToOklch({ r: 128, g: 129, b: 128 });
      // Very low chroma should result in undefined hue
      if (result.c < 0.0001) {
        expect(result.h).toBeUndefined();
      }
    });
  });
});

describe('oklchToRgb', () => {
  describe('achromatic colors', () => {
    it('should convert achromatic OKLCH to grayscale RGB', () => {
      const black = oklchToRgb({ l: 0, c: 0, h: undefined });
      expectRgbClose(black, { r: 0, g: 0, b: 0 });

      const white = oklchToRgb({ l: 1, c: 0, h: undefined });
      expectRgbClose(white, { r: 255, g: 255, b: 255 });
    });

    it('should convert mid-gray', () => {
      const gray = oklchToRgb({ l: 0.5, c: 0, h: undefined });
      expect(gray.r).toBeGreaterThan(90);
      expect(gray.r).toBeLessThan(150);
      expect(Math.abs(gray.r - gray.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(gray.g - gray.b)).toBeLessThanOrEqual(1);
    });

    it('should treat very low chroma as achromatic', () => {
      const result = oklchToRgb({ l: 0.5, c: 0.0001, h: 180 });
      expect(Math.abs(result.r - result.g)).toBeLessThanOrEqual(2);
      expect(Math.abs(result.g - result.b)).toBeLessThanOrEqual(2);
    });
  });

  describe('chromatic colors', () => {
    it('should convert colorful OKLCH values', () => {
      const color = oklchToRgb({ l: 0.6, c: 0.15, h: 120 });
      expect(color.r).toBeGreaterThanOrEqual(0);
      expect(color.r).toBeLessThanOrEqual(255);
      expect(color.g).toBeGreaterThanOrEqual(0);
      expect(color.g).toBeLessThanOrEqual(255);
      expect(color.b).toBeGreaterThanOrEqual(0);
      expect(color.b).toBeLessThanOrEqual(255);
    });

    it('should handle different hue values', () => {
      const hues = [0, 60, 120, 180, 240, 300];
      for (const h of hues) {
        const result = oklchToRgb({ l: 0.5, c: 0.1, h });
        expect(result.r).toBeGreaterThanOrEqual(0);
        expect(result.r).toBeLessThanOrEqual(255);
        expect(result.g).toBeGreaterThanOrEqual(0);
        expect(result.g).toBeLessThanOrEqual(255);
        expect(result.b).toBeGreaterThanOrEqual(0);
        expect(result.b).toBeLessThanOrEqual(255);
      }
    });
  });

  describe('RGB value clamping', () => {
    it('should clamp RGB values to 0-255 range', () => {
      // Use extreme OKLCH values that might produce out-of-gamut RGB
      const result = oklchToRgb({ l: 0.8, c: 0.4, h: 60 });
      expect(result.r).toBeGreaterThanOrEqual(0);
      expect(result.r).toBeLessThanOrEqual(255);
      expect(result.g).toBeGreaterThanOrEqual(0);
      expect(result.g).toBeLessThanOrEqual(255);
      expect(result.b).toBeGreaterThanOrEqual(0);
      expect(result.b).toBeLessThanOrEqual(255);
    });
  });
});

describe('round-trip conversions', () => {
  it('should preserve achromatic colors', () => {
    const colors: RGB[] = [
      { r: 0, g: 0, b: 0 },
      { r: 128, g: 128, b: 128 },
      { r: 192, g: 192, b: 192 },
      { r: 255, g: 255, b: 255 },
    ];

    for (const color of colors) {
      const oklch = rgbToOklch(color);
      const rgb = oklchToRgb(oklch);
      expectRgbClose(rgb, color);
    }
  });

  it('should preserve chromatic colors', () => {
    const colors: RGB[] = [
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 255, b: 0 },
      { r: 0, g: 0, b: 255 },
      { r: 255, g: 255, b: 0 },
      { r: 255, g: 0, b: 255 },
      { r: 0, g: 255, b: 255 },
      { r: 128, g: 64, b: 200 },
    ];

    for (const color of colors) {
      const oklch = rgbToOklch(color);
      const rgb = oklchToRgb(oklch);
      expectRgbClose(rgb, color, 3);
    }
  });

  it('should handle a wide range of colors', () => {
    // Generate a variety of colors
    const testColors: RGB[] = [];
    for (let r = 0; r <= 255; r += 85) {
      for (let g = 0; g <= 255; g += 85) {
        for (let b = 0; b <= 255; b += 85) {
          testColors.push({ r, g, b });
        }
      }
    }

    for (const color of testColors) {
      const oklch = rgbToOklch(color);
      const rgb = oklchToRgb(oklch);
      expectRgbClose(rgb, color, 3);
    }
  });
});
