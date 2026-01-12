import { expectType, expectAssignable } from 'tsd';
import { abs } from '../src/index.js';
import type { ChalkInstance } from '../src/abs/index.js';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import chalk = require('chalk');

// abs should be a ChalkInstance (which is chalk.Chalk)
expectAssignable<ChalkInstance>(abs);
expectAssignable<chalk.Chalk>(abs);

// Color methods should return ChalkInstance
expectAssignable<ChalkInstance>(abs.red);
expectAssignable<ChalkInstance>(abs.green);
expectAssignable<ChalkInstance>(abs.blue);
expectAssignable<ChalkInstance>(abs.yellow);
expectAssignable<ChalkInstance>(abs.magenta);
expectAssignable<ChalkInstance>(abs.cyan);
expectAssignable<ChalkInstance>(abs.white);
expectAssignable<ChalkInstance>(abs.black);

// Style methods should return ChalkInstance
expectAssignable<ChalkInstance>(abs.bold);
expectAssignable<ChalkInstance>(abs.dim);
expectAssignable<ChalkInstance>(abs.italic);
expectAssignable<ChalkInstance>(abs.underline);
expectAssignable<ChalkInstance>(abs.strikethrough);

// Background color methods should return ChalkInstance
expectAssignable<ChalkInstance>(abs.bgRed);
expectAssignable<ChalkInstance>(abs.bgGreen);
expectAssignable<ChalkInstance>(abs.bgBlue);

// Calling abs directly should return string
expectType<string>(abs('text'));

// Calling color methods should return string
expectType<string>(abs.red('text'));
expectType<string>(abs.green('text'));
expectType<string>(abs.blue('text'));

// hex and rgb should return ChalkInstance
expectAssignable<ChalkInstance>(abs.hex('#ff0000'));
expectAssignable<ChalkInstance>(abs.rgb(255, 0, 0));
expectAssignable<ChalkInstance>(abs.bgHex('#ff0000'));
expectAssignable<ChalkInstance>(abs.bgRgb(255, 0, 0));

// hex and rgb results should be callable and return string
expectType<string>(abs.hex('#ff0000')('text'));
expectType<string>(abs.rgb(255, 0, 0)('text'));
expectType<string>(abs.bgHex('#ff0000')('text'));
expectType<string>(abs.bgRgb(255, 0, 0)('text'));

// Chaining should work
expectAssignable<ChalkInstance>(abs.bold.red);
expectAssignable<ChalkInstance>(abs.underline.blue.bgWhite);
expectType<string>(abs.bold.red('text'));
expectType<string>(abs.bold.red.underline('text'));

// Complex chaining
expectAssignable<ChalkInstance>(abs.bold.underline.hex('#ff00ff'));
expectType<string>(abs.bold.underline.hex('#ff00ff')('text'));

// Edge case: empty string
expectType<string>(abs.red(''));

// Multiple color calls
expectType<string>(abs.red('red'));
expectType<string>(abs.blue('blue'));

// Combining foreground and background
expectAssignable<ChalkInstance>(abs.red.bgBlue);
expectType<string>(abs.red.bgBlue('text'));

// Style combinations
expectAssignable<ChalkInstance>(abs.bold.italic.underline);
expectType<string>(abs.bold.italic.underline('text'));

// Hex color chaining
expectAssignable<ChalkInstance>(abs.bold.hex('#123456'));
expectType<string>(abs.bold.hex('#123456')('text'));

// RGB color chaining
expectAssignable<ChalkInstance>(abs.italic.rgb(100, 150, 200));
expectType<string>(abs.italic.rgb(100, 150, 200)('text'));

// Background hex with foreground color
expectAssignable<ChalkInstance>(abs.white.bgHex('#000000'));
expectType<string>(abs.white.bgHex('#000000')('text'));

// Background rgb with foreground color
expectAssignable<ChalkInstance>(abs.black.bgRgb(255, 255, 255));
expectType<string>(abs.black.bgRgb(255, 255, 255)('text'));

// Should be assignable to ChalkInstance
expectAssignable<ChalkInstance>(abs);
expectAssignable<ChalkInstance>(abs.red);
expectAssignable<ChalkInstance>(abs.bold);

// Multiple parameters edge case
expectType<string>(abs.red('text', 'more'));

// Template literals edge case
const color = 'red';
expectType<string>(abs[color as 'red']('text'));
