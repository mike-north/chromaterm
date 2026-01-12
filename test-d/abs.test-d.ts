import { expectType } from 'tsd';
import { abs, ansi } from '../src/index.js';
import type { StyleFunction } from '../src/abs/index.js';

// abs should be an object with specific methods
expectType<{
  hex: (color: string) => StyleFunction;
  bgHex: (color: string) => StyleFunction;
  rgb: (r: number, g: number, b: number) => StyleFunction;
  bgRgb: (r: number, g: number, b: number) => StyleFunction;
}>(abs);

// abs.hex should accept a string and return a StyleFunction
expectType<StyleFunction>(abs.hex('#ff6600'));
expectType<string>(abs.hex('#ff6600')('text'));

// abs.bgHex should accept a string and return a StyleFunction
expectType<StyleFunction>(abs.bgHex('#ff6600'));
expectType<string>(abs.bgHex('#ff6600')('text'));

// abs.rgb should accept three numbers and return a StyleFunction
expectType<StyleFunction>(abs.rgb(255, 102, 0));
expectType<string>(abs.rgb(255, 102, 0)('text'));

// abs.bgRgb should accept three numbers and return a StyleFunction
expectType<StyleFunction>(abs.bgRgb(255, 102, 0));
expectType<string>(abs.bgRgb(255, 102, 0)('text'));

// ansi should be chalk (callable and have color methods)
expectType<string>(ansi('text'));
expectType<string>(ansi.red('text'));
expectType<string>(ansi.bold('text'));
expectType<string>(ansi.bold.red('text'));
