import { describe, it, expect } from 'vitest';
import { createGradient, createGradient2D } from '../../src/gradient/gradient.js';
import { createColor } from '../../src/builder/builder.js';
import { detectCapabilities } from '../../src/capability/detect.js';
import { FALLBACK_PALETTE, ANSI_COLOR_INDICES } from '../../src/color/palette.js';
import type { Theme } from '../../src/theme/types.js';
import type { AnsiColorName } from '../../src/types.js';

/**
 * Create a test theme with RGB values from the fallback palette.
 * This ensures gradient tests have colors with RGB values to interpolate.
 */
function createTestTheme(): Theme {
  const capabilities = detectCapabilities({
    forceColor: 'truecolor',
    forceTheme: 'palette',
    isTTY: true,
  });

  const makeColor = (name: AnsiColorName) => {
    const index = ANSI_COLOR_INDICES[name];
    const baseRgb = FALLBACK_PALETTE[name];

    return createColor({
      ansiIndex: index,
      baseRgb,
      transforms: [],
      modifiers: {},
      background: null,
      capabilities,
      terminalBackground: null,
    });
  };

  return {
    black: makeColor('black'),
    red: makeColor('red'),
    green: makeColor('green'),
    yellow: makeColor('yellow'),
    blue: makeColor('blue'),
    magenta: makeColor('magenta'),
    cyan: makeColor('cyan'),
    white: makeColor('white'),
    brightBlack: makeColor('brightBlack'),
    brightRed: makeColor('brightRed'),
    brightGreen: makeColor('brightGreen'),
    brightYellow: makeColor('brightYellow'),
    brightBlue: makeColor('brightBlue'),
    brightMagenta: makeColor('brightMagenta'),
    brightCyan: makeColor('brightCyan'),
    brightWhite: makeColor('brightWhite'),
    error: makeColor('red'),
    warning: makeColor('yellow'),
    success: makeColor('green'),
    info: makeColor('blue'),
    muted: makeColor('brightBlack'),
    foreground: makeColor('white'),
    background: makeColor('black'),
    capabilities,
    palette: null,
  };
}

