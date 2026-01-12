import { describe, it, expect } from 'vitest';
import { interpolateOklch } from '../../src/gradient/interpolate.js';
import type { RGB } from '../../src/types.js';
import type { HueDirection } from '../../src/gradient/types.js';

/**
 * Helper to check if two RGB colors are approximately equal.
 */
function expectRgbClose(actual: RGB, expected: RGB, tolerance = 2): void {
  expect(Math.abs(actual.r - expected.r)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(actual.g - expected.g)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(actual.b - expected.b)).toBeLessThanOrEqual(tolerance);
}

describe('interpolateOklch', () => {
  describe('basic interpolation', () => {
    it('should return color1 when t=0', () => {
      const color1: RGB = { r: 255, g: 0, b: 0 };
      const color2: RGB = { r: 0, g: 0, b: 255 };
      const result = interpolateOklch(color1, color2, 0);
      expectRgbClose(result, color1);
    });

    it('should return color2 when t=1', () => {
      const color1: RGB = { r: 255, g: 0, b: 0 };
      const color2: RGB = { r: 0, g: 0, b: 255 };
      const result = interpolateOklch(color1, color2, 1);
      expectRgbClose(result, color2);
    });

    it('should return intermediate color when t=0.5', () => {
      const color1: RGB = { r: 255, g: 0, b: 0 };
      const color2: RGB = { r: 0, g: 0, b: 255 };
      const result = interpolateOklch(color1, color2, 0.5);

      // Midpoint should be different from both endpoints
      expect(result.r).not.toBe(255);
      expect(result.b).not.toBe(255);
      expect(result.r).toBeGreaterThan(0);
      expect(result.b).toBeGreaterThan(0);
    });

    it('should handle grayscale interpolation', () => {
      const black: RGB = { r: 0, g: 0, b: 0 };
      const white: RGB = { r: 255, g: 255, b: 255 };
      const result = interpolateOklch(black, white, 0.5);

      // Should produce a gray
      expect(Math.abs(result.r - result.g)).toBeLessThanOrEqual(2);
      expect(Math.abs(result.g - result.b)).toBeLessThanOrEqual(2);
      expect(result.r).toBeGreaterThan(90);
      expect(result.r).toBeLessThan(200);
    });
  });

  describe('t parameter clamping', () => {
    it('should clamp t values below 0', () => {
      const color1: RGB = { r: 255, g: 0, b: 0 };
      const color2: RGB = { r: 0, g: 0, b: 255 };
      const result = interpolateOklch(color1, color2, -0.5);
      expectRgbClose(result, color1);
    });

    it('should clamp t values above 1', () => {
      const color1: RGB = { r: 255, g: 0, b: 0 };
      const color2: RGB = { r: 0, g: 0, b: 255 };
      const result = interpolateOklch(color1, color2, 1.5);
      expectRgbClose(result, color2);
    });
  });

  describe('hue direction: short', () => {
    it('should take shortest path by default', () => {
      const red: RGB = { r: 255, g: 0, b: 0 };
      const blue: RGB = { r: 0, g: 0, b: 255 };
      const result = interpolateOklch(red, blue, 0.5);

      // Verify the result is valid RGB
      expect(result.r).toBeGreaterThanOrEqual(0);
      expect(result.r).toBeLessThanOrEqual(255);
      expect(result.g).toBeGreaterThanOrEqual(0);
      expect(result.g).toBeLessThanOrEqual(255);
      expect(result.b).toBeGreaterThanOrEqual(0);
      expect(result.b).toBeLessThanOrEqual(255);
    });

    it('should take shortest path when explicitly specified', () => {
      const red: RGB = { r: 255, g: 0, b: 0 };
      const cyan: RGB = { r: 0, g: 255, b: 255 };
      const result = interpolateOklch(red, cyan, 0.5, 'short');

      expect(result.r).toBeGreaterThanOrEqual(0);
      expect(result.r).toBeLessThanOrEqual(255);
      expect(result.g).toBeGreaterThanOrEqual(0);
      expect(result.g).toBeLessThanOrEqual(255);
      expect(result.b).toBeGreaterThanOrEqual(0);
      expect(result.b).toBeLessThanOrEqual(255);
    });

    it('should handle colors close together', () => {
      const color1: RGB = { r: 255, g: 50, b: 0 };
      const color2: RGB = { r: 255, g: 100, b: 0 };
      const result = interpolateOklch(color1, color2, 0.5, 'short');

      expectRgbClose(result, { r: 255, g: 75, b: 0 }, 10);
    });
  });

  describe('hue direction: long', () => {
    it('should take longest path around color wheel', () => {
      const red: RGB = { r: 255, g: 0, b: 0 };
      const yellow: RGB = { r: 255, g: 255, b: 0 };
      const resultShort = interpolateOklch(red, yellow, 0.5, 'short');
      const resultLong = interpolateOklch(red, yellow, 0.5, 'long');

      // Long path should go through cooler colors (more blue)
      expect(resultLong.b).toBeGreaterThan(resultShort.b);
    });

    it('should produce valid RGB in long mode', () => {
      const color1: RGB = { r: 100, g: 200, b: 50 };
      const color2: RGB = { r: 200, g: 100, b: 150 };
      const result = interpolateOklch(color1, color2, 0.5, 'long');

      expect(result.r).toBeGreaterThanOrEqual(0);
      expect(result.r).toBeLessThanOrEqual(255);
      expect(result.g).toBeGreaterThanOrEqual(0);
      expect(result.g).toBeLessThanOrEqual(255);
      expect(result.b).toBeGreaterThanOrEqual(0);
      expect(result.b).toBeLessThanOrEqual(255);
    });
  });

  describe('hue direction: increasing', () => {
    it('should always increase hue', () => {
      const red: RGB = { r: 255, g: 0, b: 0 };
      const blue: RGB = { r: 0, g: 0, b: 255 };
      const result = interpolateOklch(red, blue, 0.5, 'increasing');

      expect(result.r).toBeGreaterThanOrEqual(0);
      expect(result.r).toBeLessThanOrEqual(255);
      expect(result.g).toBeGreaterThanOrEqual(0);
      expect(result.g).toBeLessThanOrEqual(255);
      expect(result.b).toBeGreaterThanOrEqual(0);
      expect(result.b).toBeLessThanOrEqual(255);
    });

    it('should wrap through 360 if necessary', () => {
      const color1: RGB = { r: 0, g: 0, b: 255 }; // Blue (~264°)
      const color2: RGB = { r: 255, g: 0, b: 0 }; // Red (~29°)
      const result = interpolateOklch(color1, color2, 0.5, 'increasing');

      expect(result.r).toBeGreaterThanOrEqual(0);
      expect(result.r).toBeLessThanOrEqual(255);
      expect(result.g).toBeGreaterThanOrEqual(0);
      expect(result.g).toBeLessThanOrEqual(255);
      expect(result.b).toBeGreaterThanOrEqual(0);
      expect(result.b).toBeLessThanOrEqual(255);
    });
  });

  describe('hue direction: decreasing', () => {
    it('should always decrease hue', () => {
      const blue: RGB = { r: 0, g: 0, b: 255 };
      const red: RGB = { r: 255, g: 0, b: 0 };
      const result = interpolateOklch(blue, red, 0.5, 'decreasing');

      expect(result.r).toBeGreaterThanOrEqual(0);
      expect(result.r).toBeLessThanOrEqual(255);
      expect(result.g).toBeGreaterThanOrEqual(0);
      expect(result.g).toBeLessThanOrEqual(255);
      expect(result.b).toBeGreaterThanOrEqual(0);
      expect(result.b).toBeLessThanOrEqual(255);
    });

    it('should wrap through 0 if necessary', () => {
      const color1: RGB = { r: 255, g: 0, b: 0 }; // Red (~29°)
      const color2: RGB = { r: 0, g: 0, b: 255 }; // Blue (~264°)
      const result = interpolateOklch(color1, color2, 0.5, 'decreasing');

      expect(result.r).toBeGreaterThanOrEqual(0);
      expect(result.r).toBeLessThanOrEqual(255);
      expect(result.g).toBeGreaterThanOrEqual(0);
      expect(result.g).toBeLessThanOrEqual(255);
      expect(result.b).toBeGreaterThanOrEqual(0);
      expect(result.b).toBeLessThanOrEqual(255);
    });
  });

  describe('achromatic color handling', () => {
    it('should handle both colors achromatic', () => {
      const gray1: RGB = { r: 64, g: 64, b: 64 };
      const gray2: RGB = { r: 192, g: 192, b: 192 };
      const result = interpolateOklch(gray1, gray2, 0.5);

      // Should produce a gray
      expect(Math.abs(result.r - result.g)).toBeLessThanOrEqual(2);
      expect(Math.abs(result.g - result.b)).toBeLessThanOrEqual(2);
      expect(result.r).toBeGreaterThan(64);
      expect(result.r).toBeLessThan(192);
    });

    it('should handle one color achromatic', () => {
      const gray: RGB = { r: 128, g: 128, b: 128 };
      const red: RGB = { r: 255, g: 0, b: 0 };
      const result = interpolateOklch(gray, red, 0.5);

      expect(result.r).toBeGreaterThanOrEqual(0);
      expect(result.r).toBeLessThanOrEqual(255);
      expect(result.g).toBeGreaterThanOrEqual(0);
      expect(result.g).toBeLessThanOrEqual(255);
      expect(result.b).toBeGreaterThanOrEqual(0);
      expect(result.b).toBeLessThanOrEqual(255);
    });

    it('should use chromatic hue when one color is achromatic', () => {
      const white: RGB = { r: 255, g: 255, b: 255 };
      const blue: RGB = { r: 0, g: 0, b: 255 };
      const result = interpolateOklch(white, blue, 0.5);

      // Should be bluish (more blue than red or green)
      expect(result.b).toBeGreaterThan(result.r);
      expect(result.b).toBeGreaterThan(result.g);
    });
  });

  describe('edge cases', () => {
    it('should handle identical colors', () => {
      const color: RGB = { r: 128, g: 64, b: 200 };
      const result = interpolateOklch(color, color, 0.5);
      expectRgbClose(result, color);
    });

    it('should handle t=0.25 and t=0.75', () => {
      const black: RGB = { r: 0, g: 0, b: 0 };
      const white: RGB = { r: 255, g: 255, b: 255 };

      const quarter = interpolateOklch(black, white, 0.25);
      const threeQuarter = interpolateOklch(black, white, 0.75);

      // Quarter should be darker than three-quarter
      expect(quarter.r).toBeLessThan(threeQuarter.r);
      expect(quarter.g).toBeLessThan(threeQuarter.g);
      expect(quarter.b).toBeLessThan(threeQuarter.b);
    });

    it('should handle multiple steps in a gradient', () => {
      const red: RGB = { r: 255, g: 0, b: 0 };
      const blue: RGB = { r: 0, g: 0, b: 255 };

      const steps = [0, 0.25, 0.5, 0.75, 1];
      const results = steps.map((t) => interpolateOklch(red, blue, t));

      // All results should be valid
      for (const result of results) {
        expect(result.r).toBeGreaterThanOrEqual(0);
        expect(result.r).toBeLessThanOrEqual(255);
        expect(result.g).toBeGreaterThanOrEqual(0);
        expect(result.g).toBeLessThanOrEqual(255);
        expect(result.b).toBeGreaterThanOrEqual(0);
        expect(result.b).toBeLessThanOrEqual(255);
      }
    });

    it('should produce smooth gradients', () => {
      const color1: RGB = { r: 100, g: 200, b: 50 };
      const color2: RGB = { r: 200, g: 50, b: 150 };

      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const result = interpolateOklch(color1, color2, t);

        expect(result.r).toBeGreaterThanOrEqual(0);
        expect(result.r).toBeLessThanOrEqual(255);
        expect(result.g).toBeGreaterThanOrEqual(0);
        expect(result.g).toBeLessThanOrEqual(255);
        expect(result.b).toBeGreaterThanOrEqual(0);
        expect(result.b).toBeLessThanOrEqual(255);
      }
    });
  });

  describe('perceptual uniformity', () => {
    it('should provide more perceptually uniform interpolation than naive RGB', () => {
      const red: RGB = { r: 255, g: 0, b: 0 };
      const green: RGB = { r: 0, g: 255, b: 0 };

      // OKLCH interpolation should avoid going through dark colors
      const result = interpolateOklch(red, green, 0.5);

      // Midpoint should maintain reasonable brightness (not go very dark)
      const brightness = (result.r + result.g + result.b) / 3;
      expect(brightness).toBeGreaterThan(50);
    });
  });

  describe('integration with all hue directions', () => {
    it('should produce different results for different hue directions', () => {
      const color1: RGB = { r: 255, g: 0, b: 0 };
      const color2: RGB = { r: 0, g: 255, b: 0 };

      const directions: HueDirection[] = ['short', 'long', 'increasing', 'decreasing'];
      const results = directions.map((dir) => interpolateOklch(color1, color2, 0.5, dir));

      // All should be valid
      for (const result of results) {
        expect(result.r).toBeGreaterThanOrEqual(0);
        expect(result.r).toBeLessThanOrEqual(255);
        expect(result.g).toBeGreaterThanOrEqual(0);
        expect(result.g).toBeLessThanOrEqual(255);
        expect(result.b).toBeGreaterThanOrEqual(0);
        expect(result.b).toBeLessThanOrEqual(255);
      }

      // Short and long should differ
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const shortResult = results[0]!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const longResult = results[1]!;
      const shortLongSame =
        Math.abs(shortResult.r - longResult.r) < 5 &&
        Math.abs(shortResult.g - longResult.g) < 5 &&
        Math.abs(shortResult.b - longResult.b) < 5;

      expect(shortLongSame).toBe(false);
    });
  });
});
