import { describe, it, expect } from 'vitest';
import {
  basicColorsScenario,
  transformsScenario,
  modifiersScenario,
  backgroundsScenario,
} from '../../smoke/scenarios/index.js';
import { createT1Theme } from '../../src/theme/index.js';

describe('smoke scenarios', () => {
  describe('basicColorsScenario', () => {
    it('should return valid result with name, description, and output', () => {
      const theme = createT1Theme();
      const result = basicColorsScenario(theme);

      expect(result.name).toBe('Basic Colors');
      expect(result.description).toBe('All 16 ANSI colors should match your terminal theme');
      expect(typeof result.output).toBe('string');
      expect(result.output.length).toBeGreaterThan(0);
    });

    it('should output all 16 color names', () => {
      const theme = createT1Theme();
      const result = basicColorsScenario(theme);

      // Check for normal colors
      expect(result.output).toContain('black');
      expect(result.output).toContain('red');
      expect(result.output).toContain('green');
      expect(result.output).toContain('yellow');
      expect(result.output).toContain('blue');
      expect(result.output).toContain('magenta');
      expect(result.output).toContain('cyan');
      expect(result.output).toContain('white');

      // Check for bright colors
      expect(result.output).toContain('brBlack');
      expect(result.output).toContain('brRed');
      expect(result.output).toContain('brGreen');
      expect(result.output).toContain('brYellow');
      expect(result.output).toContain('brBlue');
      expect(result.output).toContain('brMagenta');
      expect(result.output).toContain('brCyan');
      expect(result.output).toContain('brWhite');
    });
  });

  describe('transformsScenario', () => {
    it('should return valid result with name, description, and output', () => {
      const theme = createT1Theme();
      const result = transformsScenario(theme);

      expect(result.name).toBe('Color Transforms');
      expect(result.description).toBe(
        'Transformed colors should show visible changes from base colors'
      );
      expect(typeof result.output).toBe('string');
      expect(result.output.length).toBeGreaterThan(0);
    });

    it('should show all transformation types', () => {
      const theme = createT1Theme();
      const result = transformsScenario(theme);

      expect(result.output).toContain('Saturate');
      expect(result.output).toContain('Lighten');
      expect(result.output).toContain('Darken');
      expect(result.output).toContain('Rotate');
    });
  });

  describe('modifiersScenario', () => {
    it('should return valid result with name, description, and output', () => {
      const theme = createT1Theme();
      const result = modifiersScenario(theme);

      expect(result.name).toBe('Text Modifiers');
      expect(result.description).toBe('Bold, italic, underline, and other text modifiers');
      expect(typeof result.output).toBe('string');
      expect(result.output.length).toBeGreaterThan(0);
    });

    it('should show all modifier types', () => {
      const theme = createT1Theme();
      const result = modifiersScenario(theme);

      expect(result.output).toContain('bold');
      expect(result.output).toContain('dim');
      expect(result.output).toContain('italic');
      expect(result.output).toContain('underline');
      expect(result.output).toContain('strikethrough');
    });
  });

  describe('backgroundsScenario', () => {
    it('should return valid result with name, description, and output', () => {
      const theme = createT1Theme();
      const result = backgroundsScenario(theme);

      expect(result.name).toBe('Background Colors');
      expect(result.description).toBe('Text on colored backgrounds and inverse rendering');
      expect(typeof result.output).toBe('string');
      expect(result.output.length).toBeGreaterThan(0);
    });

    it('should show background and inverse examples', () => {
      const theme = createT1Theme();
      const result = backgroundsScenario(theme);

      expect(result.output).toContain('on red');
      expect(result.output).toContain('on green');
      expect(result.output).toContain('on blue');
      expect(result.output).toContain('on yellow');
      expect(result.output).toContain('inverse');
    });
  });

  describe('scenario structure', () => {
    it('all scenarios should return consistent structure', () => {
      const theme = createT1Theme();
      const scenarios = [
        basicColorsScenario,
        transformsScenario,
        modifiersScenario,
        backgroundsScenario,
      ];

      for (const scenario of scenarios) {
        const result = scenario(theme);

        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('description');
        expect(result).toHaveProperty('output');
        expect(typeof result.name).toBe('string');
        expect(typeof result.description).toBe('string');
        expect(typeof result.output).toBe('string');
      }
    });
  });
});
