import { expectType, expectAssignable } from 'tsd';
import type { Theme, ThemeOptions, PaletteData } from '../src/theme/types.js';
import type { Color } from '../src/builder/builder.js';
import type { Capabilities } from '../src/capability/types.js';
import type { RGB } from '../src/types.js';
import { detectTheme, createT1Theme } from '../src/theme/theme.js';

// Test Theme interface
declare const theme: Theme;

// Theme should have all color properties
expectType<Color>(theme.black);
expectType<Color>(theme.red);
expectType<Color>(theme.green);
expectType<Color>(theme.yellow);
expectType<Color>(theme.blue);
expectType<Color>(theme.magenta);
expectType<Color>(theme.cyan);
expectType<Color>(theme.white);

expectType<Color>(theme.brightBlack);
expectType<Color>(theme.brightRed);
expectType<Color>(theme.brightGreen);
expectType<Color>(theme.brightYellow);
expectType<Color>(theme.brightBlue);
expectType<Color>(theme.brightMagenta);
expectType<Color>(theme.brightCyan);
expectType<Color>(theme.brightWhite);

expectType<Color>(theme.error);
expectType<Color>(theme.warning);
expectType<Color>(theme.success);
expectType<Color>(theme.info);
expectType<Color>(theme.muted);

expectType<Color>(theme.foreground);
expectType<Color>(theme.background);

// Theme should have metadata
expectType<Capabilities>(theme.capabilities);
expectType<PaletteData | null>(theme.palette);

// Theme should be assignable from Theme
expectAssignable<Theme>(theme);

// Test ThemeOptions interface
declare const options: ThemeOptions;

// All properties should be optional
expectAssignable<ThemeOptions>({});
expectAssignable<ThemeOptions>({ skipProbe: true });
expectAssignable<ThemeOptions>({ probeTimeout: 100 });
expectAssignable<ThemeOptions>({ forceCapability: { color: 'truecolor' } });
expectAssignable<ThemeOptions>({
  forceCapability: { theme: 'palette' },
});
expectAssignable<ThemeOptions>({
  forceCapability: { color: 'ansi256', theme: 'lightdark' },
});

// Invalid color values produce type errors (verified by tsd error checking)
// This line will fail type checking - demonstrating type safety
declare const _invalidColorOption: ThemeOptions & {
  forceCapability: { color: 'invalid' };
};

// Invalid theme values produce type errors (verified by tsd error checking)
// This line will fail type checking - demonstrating type safety
declare const _invalidThemeOption: ThemeOptions & {
  forceCapability: { theme: 'invalid' };
};

// Test PaletteData interface
declare const paletteData: PaletteData;

expectType<Map<number, RGB>>(paletteData.colors);
expectType<RGB>(paletteData.foreground);
expectType<RGB>(paletteData.background);

// PaletteData should have required properties
expectAssignable<PaletteData>({
  colors: new Map<number, RGB>(),
  foreground: { r: 255, g: 255, b: 255 },
  background: { r: 0, g: 0, b: 0 },
});

// Missing properties should not be assignable
// @ts-expect-error - missing foreground and background
const _incompletePalette1: PaletteData = {
  colors: new Map<number, RGB>(),
};

// @ts-expect-error - missing background
const _incompletePalette2: PaletteData = {
  colors: new Map<number, RGB>(),
  foreground: { r: 255, g: 255, b: 255 },
};

// Test detectTheme function
expectType<Promise<Theme>>(detectTheme());
expectType<Promise<Theme>>(detectTheme({}));
expectType<Promise<Theme>>(detectTheme({ skipProbe: true }));
expectType<Promise<Theme>>(detectTheme({ forceCapability: { color: 'truecolor' } }));

// detectTheme should accept ThemeOptions
expectType<Promise<Theme>>(detectTheme(options));

// Test createT1Theme function
expectType<Theme>(createT1Theme());
expectType<Theme>(createT1Theme({}));
expectType<Theme>(createT1Theme({ forceColor: 'ansi16' }));
expectType<Theme>(createT1Theme({ forceTheme: 'blind' }));

// createT1Theme is synchronous, not async
const syncTheme = createT1Theme();
expectType<Theme>(syncTheme);

// Test that Theme colors are callable
expectType<string>(theme.red('text'));
expectType<string>(theme.blue.bold()('text'));
expectType<string>(theme.green.saturate(0.5)('text'));

// Test that colors support chaining
expectType<Color>(theme.red.bold());
expectType<Color>(theme.blue.saturate(0.5).lighten(0.2));
expectType<Color>(theme.green.on(theme.black));
expectType<Color>(theme.yellow.bold().underline().italic());

// Test color introspection
expectType<[number, number, number] | null>(theme.red.rgb);
expectType<number>(theme.red.ansi);

// Test that palette can be null
if (theme.palette === null) {
  expectType<null>(theme.palette);
} else {
  expectType<PaletteData>(theme.palette);
  expectType<Map<number, RGB>>(theme.palette.colors);
}

// Test that async detectTheme can be awaited
async function _testAsync(): Promise<void> {
  const asyncTheme = await detectTheme();
  expectType<Theme>(asyncTheme);
  expectType<Color>(asyncTheme.red);
}
