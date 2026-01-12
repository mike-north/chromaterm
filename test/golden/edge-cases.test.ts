import { describe, it, expect } from 'vitest';
import { createColor } from '../../src/builder/builder.js';
import type { Capabilities } from '../../src/capability/types.js';
import type { Theme } from '../../src/theme/types.js';
import type { RGB } from '../../src/types.js';

/**
 * Helper to create theme with specific capabilities
 */
function createTestTheme(
  colorLevel: 'none' | 'ansi16' | 'ansi256' | 'truecolor',
  themeLevel: 'blind' | 'palette'
): Theme {
  const capabilities: Capabilities = { color: colorLevel, theme: themeLevel, isTTY: true };

  const fallbackColors: Record<number, RGB> = {
    0: { r: 0, g: 0, b: 0 },
    1: { r: 205, g: 49, b: 49 },
    2: { r: 13, g: 188, b: 121 },
    3: { r: 229, g: 229, b: 16 },
    4: { r: 36, g: 114, b: 200 },
    5: { r: 188, g: 63, b: 188 },
    6: { r: 17, g: 168, b: 205 },
    7: { r: 229, g: 229, b: 229 },
    8: { r: 102, g: 102, b: 102 },
    9: { r: 241, g: 76, b: 76 },
    10: { r: 35, g: 209, b: 139 },
    11: { r: 245, g: 245, b: 67 },
    12: { r: 59, g: 142, b: 234 },
    13: { r: 214, g: 112, b: 214 },
    14: { r: 41, g: 184, b: 219 },
    15: { r: 255, g: 255, b: 255 },
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

describe('Edge Cases', () => {
  it('should handle empty string', () => {
    const theme = createTestTheme('ansi16', 'blind');
    expect(theme.red('')).toMatchSnapshot();
  });

  it('should handle string with existing ANSI codes', () => {
    const theme = createTestTheme('ansi16', 'blind');
    expect(theme.red('\x1b[32mgreen\x1b[0m')).toMatchSnapshot();
  });

  it('should handle unicode characters', () => {
    const theme = createTestTheme('ansi16', 'blind');
    expect(theme.red('你好世界')).toMatchSnapshot();
    expect(theme.red('🎨 colors')).toMatchSnapshot();
  });

  it('should handle newlines', () => {
    const theme = createTestTheme('ansi16', 'blind');
    expect(theme.red('line1\nline2')).toMatchSnapshot();
  });

  it('should handle very long strings', () => {
    const theme = createTestTheme('ansi16', 'blind');
    const long = 'x'.repeat(1000);
    const output = theme.red(long);
    // Should wrap the entire string, not repeat escapes
    expect(output.split('\x1b').length).toBeLessThan(10);
  });

  it('should handle tabs and special characters', () => {
    const theme = createTestTheme('ansi16', 'blind');
    expect(theme.red('hello\tworld')).toMatchSnapshot();
    expect(theme.red('test\r\nwindows')).toMatchSnapshot();
  });

  it('should handle zero-width characters', () => {
    const theme = createTestTheme('ansi16', 'blind');
    expect(theme.red('hello\u200Bworld')).toMatchSnapshot();
  });

  it('should handle multiple spaces', () => {
    const theme = createTestTheme('ansi16', 'blind');
    expect(theme.red('hello     world')).toMatchSnapshot();
  });

  it('should handle strings with only whitespace', () => {
    const theme = createTestTheme('ansi16', 'blind');
    expect(theme.red('   ')).toMatchSnapshot();
    expect(theme.red('\n\n\n')).toMatchSnapshot();
  });

  it('should handle special escape sequences', () => {
    const theme = createTestTheme('ansi16', 'blind');
    // Test with literal backslash followed by letters (not actual escape)
    expect(theme.red('\\x1b[31m')).toMatchSnapshot();
  });

  it('should handle mixed content', () => {
    const theme = createTestTheme('ansi16', 'blind');
    expect(theme.red('Hello 世界 🌍 123 \t\n')).toMatchSnapshot();
  });
});
