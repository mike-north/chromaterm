// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../types/supports-color.d.ts" />
import { expectType, expectAssignable } from 'tsd';
import {
  detectCapabilities,
  detectColorLevel,
  isColorDisabled,
  isColorForced,
  type ColorLevel,
  type ThemeLevel,
  type Capabilities,
  type DetectOptions,
} from '../src/index.js';

// Test detectCapabilities return type
const caps = detectCapabilities();
expectType<Capabilities>(caps);
expectType<ColorLevel>(caps.color);
expectType<ThemeLevel>(caps.theme);
expectType<boolean>(caps.isTTY);

// Test with options
const capsWithOptions = detectCapabilities({ forceColor: 'truecolor' });
expectType<Capabilities>(capsWithOptions);

const capsWithAllOptions = detectCapabilities({
  forceColor: 'ansi256',
  forceTheme: 'lightdark',
  isTTY: true,
});
expectType<Capabilities>(capsWithAllOptions);

// Test DetectOptions interface
const options: DetectOptions = {
  forceColor: 'truecolor',
  forceTheme: 'palette',
  isTTY: false,
};
expectType<DetectOptions>(options);

// Test partial options
const partialOptions: DetectOptions = {
  forceColor: 'ansi16',
};
expectType<DetectOptions>(partialOptions);

// Test ColorLevel type values are assignable
expectAssignable<ColorLevel>('none');
expectAssignable<ColorLevel>('ansi16');
expectAssignable<ColorLevel>('ansi256');
expectAssignable<ColorLevel>('truecolor');

// Test ThemeLevel type values are assignable
expectAssignable<ThemeLevel>('blind');
expectAssignable<ThemeLevel>('lightdark');
expectAssignable<ThemeLevel>('palette');

// Test Capabilities structure
const capabilities: Capabilities = {
  color: 'truecolor',
  theme: 'blind',
  isTTY: true,
};
expectType<Capabilities>(capabilities);
expectAssignable<Capabilities>(capabilities);

// Test detectColorLevel
const colorLevel = detectColorLevel();
expectType<ColorLevel>(colorLevel);

const colorLevelWithOptions = detectColorLevel({ forceColor: 'ansi256' });
expectType<ColorLevel>(colorLevelWithOptions);

// Test helper functions
const disabled = isColorDisabled();
expectType<boolean>(disabled);

const forced = isColorForced();
expectType<boolean | number>(forced);

// Test that function accepts undefined
const capsUndefined = detectCapabilities(undefined);
expectType<Capabilities>(capsUndefined);

// Test that empty object is valid
const capsEmpty = detectCapabilities({});
expectType<Capabilities>(capsEmpty);
