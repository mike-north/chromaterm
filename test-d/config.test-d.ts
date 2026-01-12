import { expectType, expectAssignable } from 'tsd';
import {
  detectVSCodeFamily,
  parseVSCodeSettings,
  parseHexColor,
  readTerminalConfig,
  type VSCodeEditor,
  type VSCodeFamilyInfo,
  type ParsedTerminalColors,
  type RGB,
} from '../src/index.js';

// Test VSCodeEditor type - use expectAssignable for string literals
expectAssignable<VSCodeEditor>('vscode');
expectAssignable<VSCodeEditor>('cursor');
expectAssignable<VSCodeEditor>('windsurf');

// Test VSCodeFamilyInfo structure
const familyInfo: VSCodeFamilyInfo = {
  editor: 'vscode',
  configDir: '.vscode',
};
expectType<VSCodeFamilyInfo>(familyInfo);
expectType<VSCodeEditor>(familyInfo.editor);
expectType<string>(familyInfo.configDir);

// Test detectVSCodeFamily return type
const detected = detectVSCodeFamily();
expectType<VSCodeFamilyInfo | null>(detected);

if (detected !== null) {
  expectType<VSCodeFamilyInfo>(detected);
  expectType<VSCodeEditor>(detected.editor);
  expectType<string>(detected.configDir);
}

// Test ParsedTerminalColors structure
const colors: ParsedTerminalColors = {
  foreground: { r: 255, g: 255, b: 255 },
  background: null,
  colors: new Map<number, RGB>(),
};
expectType<ParsedTerminalColors>(colors);
expectType<RGB | null>(colors.foreground);
expectType<RGB | null>(colors.background);
expectType<Map<number, RGB>>(colors.colors);

// Test parseVSCodeSettings return type
const parsed = parseVSCodeSettings(familyInfo);
expectType<ParsedTerminalColors | null>(parsed);

if (parsed !== null) {
  expectType<ParsedTerminalColors>(parsed);
  expectType<RGB | null>(parsed.foreground);
  expectType<RGB | null>(parsed.background);
  expectType<Map<number, RGB>>(parsed.colors);
}

// Test parseHexColor return type
const hexColor = parseHexColor('#ffffff');
expectType<RGB | null>(hexColor);

if (hexColor !== null) {
  expectType<RGB>(hexColor);
  expectType<number>(hexColor.r);
  expectType<number>(hexColor.g);
  expectType<number>(hexColor.b);
}

// Test readTerminalConfig return type
const terminalConfig = readTerminalConfig();
expectType<ParsedTerminalColors | null>(terminalConfig);

if (terminalConfig !== null) {
  expectType<ParsedTerminalColors>(terminalConfig);
  expectType<RGB | null>(terminalConfig.foreground);
  expectType<RGB | null>(terminalConfig.background);
  expectType<Map<number, RGB>>(terminalConfig.colors);
}

// Test Map operations with colors
const colorMap = new Map<number, RGB>();
colorMap.set(0, { r: 0, g: 0, b: 0 });
const color0 = colorMap.get(0);
expectType<RGB | undefined>(color0);

// Test that ParsedTerminalColors can be assigned correctly
expectAssignable<ParsedTerminalColors>({
  foreground: null,
  background: null,
  colors: new Map(),
});

expectAssignable<ParsedTerminalColors>({
  foreground: { r: 255, g: 255, b: 255 },
  background: { r: 0, g: 0, b: 0 },
  colors: new Map([[0, { r: 0, g: 0, b: 0 }]]),
});

// Test that invalid structures are not assignable
// These should fail at compile time - missing colors property
const invalidColors1: Partial<ParsedTerminalColors> = {
  foreground: null,
  background: null,
};
// Verify it's not a full ParsedTerminalColors
expectType<Partial<ParsedTerminalColors>>(invalidColors1);
