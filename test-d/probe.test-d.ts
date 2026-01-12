import { expectType, expectAssignable } from 'tsd';
import type { ProbeOptions, ProbeResult } from '../src/probe/types.js';
import { probeTerminalPalette } from '../src/probe/probe.js';
import type { RGB } from '../src/types.js';

// All fields are optional
expectAssignable<ProbeOptions>({});
expectAssignable<ProbeOptions>({ timeout: 100 });
expectAssignable<ProbeOptions>({ requireTTY: true });
expectAssignable<ProbeOptions>({ timeout: 100, requireTTY: false });

// timeout must be a number
// @ts-expect-error - timeout must be a number
const _invalidTimeout1: ProbeOptions = { timeout: '100' };
// @ts-expect-error - timeout must be a number
const _invalidTimeout2: ProbeOptions = { timeout: true };

// requireTTY must be a boolean
// @ts-expect-error - requireTTY must be a boolean
const _invalidRequireTTY1: ProbeOptions = { requireTTY: 'true' };
// @ts-expect-error - requireTTY must be a boolean
const _invalidRequireTTY2: ProbeOptions = { requireTTY: 1 };

// No extra properties
// @ts-expect-error - no extra properties allowed
const _invalidExtra: ProbeOptions = { timeout: 100, extra: true };

// ProbeResult type tests
declare const result: ProbeResult;

// success is a boolean
expectType<boolean>(result.success);

// colors is a Map from number to RGB
expectType<Map<number, RGB>>(result.colors);

// foreground and background are RGB or null
expectType<RGB | null>(result.foreground);
expectType<RGB | null>(result.background);

// rawResponses is an array of strings
expectType<string[]>(result.rawResponses);

// All fields are required
// @ts-expect-error - all fields required
const _incompleteResult1: ProbeResult = {};
// @ts-expect-error - missing required fields
const _incompleteResult2: ProbeResult = { success: true };
// @ts-expect-error - missing required fields
const _incompleteResult3: ProbeResult = { success: true, colors: new Map() };

// Correct structure is accepted
expectAssignable<ProbeResult>({
  success: true,
  colors: new Map<number, RGB>(),
  foreground: null,
  background: null,
  rawResponses: [],
});

expectAssignable<ProbeResult>({
  success: true,
  colors: new Map([[0, { r: 0, g: 0, b: 0 }]]),
  foreground: { r: 255, g: 255, b: 255 },
  background: { r: 0, g: 0, b: 0 },
  rawResponses: ['response1', 'response2'],
});

// probeTerminalPalette return type
declare const probePromise: ReturnType<typeof probeTerminalPalette>;

// Returns a Promise
expectType<Promise<ProbeResult | null>>(probePromise);

// Can be awaited
declare const probeResult: Awaited<typeof probePromise>;
expectType<ProbeResult | null>(probeResult);

// Function accepts ProbeOptions or undefined
expectType<Promise<ProbeResult | null>>(probeTerminalPalette());
expectType<Promise<ProbeResult | null>>(probeTerminalPalette({}));
expectType<Promise<ProbeResult | null>>(probeTerminalPalette({ timeout: 100 }));
expectType<Promise<ProbeResult | null>>(probeTerminalPalette({ requireTTY: true }));

// Function rejects invalid options
// @ts-expect-error - timeout must be a number
void probeTerminalPalette({ timeout: '100' });
// @ts-expect-error - requireTTY must be a boolean
void probeTerminalPalette({ requireTTY: 'true' });
// @ts-expect-error - no extra properties
void probeTerminalPalette({ extra: true });
