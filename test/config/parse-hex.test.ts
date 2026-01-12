import { describe, it, expect } from 'vitest';
import { parseHexColor } from '../../src/config/index.js';

describe('parseHexColor', () => {
  describe('6-digit hex colors', () => {
    it('should parse 6-digit hex with # prefix', () => {
      expect(parseHexColor('#cd3131')).toEqual({ r: 205, g: 49, b: 49 });
    });

    it('should parse 6-digit hex without # prefix', () => {
      expect(parseHexColor('cd3131')).toEqual({ r: 205, g: 49, b: 49 });
    });

    it('should parse black color', () => {
      expect(parseHexColor('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should parse white color', () => {
      expect(parseHexColor('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should parse various colors', () => {
      expect(parseHexColor('#0dbc79')).toEqual({ r: 13, g: 188, b: 121 });
      expect(parseHexColor('#e5e510')).toEqual({ r: 229, g: 229, b: 16 });
      expect(parseHexColor('#2472c4')).toEqual({ r: 36, g: 114, b: 196 });
    });

    it('should handle uppercase hex', () => {
      expect(parseHexColor('#CD3131')).toEqual({ r: 205, g: 49, b: 49 });
      expect(parseHexColor('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should handle mixed case hex', () => {
      expect(parseHexColor('#Cd3131')).toEqual({ r: 205, g: 49, b: 49 });
      expect(parseHexColor('#fFfFfF')).toEqual({ r: 255, g: 255, b: 255 });
    });
  });

  describe('3-digit hex colors', () => {
    it('should parse 3-digit hex with # prefix', () => {
      expect(parseHexColor('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should parse 3-digit hex without # prefix', () => {
      expect(parseHexColor('fff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should expand 3-digit hex correctly', () => {
      expect(parseHexColor('#f00')).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseHexColor('#0f0')).toEqual({ r: 0, g: 255, b: 0 });
      expect(parseHexColor('#00f')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should expand intermediate values', () => {
      expect(parseHexColor('#abc')).toEqual({ r: 170, g: 187, b: 204 });
      expect(parseHexColor('#123')).toEqual({ r: 17, g: 34, b: 51 });
    });

    it('should handle uppercase 3-digit hex', () => {
      expect(parseHexColor('#FFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(parseHexColor('#ABC')).toEqual({ r: 170, g: 187, b: 204 });
    });
  });

  describe('invalid hex colors', () => {
    it('should return null for non-hex characters', () => {
      expect(parseHexColor('not-a-color')).toBeNull();
      expect(parseHexColor('#gg0000')).toBeNull();
      expect(parseHexColor('#zzzzzz')).toBeNull();
    });

    it('should return null for invalid length', () => {
      expect(parseHexColor('#ff')).toBeNull();
      expect(parseHexColor('#ffff')).toBeNull();
      expect(parseHexColor('#fffff')).toBeNull();
      expect(parseHexColor('#fffffff')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseHexColor('')).toBeNull();
      expect(parseHexColor('#')).toBeNull();
    });

    it('should return null for whitespace', () => {
      expect(parseHexColor(' ')).toBeNull();
      expect(parseHexColor('   ')).toBeNull();
      expect(parseHexColor('# fff')).toBeNull();
    });

    it('should return null for partial hex values', () => {
      expect(parseHexColor('#ff')).toBeNull();
      expect(parseHexColor('#ffff')).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle colors with all same digits', () => {
      expect(parseHexColor('#111111')).toEqual({ r: 17, g: 17, b: 17 });
      expect(parseHexColor('#aaaaaa')).toEqual({ r: 170, g: 170, b: 170 });
    });

    it('should handle grayscale values', () => {
      expect(parseHexColor('#808080')).toEqual({ r: 128, g: 128, b: 128 });
      expect(parseHexColor('#c0c0c0')).toEqual({ r: 192, g: 192, b: 192 });
    });

    it('should handle boundary values', () => {
      expect(parseHexColor('#000001')).toEqual({ r: 0, g: 0, b: 1 });
      expect(parseHexColor('#fffffe')).toEqual({ r: 255, g: 255, b: 254 });
    });
  });
});
