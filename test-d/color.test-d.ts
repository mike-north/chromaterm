import { expectAssignable, expectType } from 'tsd';
import {
  ansi256ToRgb,
  darken,
  desaturate,
  hslToRgb,
  lighten,
  rgbToAnsi16,
  rgbToAnsi256,
  rgbToHsl,
  rotate,
  saturate,
} from '../src/index.js';
import type { AnsiColorIndex, HSL, RGB } from '../src/index.js';

// RGB type tests
const rgb: RGB = { r: 100, g: 150, b: 200 };
expectType<RGB>(rgb);
expectType<number>(rgb.r);
expectType<number>(rgb.g);
expectType<number>(rgb.b);

// HSL type tests
const hsl: HSL = { h: 180, s: 0.5, l: 0.6 };
expectType<HSL>(hsl);
expectType<number>(hsl.h);
expectType<number>(hsl.s);
expectType<number>(hsl.l);

// Conversion function type tests
expectType<HSL>(rgbToHsl(rgb));
expectType<RGB>(hslToRgb(hsl));

// Transform function type tests
expectType<RGB>(saturate(rgb, 0.5));
expectType<RGB>(desaturate(rgb, 0.3));
expectType<RGB>(lighten(rgb, 0.2));
expectType<RGB>(darken(rgb, 0.1));
expectType<RGB>(rotate(rgb, 180));

// Quantize function type tests
expectType<number>(rgbToAnsi256(rgb));
expectType<RGB>(ansi256ToRgb(100));
expectType<AnsiColorIndex>(rgbToAnsi16(rgb));

// AnsiColorIndex type tests
// Valid AnsiColorIndex values are assignable to the type
expectAssignable<AnsiColorIndex>(0);
expectAssignable<AnsiColorIndex>(7);
expectAssignable<AnsiColorIndex>(15);

// Verify the type is what we expect
const ansiIndex = 0 as AnsiColorIndex;
expectType<AnsiColorIndex>(ansiIndex);
