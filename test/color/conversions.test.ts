import { describe, expect, it } from 'vitest';
import { hslToRgb, rgbToHsl } from '../../src/color/conversions.js';
import type { HSL, RGB } from '../../src/types.js';

describe('rgbToHsl', () => {
  it('should convert pure red', () => {
    const result = rgbToHsl({ r: 255, g: 0, b: 0 });
    expect(result.h).toBeCloseTo(0, 1);
    expect(result.s).toBeCloseTo(1, 2);
    expect(result.l).toBeCloseTo(0.5, 2);
  });

  it('should convert pure green', () => {
    const result = rgbToHsl({ r: 0, g: 255, b: 0 });
    expect(result.h).toBeCloseTo(120, 1);
    expect(result.s).toBeCloseTo(1, 2);
    expect(result.l).toBeCloseTo(0.5, 2);
  });

  it('should convert pure blue', () => {
    const result = rgbToHsl({ r: 0, g: 0, b: 255 });
    expect(result.h).toBeCloseTo(240, 1);
    expect(result.s).toBeCloseTo(1, 2);
    expect(result.l).toBeCloseTo(0.5, 2);
  });

  it('should convert white', () => {
    const result = rgbToHsl({ r: 255, g: 255, b: 255 });
    expect(result.h).toBe(0); // Hue is 0 for achromatic colors
    expect(result.s).toBe(0);
    expect(result.l).toBeCloseTo(1, 2);
  });

  it('should convert black', () => {
    const result = rgbToHsl({ r: 0, g: 0, b: 0 });
    expect(result.h).toBe(0); // Hue is 0 for achromatic colors
    expect(result.s).toBe(0);
    expect(result.l).toBe(0);
  });

  it('should convert mid gray', () => {
    const result = rgbToHsl({ r: 128, g: 128, b: 128 });
    expect(result.h).toBe(0); // Hue is 0 for achromatic colors
    expect(result.s).toBeCloseTo(0, 2);
    expect(result.l).toBeCloseTo(0.502, 2); // 128/255 ≈ 0.502
  });

  it('should convert a typical color', () => {
    // A nice blue-ish color
    const result = rgbToHsl({ r: 100, g: 150, b: 200 });
    expect(result.h).toBeCloseTo(210, 0); // Blue-ish hue
    expect(result.s).toBeGreaterThan(0.4);
    expect(result.l).toBeCloseTo(0.588, 2);
  });
});

describe('hslToRgb', () => {
  it('should convert pure red HSL', () => {
    const result = hslToRgb({ h: 0, s: 1, l: 0.5 });
    expect(result.r).toBe(255);
    expect(result.g).toBe(0);
    expect(result.b).toBe(0);
  });

  it('should convert pure green HSL', () => {
    const result = hslToRgb({ h: 120, s: 1, l: 0.5 });
    expect(result.r).toBe(0);
    expect(result.g).toBe(255);
    expect(result.b).toBe(0);
  });

  it('should convert pure blue HSL', () => {
    const result = hslToRgb({ h: 240, s: 1, l: 0.5 });
    expect(result.r).toBe(0);
    expect(result.g).toBe(0);
    expect(result.b).toBe(255);
  });

  it('should convert white HSL', () => {
    const result = hslToRgb({ h: 0, s: 0, l: 1 });
    expect(result.r).toBe(255);
    expect(result.g).toBe(255);
    expect(result.b).toBe(255);
  });

  it('should convert black HSL', () => {
    const result = hslToRgb({ h: 0, s: 0, l: 0 });
    expect(result.r).toBe(0);
    expect(result.g).toBe(0);
    expect(result.b).toBe(0);
  });

  it('should convert mid gray HSL', () => {
    const result = hslToRgb({ h: 0, s: 0, l: 0.5 });
    expect(result.r).toBe(128);
    expect(result.g).toBe(128);
    expect(result.b).toBe(128);
  });
});