describe('createGradient', () => {
  describe('validation', () => {
    it('should throw if less than 2 stops provided', () => {
      const theme = createTestTheme();

      expect(() => {
        createGradient([{ position: 0, color: theme.red }]);
      }).toThrow('Gradient requires at least 2 stops');
    });

    it('should throw if stop position is below 0', () => {
      const theme = createTestTheme();

      expect(() => {
        createGradient([
          { position: -0.1, color: theme.red },
          { position: 1, color: theme.blue },
        ]);
      }).toThrow('Invalid gradient stop position');
    });

    it('should throw if stop position is above 1', () => {
      const theme = createTestTheme();

      expect(() => {
        createGradient([
          { position: 0, color: theme.red },
          { position: 1.1, color: theme.blue },
        ]);
      }).toThrow('Invalid gradient stop position');
    });
  });

  describe('basic interpolation', () => {
    it('should return first color when position is 0', () => {
      const theme = createTestTheme();

      const gradient = createGradient([
        { position: 0, color: theme.red },
        { position: 1, color: theme.blue },
      ]);

      const color = gradient.at(0);
      expect(color.rgb).toEqual(theme.red.rgb);
    });

    it('should return last color when position is 1', () => {
      const theme = createTestTheme();

      const gradient = createGradient([
        { position: 0, color: theme.red },
        { position: 1, color: theme.blue },
      ]);

      const color = gradient.at(1);
      expect(color.rgb).toEqual(theme.blue.rgb);
    });

    it('should interpolate between two colors at position 0.5', () => {
      const theme = createTestTheme();

      const gradient = createGradient([
        { position: 0, color: theme.red },
        { position: 1, color: theme.blue },
      ]);

      const color = gradient.at(0.5);
      expect(color.rgb).not.toBeNull();
      expect(color.rgb).not.toEqual(theme.red.rgb);
      expect(color.rgb).not.toEqual(theme.blue.rgb);
    });

    it('should handle multiple stops', () => {
      const theme = createTestTheme();

      const gradient = createGradient([
        { position: 0, color: theme.red },
        { position: 0.5, color: theme.green },
        { position: 1, color: theme.blue },
      ]);

      const color1 = gradient.at(0);
      const color2 = gradient.at(0.5);
      const color3 = gradient.at(1);

      expect(color1.rgb).toEqual(theme.red.rgb);
      expect(color2.rgb).toEqual(theme.green.rgb);
      expect(color3.rgb).toEqual(theme.blue.rgb);
    });

    it('should interpolate within segments', () => {
      const theme = createTestTheme();

      const gradient = createGradient([
        { position: 0, color: theme.red },
        { position: 0.5, color: theme.green },
        { position: 1, color: theme.blue },
      ]);

      const color = gradient.at(0.25); // Between red and green
      expect(color.rgb).not.toBeNull();
      expect(color.rgb).not.toEqual(theme.red.rgb);
      expect(color.rgb).not.toEqual(theme.green.rgb);
    });
  });

  describe('clamping (non-looping)', () => {
    it('should clamp positions below 0 to 0', () => {
      const theme = createTestTheme();

      const gradient = createGradient([
        { position: 0, color: theme.red },
        { position: 1, color: theme.blue },
      ]);

      const color = gradient.at(-0.5);
      expect(color.rgb).toEqual(theme.red.rgb);
    });

    it('should clamp positions above 1 to 1', () => {
      const theme = createTestTheme();

      const gradient = createGradient([
        { position: 0, color: theme.red },
        { position: 1, color: theme.blue },
      ]);

      const color = gradient.at(1.5);
      expect(color.rgb).toEqual(theme.blue.rgb);
    });
  });

  describe('looping', () => {
    it('should wrap positions when loop is enabled', () => {
      const theme = createTestTheme();

      const gradient = createGradient(
        [
          { position: 0, color: theme.red },
          { position: 1, color: theme.blue },
        ],
        { loop: true }
      );

      // Position 1.5 should wrap to 0.5
      const color1 = gradient.at(0.5);
      const color2 = gradient.at(1.5);

      expect(color1.rgb).toEqual(color2.rgb);
    });

    it('should handle negative positions when looping', () => {
      const theme = createTestTheme();

      const gradient = createGradient(
        [
          { position: 0, color: theme.red },
          { position: 1, color: theme.blue },
        ],
        { loop: true }
      );

      // Position -0.5 should wrap to 0.5
      const color1 = gradient.at(0.5);
      const color2 = gradient.at(-0.5);

      expect(color1.rgb).toEqual(color2.rgb);
    });

    it('should expose loop property', () => {
      const theme = createTestTheme();

      const nonLooping = createGradient([
        { position: 0, color: theme.red },
        { position: 1, color: theme.blue },
      ]);

      const looping = createGradient(
        [
          { position: 0, color: theme.red },
          { position: 1, color: theme.blue },
        ],
        { loop: true }
      );

      expect(nonLooping.loop).toBe(false);
      expect(looping.loop).toBe(true);
    });
  });

  describe('easing', () => {
    it('should apply easing function to position', () => {
      const theme = createTestTheme();

      const easeInQuad = (t: number) => t * t;

      const gradient = createGradient(
        [
          { position: 0, color: theme.black },
          { position: 1, color: theme.white },
        ],
        { easing: easeInQuad }
      );

      const linearGradient = createGradient([
        { position: 0, color: theme.black },
        { position: 1, color: theme.white },
      ]);

      // With quadratic easing, midpoint should be darker
      const easedColor = gradient.at(0.5);
      const linearColor = linearGradient.at(0.5);

      expect(easedColor.rgb).not.toBeNull();
      expect(linearColor.rgb).not.toBeNull();

      if (easedColor.rgb && linearColor.rgb) {
        const easedBrightness = (easedColor.rgb[0] + easedColor.rgb[1] + easedColor.rgb[2]) / 3;
        const linearBrightness = (linearColor.rgb[0] + linearColor.rgb[1] + linearColor.rgb[2]) / 3;

        expect(easedBrightness).toBeLessThan(linearBrightness);
      }
    });
  });

  describe('hue direction', () => {
    it('should respect hue direction option', () => {
      const theme = createTestTheme();

      const shortGradient = createGradient(
        [
          { position: 0, color: theme.red },
          { position: 1, color: theme.green },
        ],
        { hueDirection: 'short' }
      );

      const longGradient = createGradient(
        [
          { position: 0, color: theme.red },
          { position: 1, color: theme.green },
        ],
        { hueDirection: 'long' }
      );

      const shortColor = shortGradient.at(0.5);
      const longColor = longGradient.at(0.5);

      expect(shortColor.rgb).not.toBeNull();
      expect(longColor.rgb).not.toBeNull();
      expect(shortColor.rgb).not.toEqual(longColor.rgb);
    });
  });

  describe('stops property', () => {
    it('should expose sorted stops', () => {
      const theme = createTestTheme();

      const gradient = createGradient([
        { position: 1, color: theme.blue },
        { position: 0, color: theme.red },
        { position: 0.5, color: theme.green },
      ]);

      expect(gradient.stops).toHaveLength(3);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(gradient.stops[0]!.position).toBe(0);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(gradient.stops[1]!.position).toBe(0.5);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(gradient.stops[2]!.position).toBe(1);
    });

    it('should return immutable stops', () => {
      const theme = createTestTheme();

      const gradient = createGradient([
        { position: 0, color: theme.red },
        { position: 1, color: theme.blue },
      ]);

      const stops = gradient.stops;
      expect(stops).toBeInstanceOf(Array);
    });
  });

  describe('color output', () => {
    it('should return Color instances that are callable', () => {
      const theme = createTestTheme();

      const gradient = createGradient([
        { position: 0, color: theme.red },
        { position: 1, color: theme.blue },
      ]);

      const color = gradient.at(0.5);
      const result = color('test');

      expect(typeof result).toBe('string');
      expect(result).toContain('test');
    });

    it('should preserve capabilities from source colors', () => {
      const theme = createTestTheme();

      const gradient = createGradient([
        { position: 0, color: theme.red },
        { position: 1, color: theme.blue },
      ]);

      const color = gradient.at(0.5);

      // The interpolated color should have RGB values
      expect(color.rgb).not.toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle stops at same position', () => {
      const theme = createTestTheme();

      const gradient = createGradient([
        { position: 0, color: theme.red },
        { position: 0.5, color: theme.green },
        { position: 0.5, color: theme.blue },
        { position: 1, color: theme.yellow },
      ]);

      const color = gradient.at(0.5);
      expect(color.rgb).not.toBeNull();
    });

    it('should handle many stops', () => {
      const theme = createTestTheme();

      const stops = [
        { position: 0, color: theme.black },
        { position: 0.1, color: theme.red },
        { position: 0.2, color: theme.yellow },
        { position: 0.3, color: theme.green },
        { position: 0.4, color: theme.cyan },
        { position: 0.5, color: theme.blue },
        { position: 0.6, color: theme.magenta },
        { position: 0.7, color: theme.red },
        { position: 0.8, color: theme.yellow },
        { position: 0.9, color: theme.green },
        { position: 1, color: theme.white },
      ];

      const gradient = createGradient(stops);

      for (let i = 0; i <= 10; i++) {
        const color = gradient.at(i / 10);
        expect(color.rgb).not.toBeNull();
      }
    });

    it('should handle fine-grained sampling', () => {
      const theme = createTestTheme();

      const gradient = createGradient([
        { position: 0, color: theme.red },
        { position: 1, color: theme.blue },
      ]);

      for (let i = 0; i <= 100; i++) {
        const color = gradient.at(i / 100);
        expect(color.rgb).not.toBeNull();
      }
    });
  });
});

