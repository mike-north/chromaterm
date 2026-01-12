import { describe, expect, it } from 'vitest';
import { rgbToHsl } from '../../src/color/conversions.js';
import { darken, desaturate, lighten, rotate, saturate } from '../../src/color/transforms.js';
import type { RGB } from '../../src/types.js';

describe('saturate', () => {
  it('should increase saturation', () => {
    const original: RGB = { r: 200, g: 100, b: 150 };
    const result = saturate(original, 0.3);

    const originalHsl = rgbToHsl(original);
    const resultHsl = rgbToHsl(result);

    expect(resultHsl.s).toBeGreaterThan(originalHsl.s);
    expect(resultHsl.h).toBeCloseTo(originalHsl.h, 0);
    expect(resultHsl.l).toBeCloseTo(originalHsl.l, 1);
  });

  it('should handle already saturated color', () => {
    const original: RGB = { r: 255, g: 0, b: 0 }; // Pure red (s=1)
    const result = saturate(original, 0.5);

    const resultHsl = rgbToHsl(result);
    expect(resultHsl.s).toBe(1); // Should clamp at 1
  });

  it('should handle negative amounts (desaturation)', () => {
    const original: RGB = { r: 200, g: 100, b: 150 };
    const result = saturate(original, -0.3);

    const originalHsl = rgbToHsl(original);
    const resultHsl = rgbToHsl(result);

    expect(resultHsl.s).toBeLessThan(originalHsl.s);
  });

  it('should clamp saturation to valid range', () => {
    const original: RGB = { r: 200, g: 100, b: 150 };

    // Try to over-saturate
    const overSaturated = saturate(original, 2.0);
    const overSaturatedHsl = rgbToHsl(overSaturated);
    expect(overSaturatedHsl.s).toBeLessThanOrEqual(1);

    // Try to under-saturate
    const underSaturated = saturate(original, -2.0);
    const underSaturatedHsl = rgbToHsl(underSaturated);
    expect(underSaturatedHsl.s).toBeGreaterThanOrEqual(0);
  });

  it('should produce gray when fully desaturated', () => {
    const original: RGB = { r: 200, g: 100, b: 150 };
    const result = saturate(original, -1.0);

    const resultHsl = rgbToHsl(result);
    expect(resultHsl.s).toBeCloseTo(0, 2);
  });
});

describe('desaturate', () => {
  it('should decrease saturation', () => {
    const original: RGB = { r: 200, g: 100, b: 150 };
    const result = desaturate(original, 0.3);

    const originalHsl = rgbToHsl(original);
    const resultHsl = rgbToHsl(result);

    expect(resultHsl.s).toBeLessThan(originalHsl.s);
  });

  it('should be equivalent to saturate with negative amount', () => {
    const original: RGB = { r: 200, g: 100, b: 150 };
    const desaturated = desaturate(original, 0.3);
    const negativeSaturated = saturate(original, -0.3);

    expect(desaturated).toEqual(negativeSaturated);
  });

  it('should handle already desaturated (gray) color', () => {
    const original: RGB = { r: 128, g: 128, b: 128 }; // Gray (s=0)
    const result = desaturate(original, 0.5);

    const resultHsl = rgbToHsl(result);
    expect(resultHsl.s).toBe(0); // Should stay at 0
  });
});

describe('lighten', () => {
  it('should increase lightness', () => {
    const original: RGB = { r: 100, g: 50, b: 75 };
    const result = lighten(original, 0.2);

    const originalHsl = rgbToHsl(original);
    const resultHsl = rgbToHsl(result);

    expect(resultHsl.l).toBeGreaterThan(originalHsl.l);
    expect(resultHsl.h).toBeCloseTo(originalHsl.h, 0);
    expect(resultHsl.s).toBeCloseTo(originalHsl.s, 1);
  });

  it('should handle already light color (white)', () => {
    const original: RGB = { r: 255, g: 255, b: 255 }; // White (l=1)
    const result = lighten(original, 0.5);

    const resultHsl = rgbToHsl(result);
    expect(resultHsl.l).toBeCloseTo(1, 2); // Should clamp at 1
  });

  it('should handle negative amounts (darkening)', () => {
    const original: RGB = { r: 200, g: 100, b: 150 };
    const result = lighten(original, -0.2);

    const originalHsl = rgbToHsl(original);
    const resultHsl = rgbToHsl(result);

    expect(resultHsl.l).toBeLessThan(originalHsl.l);
  });

  it('should clamp lightness to valid range', () => {
    const original: RGB = { r: 128, g: 64, b: 96 };

    // Try to over-lighten
    const overLightened = lighten(original, 2.0);
    const overLightenedHsl = rgbToHsl(overLightened);
    expect(overLightenedHsl.l).toBeLessThanOrEqual(1);

    // Try to over-darken
    const overDarkened = lighten(original, -2.0);
    const overDarkenedHsl = rgbToHsl(overDarkened);
    expect(overDarkenedHsl.l).toBeGreaterThanOrEqual(0);
  });

  it('should produce white when fully lightened', () => {
    const original: RGB = { r: 100, g: 50, b: 75 };
    const result = lighten(original, 1.0);

    expect(result.r).toBe(255);
    expect(result.g).toBe(255);
    expect(result.b).toBe(255);
  });

  it('should produce black when fully darkened', () => {
    const original: RGB = { r: 100, g: 50, b: 75 };
    const result = lighten(original, -1.0);

    expect(result.r).toBe(0);
    expect(result.g).toBe(0);
    expect(result.b).toBe(0);
  });
});