describe('RGB ↔ HSL round-trip conversions', () => {
  /**
   * Helper to check if two RGB colors are approximately equal.
   * Allows ±1 difference per channel due to rounding.
   */
  function expectRgbClose(actual: RGB, expected: RGB): void {
    expect(actual.r).toBeGreaterThanOrEqual(expected.r - 1);
    expect(actual.r).toBeLessThanOrEqual(expected.r + 1);
    expect(actual.g).toBeGreaterThanOrEqual(expected.g - 1);
    expect(actual.g).toBeLessThanOrEqual(expected.g + 1);
    expect(actual.b).toBeGreaterThanOrEqual(expected.b - 1);
    expect(actual.b).toBeLessThanOrEqual(expected.b + 1);
  }

  it('should round-trip pure colors', () => {
    const colors: RGB[] = [
      { r: 255, g: 0, b: 0 }, // Red
      { r: 0, g: 255, b: 0 }, // Green
      { r: 0, g: 0, b: 255 }, // Blue
      { r: 255, g: 255, b: 0 }, // Yellow
      { r: 255, g: 0, b: 255 }, // Magenta
      { r: 0, g: 255, b: 255 }, // Cyan
    ];

    for (const original of colors) {
      const hsl = rgbToHsl(original);
      const result = hslToRgb(hsl);
      expectRgbClose(result, original);
    }
  });

  it('should round-trip grays', () => {
    const grays: RGB[] = [
      { r: 0, g: 0, b: 0 }, // Black
      { r: 64, g: 64, b: 64 },
      { r: 128, g: 128, b: 128 }, // Mid gray
      { r: 192, g: 192, b: 192 },
      { r: 255, g: 255, b: 255 }, // White
    ];

    for (const original of grays) {
      const hsl = rgbToHsl(original);
      const result = hslToRgb(hsl);
      expectRgbClose(result, original);
    }
  });

  it('should round-trip arbitrary colors', () => {
    const colors: RGB[] = [
      { r: 100, g: 150, b: 200 },
      { r: 205, g: 49, b: 49 },
      { r: 13, g: 188, b: 121 },
      { r: 229, g: 229, b: 16 },
      { r: 188, g: 63, b: 188 },
    ];

    for (const original of colors) {
      const hsl = rgbToHsl(original);
      const result = hslToRgb(hsl);
      expectRgbClose(result, original);
    }
  });
});

describe('HSL ↔ RGB round-trip conversions', () => {
  /**
   * Helper to check if two HSL colors are approximately equal.
   * Hue can vary more due to wrapping; s and l should be very close.
   */
  function expectHslClose(actual: HSL, expected: HSL): void {
    // For achromatic colors (s=0), hue doesn't matter
    if (expected.s < 0.01) {
      expect(actual.s).toBeCloseTo(0, 2);
    } else {
      // Allow larger hue variation due to rounding
      const hueDiff = Math.abs(actual.h - expected.h);
      const normalizedDiff = Math.min(hueDiff, 360 - hueDiff);
      expect(normalizedDiff).toBeLessThan(2);
      expect(actual.s).toBeCloseTo(expected.s, 2);
    }
    expect(actual.l).toBeCloseTo(expected.l, 2);
  }

  it('should round-trip various HSL values', () => {
    const colors: HSL[] = [
      { h: 0, s: 1, l: 0.5 }, // Red
      { h: 120, s: 1, l: 0.5 }, // Green
      { h: 240, s: 1, l: 0.5 }, // Blue
      { h: 60, s: 1, l: 0.5 }, // Yellow
      { h: 300, s: 1, l: 0.5 }, // Magenta
      { h: 180, s: 1, l: 0.5 }, // Cyan
      { h: 0, s: 0, l: 0 }, // Black
      { h: 0, s: 0, l: 0.5 }, // Gray
      { h: 0, s: 0, l: 1 }, // White
      { h: 200, s: 0.6, l: 0.4 }, // Arbitrary
    ];

    for (const original of colors) {
      const rgb = hslToRgb(original);
      const result = rgbToHsl(rgb);
      expectHslClose(result, original);
    }
  });
});

describe('edge cases', () => {
  it('should handle RGB with all same values', () => {
    const result = rgbToHsl({ r: 100, g: 100, b: 100 });
    expect(result.s).toBe(0);
    expect(result.l).toBeCloseTo(100 / 255, 2);
  });

  it('should handle HSL with saturation 0', () => {
    const result = hslToRgb({ h: 180, s: 0, l: 0.7 });
    const expectedValue = Math.round(0.7 * 255);
    expect(result.r).toBe(expectedValue);
    expect(result.g).toBe(expectedValue);
    expect(result.b).toBe(expectedValue);
  });

  it('should handle HSL with hue wrap-around (>360)', () => {
    const h360 = hslToRgb({ h: 360, s: 1, l: 0.5 });
    const h0 = hslToRgb({ h: 0, s: 1, l: 0.5 });
    expect(h360).toEqual(h0);
  });
});
