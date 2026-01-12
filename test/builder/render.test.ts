/* eslint-disable no-control-regex */
import { describe, it, expect } from 'vitest';
import { createT1Theme } from '../../src/theme/theme.js';

describe('Color rendering', () => {
  describe('C0 (no color)', () => {
    const theme = createT1Theme({ forceColor: 'none', isTTY: false });

    it('should return plain text without escape codes', () => {
      const result = theme.red('test');
      expect(result).toBe('test');
      expect(result).not.toMatch(/\x1b\[/);
    });

    it('should strip modifiers', () => {
      const result = theme.red.bold().underline()('test');
      expect(result).toBe('test');
    });

    it('should strip background', () => {
      const result = theme.red.on(theme.blue)('test');
      expect(result).toBe('test');
    });

    it('should strip transforms', () => {
      const result = theme.red.saturate(0.5).lighten(0.2)('test');
      expect(result).toBe('test');
    });
  });

  describe('C1 (ANSI-16)', () => {
    const theme = createT1Theme({ forceColor: 'ansi16', isTTY: true });

    it('should output ANSI escape codes', () => {
      const result = theme.red('test');
      expect(result).toMatch(/\x1b\[/);
      expect(result).toContain('test');
    });

    it('should render standard colors', () => {
      const black = theme.black('test');
      const red = theme.red('test');
      const green = theme.green('test');
      const yellow = theme.yellow('test');
      const blue = theme.blue('test');
      const magenta = theme.magenta('test');
      const cyan = theme.cyan('test');
      const white = theme.white('test');

      // Each should have escape codes and be different
      expect(black).toMatch(/\x1b\[/);
      expect(red).toMatch(/\x1b\[/);
      expect(green).toMatch(/\x1b\[/);
      expect(yellow).toMatch(/\x1b\[/);
      expect(blue).toMatch(/\x1b\[/);
      expect(magenta).toMatch(/\x1b\[/);
      expect(cyan).toMatch(/\x1b\[/);
      expect(white).toMatch(/\x1b\[/);

      // Each should be unique
      const results = [black, red, green, yellow, blue, magenta, cyan, white];
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(8);
    });

    it('should render bright colors', () => {
      const brightBlack = theme.brightBlack('test');
      const brightRed = theme.brightRed('test');
      const brightGreen = theme.brightGreen('test');
      const brightYellow = theme.brightYellow('test');
      const brightBlue = theme.brightBlue('test');
      const brightMagenta = theme.brightMagenta('test');
      const brightCyan = theme.brightCyan('test');
      const brightWhite = theme.brightWhite('test');

      // Each should have escape codes
      expect(brightBlack).toMatch(/\x1b\[/);
      expect(brightRed).toMatch(/\x1b\[/);
      expect(brightGreen).toMatch(/\x1b\[/);
      expect(brightYellow).toMatch(/\x1b\[/);
      expect(brightBlue).toMatch(/\x1b\[/);
      expect(brightMagenta).toMatch(/\x1b\[/);
      expect(brightCyan).toMatch(/\x1b\[/);
      expect(brightWhite).toMatch(/\x1b\[/);

      // Bright colors should differ from standard colors
      expect(brightRed).not.toBe(theme.red('test'));
      expect(brightBlue).not.toBe(theme.blue('test'));
    });

    it('should render bold modifier', () => {
      const result = theme.red.bold()('test');
      expect(result).toMatch(/\x1b\[1m/);
    });

    it('should render dim modifier', () => {
      const result = theme.red.dim()('test');
      expect(result).toMatch(/\x1b\[2m/);
    });

    it('should render italic modifier', () => {
      const result = theme.red.italic()('test');
      expect(result).toMatch(/\x1b\[3m/);
    });

    it('should render underline modifier', () => {
      const result = theme.red.underline()('test');
      expect(result).toMatch(/\x1b\[4m/);
    });

    it('should render inverse modifier', () => {
      const result = theme.red.inverse()('test');
      expect(result).toMatch(/\x1b\[7m/);
    });

    it('should render hidden modifier', () => {
      const result = theme.red.hidden()('test');
      expect(result).toMatch(/\x1b\[8m/);
    });

    it('should render strikethrough modifier', () => {
      const result = theme.red.strikethrough()('test');
      expect(result).toMatch(/\x1b\[9m/);
    });

    it('should render multiple modifiers', () => {
      const result = theme.red.bold().underline()('test');
      expect(result).toMatch(/\x1b\[1m/); // bold
      expect(result).toMatch(/\x1b\[4m/); // underline
    });

    it('should render background color', () => {
      const result = theme.red.on(theme.blue)('test');
      expect(result).toMatch(/\x1b\[/);
      expect(result).toContain('test');
    });

    it('should render foreground and background together', () => {
      const redOnBlue = theme.red.on(theme.blue)('test');
      const greenOnYellow = theme.green.on(theme.yellow)('test');

      expect(redOnBlue).not.toBe(greenOnYellow);
      expect(redOnBlue).toMatch(/\x1b\[/);
      expect(greenOnYellow).toMatch(/\x1b\[/);
    });

    it('should render background with modifiers', () => {
      const result = theme.red.on(theme.blue).bold().underline()('test');
      expect(result).toMatch(/\x1b\[1m/); // bold
      expect(result).toMatch(/\x1b\[4m/); // underline
      expect(result).toContain('test');
    });

    it('should handle semantic color aliases', () => {
      const error = theme.error('test');
      const warning = theme.warning('test');
      const success = theme.success('test');
      const info = theme.info('test');
      const muted = theme.muted('test');

      expect(error).toMatch(/\x1b\[/);
      expect(warning).toMatch(/\x1b\[/);
      expect(success).toMatch(/\x1b\[/);
      expect(info).toMatch(/\x1b\[/);
      expect(muted).toMatch(/\x1b\[/);

      // Semantic colors should match their base colors
      expect(error).toBe(theme.red('test'));
      expect(warning).toBe(theme.yellow('test'));
      expect(success).toBe(theme.green('test'));
      expect(info).toBe(theme.blue('test'));
      expect(muted).toBe(theme.brightBlack('test'));
    });
  });

  describe('edge cases', () => {
    const theme = createT1Theme({ forceColor: 'ansi16', isTTY: true });

    it('should handle empty string', () => {
      const result = theme.red('');
      // Chalk v4 doesn't add escape codes to empty strings
      expect(result).toBe('');
    });

    it('should handle very long strings', () => {
      const longText = 'a'.repeat(10000);
      const result = theme.red(longText);
      expect(result).toContain(longText);
    });

    it('should handle strings with existing ANSI codes', () => {
      const textWithCodes = '\x1b[1mBold\x1b[0m';
      const result = theme.red(textWithCodes);
      expect(result).toContain('Bold');
    });

    it('should handle newlines', () => {
      const result = theme.red('line1\nline2');
      expect(result).toContain('line1');
      expect(result).toContain('line2');
      expect(result).toContain('\n');
    });

    it('should handle tabs', () => {
      const result = theme.red('col1\tcol2');
      expect(result).toContain('col1');
      expect(result).toContain('col2');
      expect(result).toContain('\t');
    });

    it('should handle unicode', () => {
      const result = theme.red('🌈 rainbow');
      expect(result).toContain('🌈');
      expect(result).toContain('rainbow');
    });

    it('should handle null bytes (edge case)', () => {
      const result = theme.red('test\0null');
      expect(result).toContain('test');
    });
  });

  describe('capability detection', () => {
    it('should respect forceColor option', () => {
      const noColor = createT1Theme({ forceColor: 'none' });
      const ansi16 = createT1Theme({ forceColor: 'ansi16' });

      expect(noColor.red('test')).toBe('test');
      expect(ansi16.red('test')).toMatch(/\x1b\[/);
    });

    it('should respect isTTY option', () => {
      const tty = createT1Theme({ forceColor: 'ansi16', isTTY: true });
      const notTty = createT1Theme({ forceColor: 'ansi16', isTTY: false });

      expect(tty.capabilities.isTTY).toBe(true);
      expect(notTty.capabilities.isTTY).toBe(false);
    });

    it('should expose correct capabilities in theme', () => {
      const theme = createT1Theme({ forceColor: 'ansi16', isTTY: true });

      expect(theme.capabilities.color).toBe('ansi16');
      expect(theme.capabilities.isTTY).toBe(true);
      expect(theme.capabilities.theme).toBeDefined();
    });
  });

  describe('performance', () => {
    const theme = createT1Theme({ forceColor: 'ansi16', isTTY: true });

    it('should handle many consecutive calls', () => {
      for (let i = 0; i < 1000; i++) {
        const result = theme.red(`test ${String(i)}`);
        expect(result).toContain(`test ${String(i)}`);
      }
    });

    it('should handle deeply chained operations', () => {
      let color = theme.red;
      for (let i = 0; i < 100; i++) {
        color = color.bold();
      }
      const result = color('test');
      expect(result).toContain('test');
    });
  });
});