describe('darken', () => {
  it('should decrease lightness', () => {
    const original: RGB = { r: 200, g: 100, b: 150 };
    const result = darken(original, 0.2);

    const originalHsl = rgbToHsl(original);
    const resultHsl = rgbToHsl(result);

    expect(resultHsl.l).toBeLessThan(originalHsl.l);
  });

  it('should be equivalent to lighten with negative amount', () => {
    const original: RGB = { r: 200, g: 100, b: 150 };
    const darkened = darken(original, 0.2);
    const negativeLightened = lighten(original, -0.2);

    expect(darkened).toEqual(negativeLightened);
  });

  it('should handle already dark color (black)', () => {
    const original: RGB = { r: 0, g: 0, b: 0 }; // Black (l=0)
    const result = darken(original, 0.5);

    const resultHsl = rgbToHsl(result);
    expect(resultHsl.l).toBe(0); // Should stay at 0
  });
});

describe('rotate', () => {
  it('should rotate hue by positive degrees', () => {
    const original: RGB = { r: 255, g: 0, b: 0 }; // Red (h=0)
    const result = rotate(original, 120); // Should become green

    const resultHsl = rgbToHsl(result);
    expect(resultHsl.h).toBeCloseTo(120, 0);
  });

  it('should rotate hue by negative degrees', () => {
    const original: RGB = { r: 255, g: 0, b: 0 }; // Red (h=0)
    const result = rotate(original, -120); // Should become blue

    const resultHsl = rgbToHsl(result);
    expect(resultHsl.h).toBeCloseTo(240, 0);
  });

  it('should wrap hue around 360 degrees', () => {
    const original: RGB = { r: 255, g: 0, b: 0 }; // Red (h=0)
    const result = rotate(original, 360); // Should stay red

    const resultHsl = rgbToHsl(result);
    expect(resultHsl.h).toBeCloseTo(0, 0);
  });

  it('should produce complementary color with 180 degree rotation', () => {
    const original: RGB = { r: 255, g: 0, b: 0 }; // Red
    const result = rotate(original, 180); // Should become cyan

    const resultHsl = rgbToHsl(result);
    expect(resultHsl.h).toBeCloseTo(180, 0);
  });

  it('should preserve saturation and lightness', () => {
    const original: RGB = { r: 200, g: 100, b: 150 };
    const result = rotate(original, 90);

    const originalHsl = rgbToHsl(original);
    const resultHsl = rgbToHsl(result);

    expect(resultHsl.s).toBeCloseTo(originalHsl.s, 2);
    expect(resultHsl.l).toBeCloseTo(originalHsl.l, 2);
  });

  it('should handle rotation beyond 360 degrees', () => {
    const original: RGB = { r: 255, g: 0, b: 0 }; // Red (h=0)
    const result = rotate(original, 480); // 480 % 360 = 120, should become green

    const resultHsl = rgbToHsl(result);
    expect(resultHsl.h).toBeCloseTo(120, 0);
  });

  it('should handle rotation beyond -360 degrees', () => {
    const original: RGB = { r: 255, g: 0, b: 0 }; // Red (h=0)
    const result = rotate(original, -480); // -480 % 360 = -120 = 240, should become blue

    const resultHsl = rgbToHsl(result);
    expect(resultHsl.h).toBeCloseTo(240, 0);
  });

  it('should handle gray (no effect on achromatic)', () => {
    const original: RGB = { r: 128, g: 128, b: 128 };
    const result = rotate(original, 180);

    // Gray should remain gray regardless of hue rotation
    expect(result.r).toBe(original.r);
    expect(result.g).toBe(original.g);
    expect(result.b).toBe(original.b);
  });
});

describe('edge cases', () => {
  it('should handle zero amount transforms', () => {
    const original: RGB = { r: 100, g: 150, b: 200 };

    expect(saturate(original, 0)).toEqual(original);
    expect(desaturate(original, 0)).toEqual(original);
    expect(lighten(original, 0)).toEqual(original);
    expect(darken(original, 0)).toEqual(original);
    expect(rotate(original, 0)).toEqual(original);
  });

  it('should handle extreme saturation amounts', () => {
    const original: RGB = { r: 100, g: 150, b: 200 };

    const extremeSaturate = saturate(original, 10);
    const extremeHsl = rgbToHsl(extremeSaturate);
    expect(extremeHsl.s).toBeLessThanOrEqual(1);

    const extremeDesaturate = saturate(original, -10);
    const extremeDesHsl = rgbToHsl(extremeDesaturate);
    expect(extremeDesHsl.s).toBeGreaterThanOrEqual(0);
  });

  it('should handle extreme lightness amounts', () => {
    const original: RGB = { r: 100, g: 150, b: 200 };

    const extremeLighten = lighten(original, 10);
    const extremeLightHsl = rgbToHsl(extremeLighten);
    expect(extremeLightHsl.l).toBeLessThanOrEqual(1);

    const extremeDarken = lighten(original, -10);
    const extremeDarkHsl = rgbToHsl(extremeDarken);
    expect(extremeDarkHsl.l).toBeGreaterThanOrEqual(0);
  });
});
