import { describe, it, expect } from 'vitest';
import { calculateLuminance, isLightBackground } from '../../src/appearance/luminance.js';

describe('calculateLuminance', () => {
  // WCAG standard test values
  it('should return 0 for black (0,0,0)', () => {
    const luminance = calculateLuminance({ r: 0, g: 0, b: 0 });
    expect(luminance).toBeCloseTo(0, 5);
  });

  it('should return 1 for white (255,255,255)', () => {
    const luminance = calculateLuminance({ r: 255, g: 255, b: 255 });
    expect(luminance).toBeCloseTo(1, 5);
  });

  it('should return ~0.2126 for pure red (255,0,0)', () => {
    const luminance = calculateLuminance({ r: 255, g: 0, b: 0 });
    expect(luminance).toBeCloseTo(0.2126, 3);
  });

  it('should return ~0.7152 for pure green (0,255,0)', () => {
    const luminance = calculateLuminance({ r: 0, g: 255, b: 0 });
    expect(luminance).toBeCloseTo(0.7152, 3);
  });

  it('should return ~0.0722 for pure blue (0,0,255)', () => {
    const luminance = calculateLuminance({ r: 0, g: 0, b: 255 });
    expect(luminance).toBeCloseTo(0.0722, 3);
  });

  it('should return ~0.5 for middle gray (127,127,127)', () => {
    const luminance = calculateLuminance({ r: 127, g: 127, b: 127 });
    // sRGB to linear is non-linear, so it's not exactly 0.5
    expect(luminance).toBeGreaterThan(0.1);
    expect(luminance).toBeLessThan(0.5);
  });

  it('should handle typical dark theme background (#1e1e1e)', () => {
    const luminance = calculateLuminance({ r: 30, g: 30, b: 30 });
    expect(luminance).toBeLessThan(0.05);
  });

  it('should handle typical light theme background (#f5f5f5)', () => {
    const luminance = calculateLuminance({ r: 245, g: 245, b: 245 });
    expect(luminance).toBeGreaterThan(0.9);
  });
});

describe('isLightBackground', () => {
  it('should return true for white', () => {
    expect(isLightBackground({ r: 255, g: 255, b: 255 })).toBe(true);
  });

  it('should return false for black', () => {
    expect(isLightBackground({ r: 0, g: 0, b: 0 })).toBe(false);
  });

  it('should return false for typical dark theme background (#1e1e1e)', () => {
    expect(isLightBackground({ r: 30, g: 30, b: 30 })).toBe(false);
  });

  it('should return true for typical light theme background (#f5f5f5)', () => {
    expect(isLightBackground({ r: 245, g: 245, b: 245 })).toBe(true);
  });

  it('should return false for dark gray (#333333)', () => {
    expect(isLightBackground({ r: 51, g: 51, b: 51 })).toBe(false);
  });

  it('should return true for light gray (#cccccc)', () => {
    expect(isLightBackground({ r: 204, g: 204, b: 204 })).toBe(true);
  });

  // Edge cases around the threshold (0.179)
  it('should classify colors near the threshold correctly', () => {
    // Very dark gray should be dark
    expect(isLightBackground({ r: 80, g: 80, b: 80 })).toBe(false);
    // Light-ish gray should be light
    expect(isLightBackground({ r: 140, g: 140, b: 140 })).toBe(true);
  });
});
