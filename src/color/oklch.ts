import type { RGB } from '../types.js';
import { clamp } from './utils.js';

/**
 * OKLCH color representation (OKLab cylindrical coordinates).
 *
 * This is an internal type used for color space conversions.
 * OKLCH provides perceptually uniform color interpolation.
 *
 * @internal
 */
interface OKLCH {
  /** Lightness (0-1) */
  l: number;
  /** Chroma (0-0.4, typically) */
  c: number;
  /** Hue in degrees (0-360), or undefined for achromatic colors */
  h: number | undefined;
}

/**
 * Converts RGB to linear RGB (removes gamma correction).
 * @internal
 */
function rgbToLinear(val: number): number {
  const v = val / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * Converts linear RGB to gamma-corrected RGB.
 * @internal
 */
function linearToRgb(val: number): number {
  const v = val <= 0.0031308 ? 12.92 * val : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
  return clamp(Math.round(v * 255), 0, 255);
}

/**
 * Converts RGB to OKLab color space.
 * @internal
 */
function rgbToOklab(rgb: RGB): { l: number; a: number; b: number } {
  // Convert to linear RGB
  const lr = rgbToLinear(rgb.r);
  const lg = rgbToLinear(rgb.g);
  const lb = rgbToLinear(rgb.b);

  // Transform to LMS cone response
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  // Apply cube root
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  // Transform to OKLab
  return {
    l: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

/**
 * Converts OKLab to RGB color space.
 * @internal
 */
function oklabToRgb(lab: { l: number; a: number; b: number }): RGB {
  // Transform from OKLab to LMS
  const l_ = lab.l + 0.3963377774 * lab.a + 0.2158037573 * lab.b;
  const m_ = lab.l - 0.1055613458 * lab.a - 0.0638541728 * lab.b;
  const s_ = lab.l - 0.0894841775 * lab.a - 1.291485548 * lab.b;

  // Cube the values
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // Transform to linear RGB
  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  // Convert to gamma-corrected RGB
  return {
    r: linearToRgb(lr),
    g: linearToRgb(lg),
    b: linearToRgb(lb),
  };
}

/**
 * Converts RGB to OKLCH color space.
 *
 * OKLCH is a perceptually uniform color space based on OKLab,
 * using cylindrical coordinates (Lightness, Chroma, Hue).
 *
 * @param rgb - RGB color to convert
 * @returns OKLCH color representation
 *
 * @internal
 */
export function rgbToOklch(rgb: RGB): OKLCH {
  const lab = rgbToOklab(rgb);

  // Convert to cylindrical coordinates
  const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b);

  // For achromatic colors (very low chroma), hue is undefined
  let h: number | undefined;
  if (c > 0.0001) {
    // Calculate hue in radians, then convert to degrees
    const hueRad = Math.atan2(lab.b, lab.a);
    h = (hueRad * 180) / Math.PI;
    // Normalize to 0-360
    if (h < 0) {
      h += 360;
    }
  }

  return { l: lab.l, c, h };
}

/**
 * Converts OKLCH to RGB color space.
 *
 * @param oklch - OKLCH color to convert
 * @returns RGB color representation
 *
 * @internal
 */
export function oklchToRgb(oklch: OKLCH): RGB {
  // Handle achromatic colors
  if (oklch.c < 0.0001 || oklch.h === undefined) {
    return oklabToRgb({ l: oklch.l, a: 0, b: 0 });
  }

  // Convert from cylindrical to Cartesian coordinates
  const hueRad = (oklch.h * Math.PI) / 180;
  const a = oklch.c * Math.cos(hueRad);
  const b = oklch.c * Math.sin(hueRad);

  return oklabToRgb({ l: oklch.l, a, b });
}
