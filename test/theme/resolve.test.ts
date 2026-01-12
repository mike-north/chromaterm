/* eslint-disable no-control-regex */
import { describe, it, expect } from 'vitest';
import { createColor } from '../../src/builder/builder.js';
import { renderColor } from '../../src/builder/render.js';
import type { ColorState } from '../../src/builder/types.js';
import type { RGB } from '../../src/types.js';

describe('T3 color resolution', () => {
  describe('Transform application', () => {
    it('should apply saturate transform to RGB color', () => {
      const baseRgb: RGB = { r: 205, g: 49, b: 49 }; // Red

      const state: ColorState = {
        ansiIndex: 1,
        baseRgb,
        transforms: [{ type: 'saturate', amount: 0.2 }],
        modifiers: {},
        background: null,
        capabilities: { color: 'truecolor', theme: 'palette', isTTY: true },
      };

      const result = renderColor(state, 'test');
      expect(result).toContain('test');
      // Result should contain ANSI escape codes
      expect(result).toMatch(/\u001b\[38;2;\d+;\d+;\d+m/);
    });

    it('should apply desaturate transform to RGB color', () => {
      const baseRgb: RGB = { r: 205, g: 49, b: 49 }; // Red

      const state: ColorState = {
        ansiIndex: 1,
        baseRgb,
        transforms: [{ type: 'desaturate', amount: 0.3 }],
        modifiers: {},
        background: null,
        capabilities: { color: 'truecolor', theme: 'palette', isTTY: true },
      };

      const result = renderColor(state, 'test');
      expect(result).toContain('test');
      expect(result).toMatch(/\u001b\[38;2;\d+;\d+;\d+m/);
    });

    it('should apply lighten transform to RGB color', () => {
      const baseRgb: RGB = { r: 205, g: 49, b: 49 }; // Red

      const state: ColorState = {
        ansiIndex: 1,
        baseRgb,
        transforms: [{ type: 'lighten', amount: 0.2 }],
        modifiers: {},
        background: null,
        capabilities: { color: 'truecolor', theme: 'palette', isTTY: true },
      };

      const result = renderColor(state, 'test');
      expect(result).toContain('test');
      expect(result).toMatch(/\u001b\[38;2;\d+;\d+;\d+m/);
    });

    it('should apply darken transform to RGB color', () => {
      const baseRgb: RGB = { r: 205, g: 49, b: 49 }; // Red

      const state: ColorState = {
        ansiIndex: 1,
        baseRgb,
        transforms: [{ type: 'darken', amount: 0.2 }],
        modifiers: {},
        background: null,
        capabilities: { color: 'truecolor', theme: 'palette', isTTY: true },
      };

      const result = renderColor(state, 'test');
      expect(result).toContain('test');
      expect(result).toMatch(/\u001b\[38;2;\d+;\d+;\d+m/);
    });

    it('should apply rotate transform to RGB color', () => {
      const baseRgb: RGB = { r: 205, g: 49, b: 49 }; // Red

      const state: ColorState = {
        ansiIndex: 1,
        baseRgb,
        transforms: [{ type: 'rotate', amount: 120 }],
        modifiers: {},
        background: null,
        capabilities: { color: 'truecolor', theme: 'palette', isTTY: true },
      };

      const result = renderColor(state, 'test');
      expect(result).toContain('test');
      expect(result).toMatch(/\u001b\[38;2;\d+;\d+;\d+m/);
    });

    it('should apply multiple transforms in order', () => {
      const baseRgb: RGB = { r: 205, g: 49, b: 49 }; // Red

      const state: ColorState = {
        ansiIndex: 1,
        baseRgb,
        transforms: [
          { type: 'saturate', amount: 0.2 },
          { type: 'lighten', amount: 0.1 },
          { type: 'rotate', amount: 30 },
        ],
        modifiers: {},
        background: null,
        capabilities: { color: 'truecolor', theme: 'palette', isTTY: true },
      };

      const result = renderColor(state, 'test');
      expect(result).toContain('test');
      expect(result).toMatch(/\u001b\[38;2;\d+;\d+;\d+m/);
    });

    it('should not apply transforms when baseRgb is null (T1)', () => {
      const state: ColorState = {
        ansiIndex: 1,
        baseRgb: null,
        transforms: [{ type: 'saturate', amount: 0.5 }],
        modifiers: {},
        background: null,
        capabilities: { color: 'ansi16', theme: 'blind', isTTY: true },
      };

      const result = renderColor(state, 'test');
      expect(result).toContain('test');
      // Should use ANSI-16 color codes, not truecolor
      expect(result).not.toMatch(/\u001b\[38;2;\d+;\d+;\d+m/);
    });
  });

  describe('C-level rendering', () => {
    it('should render truecolor when C=truecolor and T3', () => {
      const baseRgb: RGB = { r: 205, g: 49, b: 49 };

      const state: ColorState = {
        ansiIndex: 1,
        baseRgb,
        transforms: [],
        modifiers: {},
        background: null,
        capabilities: { color: 'truecolor', theme: 'palette', isTTY: true },
      };

      const result = renderColor(state, 'test');
      // Should use truecolor escape code (38;2;r;g;b)
      expect(result).toMatch(/\u001b\[38;2;\d+;\d+;\d+m/);
    });

    it('should render ANSI-256 when C=ansi256 and T3', () => {
      const baseRgb: RGB = { r: 205, g: 49, b: 49 };

      const state: ColorState = {
        ansiIndex: 1,
        baseRgb,
        transforms: [],
        modifiers: {},
        background: null,
        capabilities: { color: 'ansi256', theme: 'palette', isTTY: true },
      };

      const result = renderColor(state, 'test');
      // Should use ANSI-256 escape code (38;5;n)
      expect(result).toMatch(/\u001b\[38;5;\d+m/);
    });

    it('should render ANSI-16 when C=ansi16 even with baseRgb', () => {
      const baseRgb: RGB = { r: 205, g: 49, b: 49 };

      const state: ColorState = {
        ansiIndex: 1,
        baseRgb,
        transforms: [],
        modifiers: {},
        background: null,
        capabilities: { color: 'ansi16', theme: 'palette', isTTY: true },
      };

      const result = renderColor(state, 'test');
      // Should use ANSI-16 color codes
      expect(result).not.toMatch(/\u001b\[38;2;\d+;\d+;\d+m/);
      expect(result).not.toMatch(/\u001b\[38;5;\d+m/);
    });

    it('should return plain text when C=none', () => {
      const baseRgb: RGB = { r: 205, g: 49, b: 49 };

      const state: ColorState = {
        ansiIndex: 1,
        baseRgb,
        transforms: [],
        modifiers: {},
        background: null,
        capabilities: { color: 'none', theme: 'palette', isTTY: true },
      };

      const result = renderColor(state, 'test');
      expect(result).toBe('test');
    });
  });

  describe('Background color resolution', () => {
    it('should apply transforms to background color', () => {
      const fgRgb: RGB = { r: 205, g: 49, b: 49 };
      const bgRgb: RGB = { r: 0, g: 0, b: 0 };

      const bgState: ColorState = {
        ansiIndex: 0,
        baseRgb: bgRgb,
        transforms: [{ type: 'lighten', amount: 0.2 }],
        modifiers: {},
        background: null,
        capabilities: { color: 'truecolor', theme: 'palette', isTTY: true },
      };

      const state: ColorState = {
        ansiIndex: 1,
        baseRgb: fgRgb,
        transforms: [],
        modifiers: {},
        background: bgState,
        capabilities: { color: 'truecolor', theme: 'palette', isTTY: true },
      };

      const result = renderColor(state, 'test');
      expect(result).toContain('test');
      // Should have both foreground and background truecolor codes
      expect(result).toMatch(/\u001b\[38;2;\d+;\d+;\d+m/);
      expect(result).toMatch(/\u001b\[48;2;\d+;\d+;\d+m/);
    });

    it('should render background with ANSI-256 when C=ansi256', () => {
      const fgRgb: RGB = { r: 205, g: 49, b: 49 };
      const bgRgb: RGB = { r: 0, g: 0, b: 0 };

      const bgState: ColorState = {
        ansiIndex: 0,
        baseRgb: bgRgb,
        transforms: [],
        modifiers: {},
        background: null,
        capabilities: { color: 'ansi256', theme: 'palette', isTTY: true },
      };

      const state: ColorState = {
        ansiIndex: 1,
        baseRgb: fgRgb,
        transforms: [],
        modifiers: {},
        background: bgState,
        capabilities: { color: 'ansi256', theme: 'palette', isTTY: true },
      };

      const result = renderColor(state, 'test');
      // Should have both foreground and background ANSI-256 codes
      expect(result).toMatch(/\u001b\[38;5;\d+m/);
      expect(result).toMatch(/\u001b\[48;5;\d+m/);
    });
  });

  describe('Modifiers with transforms', () => {
    it('should apply modifiers after color transforms', () => {
      const baseRgb: RGB = { r: 205, g: 49, b: 49 };

      const state: ColorState = {
        ansiIndex: 1,
        baseRgb,
        transforms: [{ type: 'saturate', amount: 0.3 }],
        modifiers: { bold: true },
        background: null,
        capabilities: { color: 'truecolor', theme: 'palette', isTTY: true },
      };

      const result = renderColor(state, 'test');
      expect(result).toContain('test');
      // Should have both color and bold codes
      expect(result).toMatch(/\u001b\[38;2;\d+;\d+;\d+m/);
      expect(result).toMatch(/\u001b\[1m/); // Bold code
    });

    it('should apply multiple modifiers with transforms', () => {
      const baseRgb: RGB = { r: 205, g: 49, b: 49 };

      const state: ColorState = {
        ansiIndex: 1,
        baseRgb,
        transforms: [{ type: 'lighten', amount: 0.2 }],
        modifiers: { bold: true, underline: true, italic: true },
        background: null,
        capabilities: { color: 'truecolor', theme: 'palette', isTTY: true },
      };

      const result = renderColor(state, 'test');
      expect(result).toContain('test');
      expect(result).toMatch(/\u001b\[38;2;\d+;\d+;\d+m/);
    });
  });

  describe('Color builder integration', () => {
    it('should accumulate transforms through builder methods', () => {
      const baseState: ColorState = {
        ansiIndex: 1,
        baseRgb: { r: 205, g: 49, b: 49 },
        transforms: [],
        modifiers: {},
        background: null,
        capabilities: { color: 'truecolor', theme: 'palette', isTTY: true },
      };

      const color = createColor(baseState);
      const transformed = color.saturate(0.2).lighten(0.1);

      const result = transformed('test');
      expect(result).toContain('test');
      expect(result).toMatch(/\u001b\[38;2;\d+;\d+;\d+m/);
    });
  });
});
