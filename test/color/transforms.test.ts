import { describe, expect, it } from 'vitest';
import { rgbToHsl } from '../../src/color/conversions.js';
import { darken, desaturate, fade, lighten, rotate, saturate } from '../../src/color/transforms.js';
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

describe('fade', () => {
  it('should interpolate between source and target using OKLCH', () => {
    const source: RGB = { r: 200, g: 100, b: 50 };
    const target: RGB = { r: 0, g: 0, b: 0 };

    const result = fade(source, target, 0.5);

    // OKLCH interpolation produces different results than naive RGB interpolation
    // Verify that we get a result that's perceptually between the two colors
    expect(result.r).toBeGreaterThan(0);
    expect(result.r).toBeLessThan(200);
    expect(result.g).toBeGreaterThan(0);
    expect(result.g).toBeLessThan(100);
    expect(result.b).toBeGreaterThan(0);
    expect(result.b).toBeLessThan(50);
  });

  it('should return source color when amount is 0', () => {
    const source: RGB = { r: 200, g: 100, b: 50 };
    const target: RGB = { r: 0, g: 0, b: 0 };

    const result = fade(source, target, 0);

    expect(result).toEqual(source);
  });

  it('should return target color when amount is 1', () => {
    const source: RGB = { r: 200, g: 100, b: 50 };
    const target: RGB = { r: 0, g: 0, b: 0 };

    const result = fade(source, target, 1);

    expect(result).toEqual(target);
  });

  it('should clamp amount to 0-1 range', () => {
    const source: RGB = { r: 200, g: 100, b: 50 };
    const target: RGB = { r: 0, g: 0, b: 0 };

    // Amount > 1 should be clamped to 1
    const overFaded = fade(source, target, 2.0);
    expect(overFaded).toEqual(target);

    // Amount < 0 should be clamped to 0
    const underFaded = fade(source, target, -1.0);
    expect(underFaded).toEqual(source);
  });

  it('should fade toward a light background', () => {
    const foreground: RGB = { r: 50, g: 50, b: 50 }; // Dark text
    const background: RGB = { r: 255, g: 255, b: 255 }; // White background

    const result = fade(foreground, background, 0.5);

    // OKLCH interpolation produces perceptually uniform results
    // Should be approximately halfway in perceived lightness
    expect(result.r).toBeGreaterThan(100);
    expect(result.r).toBeLessThan(200);
    expect(result.g).toBeGreaterThan(100);
    expect(result.g).toBeLessThan(200);
    expect(result.b).toBeGreaterThan(100);
    expect(result.b).toBeLessThan(200);
    // For achromatic colors, RGB values should be equal
    expect(result.r).toBe(result.g);
    expect(result.g).toBe(result.b);
  });

  it('should fade toward a dark background', () => {
    const foreground: RGB = { r: 200, g: 200, b: 200 }; // Light text
    const background: RGB = { r: 0, g: 0, b: 0 }; // Black background

    const result = fade(foreground, background, 0.5);

    // OKLCH interpolation produces perceptually uniform results
    // Should be approximately halfway in perceived lightness
    expect(result.r).toBeGreaterThan(50);
    expect(result.r).toBeLessThan(150);
    expect(result.g).toBeGreaterThan(50);
    expect(result.g).toBeLessThan(150);
    expect(result.b).toBeGreaterThan(50);
    expect(result.b).toBeLessThan(150);
    // For achromatic colors, RGB values should be equal
    expect(result.r).toBe(result.g);
    expect(result.g).toBe(result.b);
  });

  it('should handle fading between two colors with perceptually uniform hue', () => {
    const source: RGB = { r: 255, g: 0, b: 0 }; // Red
    const target: RGB = { r: 0, g: 0, b: 255 }; // Blue

    const result = fade(source, target, 0.5);

    // OKLCH uses shortest hue path, so red->blue goes through purple (not green)
    // The intermediate color should have some red and blue, minimal green
    expect(result.g).toBeLessThan(Math.max(result.r, result.b));
  });

  it('should handle fading between achromatic colors', () => {
    const source: RGB = { r: 100, g: 100, b: 100 };
    const target: RGB = { r: 200, g: 200, b: 200 };

    const result = fade(source, target, 0.5);

    // Fading between grays should produce a gray
    expect(result.r).toBe(result.g);
    expect(result.g).toBe(result.b);
    expect(result.r).toBeGreaterThan(100);
    expect(result.r).toBeLessThan(200);
  });

  it('should handle fading from achromatic to chromatic color', () => {
    const source: RGB = { r: 128, g: 128, b: 128 }; // Gray
    const target: RGB = { r: 255, g: 0, b: 0 }; // Red

    const result = fade(source, target, 0.5);

    // Should produce a desaturated red
    expect(result.r).toBeGreaterThan(result.g);
    expect(result.r).toBeGreaterThan(result.b);
  });

  it('should handle fading from chromatic to achromatic color', () => {
    const source: RGB = { r: 255, g: 0, b: 0 }; // Red
    const target: RGB = { r: 128, g: 128, b: 128 }; // Gray

    const result = fade(source, target, 0.5);

    // Should produce a desaturated red
    expect(result.r).toBeGreaterThan(result.g);
    expect(result.r).toBeGreaterThan(result.b);
  });

  it('should round RGB values to integers', () => {
    const source: RGB = { r: 100, g: 100, b: 100 };
    const target: RGB = { r: 0, g: 0, b: 0 };

    const result = fade(source, target, 0.3);

    expect(Number.isInteger(result.r)).toBe(true);
    expect(Number.isInteger(result.g)).toBe(true);
    expect(Number.isInteger(result.b)).toBe(true);
  });

  it('should take shortest hue path when interpolating', () => {
    const source: RGB = { r: 255, g: 0, b: 0 }; // Red (hue ~0°)
    const target: RGB = { r: 255, g: 0, b: 128 }; // Red-violet (hue ~300°)

    const result = fade(source, target, 0.5);

    // Should go through magenta, not through green/yellow
    // Magenta has high R and B, low G
    expect(result.g).toBeLessThan(Math.min(result.r, result.b));
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