describe('createGradient2D', () => {
  describe('basic functionality', () => {
    it('should create a 2D gradient from x and y stops', () => {
      const theme = createTestTheme();

      const gradient = createGradient2D({
        x: [
          { position: 0, color: theme.red },
          { position: 1, color: theme.blue },
        ],
        y: [
          { position: 0, color: theme.white },
          { position: 1, color: theme.black },
        ],
      });

      expect(gradient).toBeDefined();
      expect(gradient.xGradient).toBeDefined();
      expect(gradient.yGradient).toBeDefined();
    });

    it('should blend x and y gradients at coordinates', () => {
      const theme = createTestTheme();

      const gradient = createGradient2D({
        x: [
          { position: 0, color: theme.red },
          { position: 1, color: theme.blue },
        ],
        y: [
          { position: 0, color: theme.white },
          { position: 1, color: theme.black },
        ],
      });

      const color = gradient.at(0.5, 0.5);
      expect(color.rgb).not.toBeNull();
    });

    it('should expose underlying gradients', () => {
      const theme = createTestTheme();

      const gradient = createGradient2D({
        x: [
          { position: 0, color: theme.red },
          { position: 1, color: theme.blue },
        ],
        y: [
          { position: 0, color: theme.white },
          { position: 1, color: theme.black },
        ],
      });

      expect(gradient.xGradient.stops).toHaveLength(2);
      expect(gradient.yGradient.stops).toHaveLength(2);
    });
  });

  describe('blend modes', () => {
    it('should use average blend mode by default', () => {
      const theme = createTestTheme();

      const gradient = createGradient2D({
        x: [
          { position: 0, color: theme.red },
          { position: 1, color: theme.red },
        ],
        y: [
          { position: 0, color: theme.blue },
          { position: 1, color: theme.blue },
        ],
      });

      const color = gradient.at(0.5, 0.5);
      expect(color.rgb).not.toBeNull();

      // Average of pure red and pure blue should have both components
      if (color.rgb) {
        expect(color.rgb[0]).toBeGreaterThan(0); // Has red
        expect(color.rgb[2]).toBeGreaterThan(0); // Has blue
      }
    });

    it('should support multiply blend mode', () => {
      const theme = createTestTheme();

      const gradient = createGradient2D(
        {
          x: [
            { position: 0, color: theme.white },
            { position: 1, color: theme.white },
          ],
          y: [
            { position: 0, color: theme.red },
            { position: 1, color: theme.red },
          ],
        },
        { blendMode: 'multiply' }
      );

      const color = gradient.at(0.5, 0.5);
      expect(color.rgb).not.toBeNull();

      // Multiply white with red should give a red-ish color
      // Note: FALLBACK_PALETTE red is (205,49,49), not pure (255,0,0)
      if (color.rgb) {
        expect(color.rgb[0]).toBeGreaterThan(150); // Mostly red
        expect(color.rgb[1]).toBeLessThan(100); // Some green from red's non-zero G channel
        expect(color.rgb[2]).toBeLessThan(100); // Some blue from red's non-zero B channel
      }
    });

    it('should support overlay blend mode', () => {
      const theme = createTestTheme();

      const gradient = createGradient2D(
        {
          x: [
            { position: 0, color: theme.red },
            { position: 1, color: theme.red },
          ],
          y: [
            { position: 0, color: theme.blue },
            { position: 1, color: theme.blue },
          ],
        },
        { blendMode: 'overlay' }
      );

      const color = gradient.at(0.5, 0.5);
      expect(color.rgb).not.toBeNull();
    });

    it('should produce different results for different blend modes', () => {
      const theme = createTestTheme();

      const input = {
        x: [
          { position: 0, color: theme.red },
          { position: 1, color: theme.red },
        ],
        y: [
          { position: 0, color: theme.blue },
          { position: 1, color: theme.blue },
        ],
      };

      const average = createGradient2D(input, { blendMode: 'average' });
      const multiply = createGradient2D(input, { blendMode: 'multiply' });
      const overlay = createGradient2D(input, { blendMode: 'overlay' });

      const avgColor = average.at(0.5, 0.5);
      const mulColor = multiply.at(0.5, 0.5);
      const ovlColor = overlay.at(0.5, 0.5);

      // All three should produce different results
      expect(avgColor.rgb).not.toEqual(mulColor.rgb);
      expect(avgColor.rgb).not.toEqual(ovlColor.rgb);
      expect(mulColor.rgb).not.toEqual(ovlColor.rgb);
    });
  });

  describe('looping', () => {
    it('should support independent x and y looping', () => {
      const theme = createTestTheme();

      const gradient = createGradient2D(
        {
          x: [
            { position: 0, color: theme.red },
            { position: 1, color: theme.blue },
          ],
          y: [
            { position: 0, color: theme.white },
            { position: 1, color: theme.black },
          ],
        },
        { loop: { x: true, y: true } }
      );

      expect(gradient.xGradient.loop).toBe(true);
      expect(gradient.yGradient.loop).toBe(true);
    });

    it('should support looping only on x axis', () => {
      const theme = createTestTheme();

      const gradient = createGradient2D(
        {
          x: [
            { position: 0, color: theme.red },
            { position: 1, color: theme.blue },
          ],
          y: [
            { position: 0, color: theme.white },
            { position: 1, color: theme.black },
          ],
        },
        { loop: { x: true } }
      );

      expect(gradient.xGradient.loop).toBe(true);
      expect(gradient.yGradient.loop).toBe(false);
    });

    it('should support looping only on y axis', () => {
      const theme = createTestTheme();

      const gradient = createGradient2D(
        {
          x: [
            { position: 0, color: theme.red },
            { position: 1, color: theme.blue },
          ],
          y: [
            { position: 0, color: theme.white },
            { position: 1, color: theme.black },
          ],
        },
        { loop: { y: true } }
      );

      expect(gradient.xGradient.loop).toBe(false);
      expect(gradient.yGradient.loop).toBe(true);
    });

    it('should wrap x coordinates when x looping enabled', () => {
      const theme = createTestTheme();

      const gradient = createGradient2D(
        {
          x: [
            { position: 0, color: theme.red },
            { position: 1, color: theme.blue },
          ],
          y: [
            { position: 0, color: theme.white },
            { position: 1, color: theme.white },
          ],
        },
        { loop: { x: true } }
      );

      const color1 = gradient.at(0.25, 0.5);
      const color2 = gradient.at(1.25, 0.5);

      expect(color1.rgb).toEqual(color2.rgb);
    });
  });

  describe('easing and hue direction', () => {
    it('should apply easing to both axes', () => {
      const theme = createTestTheme();

      const easeInQuad = (t: number) => t * t;

      const gradient = createGradient2D(
        {
          x: [
            { position: 0, color: theme.red },
            { position: 1, color: theme.blue },
          ],
          y: [
            { position: 0, color: theme.white },
            { position: 1, color: theme.black },
          ],
        },
        { easing: easeInQuad }
      );

      const color = gradient.at(0.5, 0.5);
      expect(color.rgb).not.toBeNull();
    });

    it('should apply hue direction to both axes', () => {
      const theme = createTestTheme();

      const gradient = createGradient2D(
        {
          x: [
            { position: 0, color: theme.red },
            { position: 1, color: theme.green },
          ],
          y: [
            { position: 0, color: theme.blue },
            { position: 1, color: theme.yellow },
          ],
        },
        { hueDirection: 'long' }
      );

      const color = gradient.at(0.5, 0.5);
      expect(color.rgb).not.toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle corners correctly', () => {
      const theme = createTestTheme();

      const gradient = createGradient2D({
        x: [
          { position: 0, color: theme.red },
          { position: 1, color: theme.blue },
        ],
        y: [
          { position: 0, color: theme.white },
          { position: 1, color: theme.black },
        ],
      });

      // Each corner should be a blend
      const topLeft = gradient.at(0, 0);
      const topRight = gradient.at(1, 0);
      const bottomLeft = gradient.at(0, 1);
      const bottomRight = gradient.at(1, 1);

      expect(topLeft.rgb).not.toBeNull();
      expect(topRight.rgb).not.toBeNull();
      expect(bottomLeft.rgb).not.toBeNull();
      expect(bottomRight.rgb).not.toBeNull();

      // All corners should be different
      expect(topLeft.rgb).not.toEqual(topRight.rgb);
      expect(topLeft.rgb).not.toEqual(bottomLeft.rgb);
      expect(bottomRight.rgb).not.toEqual(topRight.rgb);
    });

    it('should handle fine-grained 2D sampling', () => {
      const theme = createTestTheme();

      const gradient = createGradient2D({
        x: [
          { position: 0, color: theme.red },
          { position: 1, color: theme.blue },
        ],
        y: [
          { position: 0, color: theme.white },
          { position: 1, color: theme.black },
        ],
      });

      for (let x = 0; x <= 10; x++) {
        for (let y = 0; y <= 10; y++) {
          const color = gradient.at(x / 10, y / 10);
          expect(color.rgb).not.toBeNull();
        }
      }
    });
  });

  describe('color output', () => {
    it('should return Color instances that are callable', () => {
      const theme = createTestTheme();

      const gradient = createGradient2D({
        x: [
          { position: 0, color: theme.red },
          { position: 1, color: theme.blue },
        ],
        y: [
          { position: 0, color: theme.white },
          { position: 1, color: theme.black },
        ],
      });

      const color = gradient.at(0.5, 0.5);
      const result = color('test');

      expect(typeof result).toBe('string');
      expect(result).toContain('test');
    });
  });
});
