import { describe, it, expect } from 'vitest';
import { createColor } from '../../src/builder/builder.js';
import type { Capabilities } from '../../src/capability/types.js';
import type { Theme } from '../../src/theme/types.js';
import type { RGB } from '../../src/types.js';

/**
 * Helper to create theme with specific capabilities.
 * For T3 tests, we need to manually build the theme with palette data
 * since skipProbe=true prevents palette detection.
 */
function createTestTheme(
  colorLevel: 'none' | 'ansi16' | 'ansi256' | 'truecolor',
  themeLevel: 'blind' | 'palette'
): Theme {
  const capabilities: Capabilities = { color: colorLevel, theme: themeLevel, isTTY: true };

  // Standard fallback RGB values for testing
  const fallbackColors: Record<number, RGB> = {
    0: { r: 0, g: 0, b: 0 }, // black
    1: { r: 205, g: 49, b: 49 }, // red
    2: { r: 13, g: 188, b: 121 }, // green
    3: { r: 229, g: 229, b: 16 }, // yellow
    4: { r: 36, g: 114, b: 200 }, // blue
    5: { r: 188, g: 63, b: 188 }, // magenta
    6: { r: 17, g: 168, b: 205 }, // cyan
    7: { r: 229, g: 229, b: 229 }, // white
    8: { r: 102, g: 102, b: 102 }, // brightBlack
    9: { r: 241, g: 76, b: 76 }, // brightRed
    10: { r: 35, g: 209, b: 139 }, // brightGreen
    11: { r: 245, g: 245, b: 67 }, // brightYellow
    12: { r: 59, g: 142, b: 234 }, // brightBlue
    13: { r: 214, g: 112, b: 214 }, // brightMagenta
    14: { r: 41, g: 184, b: 219 }, // brightCyan
    15: { r: 255, g: 255, b: 255 }, // brightWhite
  };

  const getColor = (index: number): RGB => {
    const color = fallbackColors[index];
    if (!color) throw new Error(`Missing color for index ${String(index)}`);
    return color;
  };

  const makeColor = (ansiIndex: number) => {
    return createColor({
      ansiIndex: ansiIndex as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15,
      baseRgb: themeLevel === 'palette' ? getColor(ansiIndex) : null,
      transforms: [],
      modifiers: {},
      background: null,
      terminalBackground: null,
      capabilities,
    });
  };

  return {
    black: makeColor(0),
    red: makeColor(1),
    green: makeColor(2),
    yellow: makeColor(3),
    blue: makeColor(4),
    magenta: makeColor(5),
    cyan: makeColor(6),
    white: makeColor(7),
    brightBlack: makeColor(8),
    brightRed: makeColor(9),
    brightGreen: makeColor(10),
    brightYellow: makeColor(11),
    brightBlue: makeColor(12),
    brightMagenta: makeColor(13),
    brightCyan: makeColor(14),
    brightWhite: makeColor(15),
    error: makeColor(1),
    warning: makeColor(3),
    success: makeColor(2),
    info: makeColor(4),
    muted: makeColor(8),
    foreground: makeColor(7),
    background: makeColor(0),
    capabilities,
    palette:
      themeLevel === 'palette'
        ? {
            colors: new Map(Object.entries(fallbackColors).map(([k, v]) => [Number(k), v])),
            foreground: getColor(7),
            background: getColor(0),
          }
        : null,
  };
}

describe('Golden Tests - Escape Sequence Output', () => {
  describe('C0 (no color)', () => {
    it('should output plain text with no escapes', () => {
      const theme = createTestTheme('none', 'blind');
      expect(theme.red('hello')).toMatchSnapshot();
      expect(theme.red.bold()('hello')).toMatchSnapshot();
    });
  });

  describe('C1 (ANSI-16)', () => {
    it('should output ANSI-16 escape codes for base colors', () => {
      const theme = createTestTheme('ansi16', 'blind');
      expect(theme.red('hello')).toMatchSnapshot();
      expect(theme.green('hello')).toMatchSnapshot();
      expect(theme.blue('hello')).toMatchSnapshot();
      expect(theme.brightRed('hello')).toMatchSnapshot();
    });

    it('should output correct codes for modifiers', () => {
      const theme = createTestTheme('ansi16', 'blind');
      expect(theme.red.bold()('hello')).toMatchSnapshot();
      expect(theme.red.italic()('hello')).toMatchSnapshot();
      expect(theme.red.underline()('hello')).toMatchSnapshot();
      expect(theme.red.dim()('hello')).toMatchSnapshot();
      expect(theme.red.strikethrough()('hello')).toMatchSnapshot();
    });

    it('should output correct codes for backgrounds', () => {
      const theme = createTestTheme('ansi16', 'blind');
      expect(theme.white.on(theme.red)('hello')).toMatchSnapshot();
      expect(theme.black.on(theme.yellow)('hello')).toMatchSnapshot();
    });

    it('should ignore transforms at T1', () => {
      const theme = createTestTheme('ansi16', 'blind');
      // Transforms are no-ops at T1, so output should be same as base
      expect(theme.red.saturate(0.5)('hello')).toMatchSnapshot();
      expect(theme.red.lighten(0.3)('hello')).toMatchSnapshot();
    });
  });

  describe('C2 (ANSI-256)', () => {
    it('should output ANSI-256 codes when transforms applied at T3', () => {
      const theme = createTestTheme('ansi256', 'palette');
      // At T3 with C2, transforms produce ANSI-256 output
      expect(theme.red.saturate(0.5)('hello')).toMatchSnapshot();
      expect(theme.blue.lighten(0.3)('hello')).toMatchSnapshot();
    });
  });

  describe('C3 (Truecolor)', () => {
    it('should output RGB escape codes at T3', () => {
      const theme = createTestTheme('truecolor', 'palette');
      expect(theme.red('hello')).toMatchSnapshot();
      expect(theme.red.saturate(0.5)('hello')).toMatchSnapshot();
      expect(theme.blue.lighten(0.3)('hello')).toMatchSnapshot();
      expect(theme.green.rotate(30)('hello')).toMatchSnapshot();
    });

    it('should chain multiple transforms', () => {
      const theme = createTestTheme('truecolor', 'palette');
      expect(theme.red.saturate(0.2).lighten(0.1)('hello')).toMatchSnapshot();
      expect(theme.blue.darken(0.2).rotate(15)('hello')).toMatchSnapshot();
    });
  });

  describe('Semantic colors', () => {
    it('should map semantic names to correct colors', () => {
      const theme = createTestTheme('ansi16', 'blind');
      expect(theme.error('hello')).toMatchSnapshot();
      expect(theme.warning('hello')).toMatchSnapshot();
      expect(theme.success('hello')).toMatchSnapshot();
      expect(theme.info('hello')).toMatchSnapshot();
      expect(theme.muted('hello')).toMatchSnapshot();
    });
  });

  describe('Complex compositions', () => {
    it('should handle multiple modifiers', () => {
      const theme = createTestTheme('ansi16', 'blind');
      expect(theme.red.bold().underline()('hello')).toMatchSnapshot();
      expect(theme.blue.italic().dim()('hello')).toMatchSnapshot();
    });

    it('should handle fg + bg + modifiers', () => {
      const theme = createTestTheme('ansi16', 'blind');
      expect(theme.white.on(theme.red).bold()('hello')).toMatchSnapshot();
    });
  });
});
