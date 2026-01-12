import { expectType, expectAssignable } from 'tsd';
import { createT1Theme } from '../src/theme/theme.js';
import type { Color } from '../src/builder/builder.js';
import type { Theme } from '../src/theme/types.js';

const theme = createT1Theme();

// Theme type tests
expectType<Theme>(theme);
expectAssignable<Theme>(theme);

// Color type tests - all theme properties should be Color
expectType<Color>(theme.red);
expectType<Color>(theme.green);
expectType<Color>(theme.blue);
expectType<Color>(theme.yellow);
expectType<Color>(theme.magenta);
expectType<Color>(theme.cyan);
expectType<Color>(theme.white);
expectType<Color>(theme.black);

expectType<Color>(theme.brightRed);
expectType<Color>(theme.brightGreen);
expectType<Color>(theme.brightBlue);
expectType<Color>(theme.brightYellow);
expectType<Color>(theme.brightMagenta);
expectType<Color>(theme.brightCyan);
expectType<Color>(theme.brightWhite);
expectType<Color>(theme.brightBlack);

expectType<Color>(theme.error);
expectType<Color>(theme.warning);
expectType<Color>(theme.success);
expectType<Color>(theme.info);
expectType<Color>(theme.muted);

expectType<Color>(theme.foreground);
expectType<Color>(theme.background);

// Color is callable with string
expectType<string>(theme.red('text'));
expectType<string>(theme.green('text'));

// Transform methods return Color
expectType<Color>(theme.red.saturate(0.5));
expectType<Color>(theme.red.desaturate(0.5));
expectType<Color>(theme.red.lighten(0.2));
expectType<Color>(theme.red.darken(0.2));
expectType<Color>(theme.red.rotate(180));

// Modifier methods return Color
expectType<Color>(theme.red.bold());
expectType<Color>(theme.red.dim());
expectType<Color>(theme.red.italic());
expectType<Color>(theme.red.underline());
expectType<Color>(theme.red.strikethrough());
expectType<Color>(theme.red.hidden());

// Composition methods return Color
expectType<Color>(theme.red.on(theme.blue));
expectType<Color>(theme.red.inverse());

// Introspection properties
expectType<number>(theme.red.ansi);
expectType<[number, number, number] | null>(theme.red.rgb);

// Chaining works correctly
expectType<Color>(theme.red.saturate(0.5).lighten(0.2));
expectType<Color>(theme.red.bold().underline());
expectType<Color>(theme.red.bold().underline().saturate(0.5));
expectType<Color>(theme.red.on(theme.blue).bold());
expectType<string>(theme.red.on(theme.blue).bold()('text'));

// Complex chaining
expectType<string>(
  theme.red.saturate(0.5).lighten(0.2).rotate(30).bold().underline().on(theme.blue)('text')
);

// Capabilities are accessible
expectType<'none' | 'ansi16' | 'ansi256' | 'truecolor'>(theme.capabilities.color);
expectType<boolean>(theme.capabilities.isTTY);

// Color cannot be called with wrong types
// @ts-expect-error - should only accept string
theme.red(123);

// @ts-expect-error - should only accept string
theme.red(true);

// @ts-expect-error - should only accept string
theme.red({ text: 'hello' });

// Transform methods require number argument
// @ts-expect-error - requires argument
theme.red.saturate();

// @ts-expect-error - requires number
theme.red.saturate('invalid');

// @ts-expect-error - requires argument
theme.red.lighten();

// @ts-expect-error - requires number
theme.red.rotate('invalid');

// Composition methods require Color argument
// @ts-expect-error - requires Color argument
theme.red.on();

// @ts-expect-error - requires Color
theme.red.on('blue');

// @ts-expect-error - requires Color
theme.red.on(123);

// Modifier methods don't accept arguments
// @ts-expect-error - doesn't accept arguments
theme.red.bold('invalid');

// @ts-expect-error - doesn't accept arguments
theme.red.underline(true);

// Introspection properties are readonly
// @ts-expect-error - ansi is readonly
theme.red.ansi = 5;

// @ts-expect-error - rgb is readonly
theme.red.rgb = [255, 0, 0];

// Theme capabilities are readonly
// @ts-expect-error - capabilities is readonly
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
theme.capabilities = {} as any;
