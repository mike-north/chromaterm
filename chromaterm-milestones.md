# ChromaTerm Implementation Milestones

## Overview

This document defines the implementation plan for ChromaTerm, broken into discrete milestones. Each milestone produces working, testable code that can be shipped independently.

**Target**: v0.1.0 release encompasses M0 through M9.

### Feasibility Status ✅

OSC palette probing was validated in January 2025 across 8 macOS terminals:
- **87.5% achieved T3** (full palette probing)
- **100% achieved at least T2** (fg/bg detection)
- **Zero critical issues** (no stdin corruption, hangs, or wrong data)
- **tmux pass-through works** without special configuration

**Conclusion**: Proceed with implementation. See spec for full test results.

### Pending Platform Tests

Before v1.0 release, the following platforms require validation:
- Windows Terminal (WSL2)
- Linux desktop terminals (GNOME Terminal, Konsole, xterm, xfce4-terminal, Tilix)

These are expected to work (xterm is the reference implementation) but must be empirically validated.

---

## M0: Project Scaffolding

**Goal**: Establish project infrastructure and development workflow.

### Deliverables

1. **Repository setup**
   - Initialize npm package (`chromaterm`)
   - TypeScript configuration (ES2022 target, ESM output)
   - Strict TypeScript settings
   - Build script (tsc)

2. **Testing infrastructure**
   - Install and configure `@ark/attest`
   - Basic test runner script
   - Example passing test

3. **Development tooling**
   - ESLint configuration
   - Prettier configuration (or EditorConfig)
   - `.gitignore`

4. **Documentation**
   - `README.md` with basic description and "coming soon" note
   - `LICENSE` (MIT or your preference)

### Acceptance Criteria

- [ ] `npm run build` produces working ESM output
- [ ] `npm test` runs attest-it tests successfully
- [ ] Package can be imported in a test project

### Estimated Effort

~2 hours

---

## M1: Color Math Primitives

**Goal**: Implement pure color transformation functions with zero terminal awareness.

### Deliverables

1. **Color space conversions**
   ```typescript
   // src/colorspace.ts
   function rgbToHsl(r: number, g: number, b: number): [number, number, number];
   function hslToRgb(h: number, s: number, l: number): [number, number, number];
   ```

2. **Transformation functions**
   ```typescript
   // src/transform.ts
   function saturate(hsl: HSL, amount: number): HSL;
   function lighten(hsl: HSL, amount: number): HSL;
   function rotate(hsl: HSL, degrees: number): HSL;
   ```

3. **ANSI-256 quantization**
   ```typescript
   // src/quantize.ts
   function quantizeToAnsi256(r: number, g: number, b: number): number;
   function ansi256ToRgb(index: number): [number, number, number];
   ```

4. **Fallback palette definition**
   ```typescript
   // src/palette.ts
   const FALLBACK_PALETTE: Record<AnsiColorName, RGB>;
   ```

### Test Coverage

- RGB ↔ HSL round-trip (sample colors)
- Saturation: 0 produces gray, 1 is max
- Lightness: 0 produces black, 1 produces white
- Rotation: 180° produces complement
- Quantization: exact ANSI-256 colors map to themselves
- Quantization: intermediate values map to nearest neighbor

### Acceptance Criteria

- [ ] All color transformations are pure functions
- [ ] All transformations have >90% test coverage
- [ ] Edge cases (clipping, wrap-around) handled correctly

### Estimated Effort

~4 hours

---

## M2: Capability Detection

**Goal**: Detect terminal color output capability (C-level) using existing ecosystem tools.

### Deliverables

1. **Wrap `supports-color`**
   ```typescript
   // src/detect.ts
   type ColorLevel = 'none' | 'ansi16' | 'ansi256' | 'truecolor';
   function detectColorLevel(): ColorLevel;
   ```

2. **Handle environment overrides**
   - `NO_COLOR` → none
   - `FORCE_COLOR` → respect level
   - `COLORTERM=truecolor` → truecolor
   - Non-TTY → none (unless forced)

3. **Export capability info**
   ```typescript
   interface Capabilities {
     color: ColorLevel;
     theme: ThemeLevel; // placeholder 'blind' for now
   }
   ```

### Dependencies

- Add `supports-color` as runtime dependency (or inline minimal implementation)

### Test Coverage

- Mock `process.stdout.isTTY` and environment variables
- Verify each environment combination produces correct level

### Acceptance Criteria

- [ ] `detectColorLevel()` returns correct value for all common cases
- [ ] `NO_COLOR` is respected
- [ ] Works correctly in non-TTY environments

### Estimated Effort

~2 hours

---

## M3: T1 Baseline (No Theme Inference)

**Goal**: Implement the Color builder API with ANSI-16 fallback semantics.

### Deliverables

1. **Color builder class**
   ```typescript
   // src/color.ts
   class Color {
     // HSV transforms
     saturate(amount: number): Color;
     desaturate(amount: number): Color;
     lighten(amount: number): Color;
     darken(amount: number): Color;
     rotate(degrees: number): Color;
     
     // Composition
     on(background: Color): Color;
     inverse(): Color;
     
     // Text modifiers (ANSI SGR)
     bold(): Color;
     dim(): Color;
     italic(): Color;
     underline(): Color;
     strikethrough(): Color;
     hidden(): Color;
     
     // Callable - returns styled string
     (text: string): string;
     
     // Introspection
     get rgb(): RGB | null;
     get ansi(): number;
   }
   ```

2. **Theme object (T1 only)**
   ```typescript
   // src/theme.ts
   interface Theme {
     black: Color;
     red: Color;
     // ... all 16 ANSI colors
     error: Color;    // alias → red
     warning: Color;  // alias → yellow
     success: Color;  // alias → green
     info: Color;     // alias → blue
     muted: Color;    // alias → brightBlack
     foreground: Color;
     background: Color;
     capabilities: Capabilities;
     palette: null;   // T1 has no palette
   }
   ```

3. **Synchronous theme factory for T1**
   ```typescript
   function createT1Theme(): Theme;
   ```

4. **Escape sequence generation**
   - Integrate `chalk` for actual escape codes
   - T1 mode: transformations are no-ops, output base ANSI

### Test Coverage

- Color builder produces valid ANSI-16 escape sequences
- Transformations on T1 return same base color
- `on()` produces correct fg+bg combination
- `inverse()` swaps foreground and background
- Text modifiers (`bold`, `italic`, etc.) produce correct SGR codes
- Modifiers chain correctly with color transforms
- Calling color as function wraps text correctly

### Acceptance Criteria

- [ ] Full theme API works with ANSI-16 output
- [ ] Transformations degrade gracefully (no-op)
- [ ] Escape sequences verified against chalk output

### Estimated Effort

~6 hours

---

## M4: OSC Probing Infrastructure

**Goal**: Implement terminal palette probing via OSC escape sequences.

### Deliverables

1. **Probe execution**
   ```typescript
   // src/probe.ts
   interface ProbeResult {
     success: boolean;
     colors: Map<number, RGB>;      // ANSI indices 0-15
     foreground: RGB | null;
     background: RGB | null;
     rawResponses: string[];        // for debugging
   }
   
   async function probeTerminalPalette(options?: {
     timeout?: number;              // default 100ms
   }): Promise<ProbeResult>;
   ```

2. **OSC query generation**
   ```typescript
   function generatePaletteQueries(): string;  // All queries in one string
   ```

3. **Response parsing**
   ```typescript
   function parseOscResponses(raw: string): Map<number, RGB>;
   ```
   - Loose parsing to handle terminal quirks
   - Extract RGB from `rgb:rrrr/gggg/bbbb` format
   - Handle partial responses gracefully

4. **T-level inference**
   ```typescript
   function inferThemeLevel(probeResult: ProbeResult): ThemeLevel;
   ```
   - T3 if all 16 colors + fg/bg probed
   - T2 if only fg/bg probed (can infer light/dark)
   - T1 if probe failed entirely

### Safety Considerations

- Set stdin to raw mode only briefly
- Always restore stdin mode (try/finally)
- Non-blocking read with timeout
- Skip probe entirely if not a TTY

### Test Coverage

- Parse well-formed OSC responses
- Parse malformed responses (Alacritty quirks)
- Timeout behavior (mock slow stdin)
- Non-TTY detection

### Acceptance Criteria

- [x] Probing works in kitty, Ghostty, iTerm2, Alacritty (validated in feasibility test)
- [ ] Probing integrated into library codebase
- [ ] Timeout prevents hanging on unresponsive terminals
- [ ] Probe failure results in T1, not thrown error
- [ ] No stdin corruption after probe
- [ ] Both BEL and ST terminators handled correctly

### Estimated Effort

~8 hours

**Note**: The probe logic was validated in the feasibility test. This milestone integrates that proven code into the library structure.

---

## M5: VS Code Family Config Parsing

**Goal**: Read terminal colors from VS Code/Cursor/Windsurf settings files instead of slow OSC probing.

### Deliverables

1. **VS Code family detection**
   ```typescript
   // src/vscode.ts
   interface VSCodeFamilyInfo {
     editor: 'vscode' | 'cursor' | 'windsurf';
     configDir: string;
   }
   
   function detectVSCodeFamily(): VSCodeFamilyInfo | null;
   ```

2. **Settings file parser**
   ```typescript
   interface ParsedVSCodeColors {
     foreground: RGB | null;
     background: RGB | null;
     colors: Map<number, RGB>;  // ANSI 0-15
   }
   
   function parseVSCodeSettings(settingsPath: string): ParsedVSCodeColors | null;
   ```

3. **Fallback chain**
   - Try detected config path
   - Try `~/.vscode/settings.json`
   - Try `~/.cursor/settings.json`
   - Try `~/.windsurf/settings.json`
   - Fall back to OSC probe

4. **Integration with theme creation**
   ```typescript
   // In createTheme():
   if (detectVSCodeFamily()) {
     // Try config parsing first (fast)
     // Fall back to probe only if parsing fails
   }
   ```

### Detection Signals (Tested)

| Editor | `__CFBundleIdentifier` | Env Vars |
|--------|------------------------|----------|
| VS Code | `com.microsoft.VSCode` | - |
| Cursor | (unstable) | `CURSOR_CLI`, `CURSOR_TRACE_ID` |
| Windsurf | `com.exafunction.windsurf` | - |

### Test Coverage

- Detect each editor correctly (attest-it snapshots)
- Parse valid settings.json with all colors
- Parse settings.json with partial colors
- Handle missing file gracefully
- Handle malformed JSON gracefully
- Fallback chain works end-to-end

### Acceptance Criteria

- [ ] VS Code detected and colors read from config
- [ ] Cursor detected and colors read from config
- [ ] Windsurf detected and colors read from config
- [ ] Fallback to OSC probe works if config missing
- [ ] Latency < 5ms for config parsing path

### Estimated Effort

~4 hours

---

## M6: T3 Resolution (Theme-Aligned Colors)

**Goal**: Use probed palette to produce theme-aligned derived colors.

### Deliverables

1. **Theme factory with probing**
   ```typescript
   // src/theme.ts
   async function createTheme(options?: ThemeOptions): Promise<Theme>;
   ```
   - Probe terminal on first call
   - Return T3 theme if probe succeeds
   - Fall back to T1 theme if probe fails

2. **Derived color resolution**
   - T3: Start from probed RGB, apply transforms, output RGB
   - T1: Transforms are no-ops (from M3)

3. **Rendering by C-level**
   - C3: Output `\x1b[38;2;r;g;bm` (truecolor)
   - C2: Quantize RGB → ANSI-256, output `\x1b[38;5;Nm`
   - C1: Output base ANSI `\x1b[3Nm`

4. **Color introspection**
   ```typescript
   const derived = theme.red.saturate(0.2);
   console.log(derived.rgb);  // [230, 50, 50] (example)
   console.log(derived.ansi); // 1 (base was red)
   ```

### Test Coverage

- Probe success → T3 capabilities
- Derived colors compute correct RGB
- Rendering selects correct escape format per C-level
- Degradation: C1+T3 still uses ANSI-16 (can't render RGB)

### Acceptance Criteria

- [ ] `theme.capabilities.theme === 'palette'` when probe succeeds
- [ ] Derived colors visually differ from base in truecolor terminal
- [ ] Falls back correctly on ANSI-256 and ANSI-16 terminals

### Estimated Effort

~6 hours

---

## M7: Pluggable Caching (Optional)

**Goal**: Implement a pluggable caching system for edge cases where probing latency matters.

**Note**: With native terminals at <7ms and VS Code family using config parsing, caching is optional. This milestone provides caching for edge cases (SSH, exotic terminals) and CLI authors who want guaranteed zero probe overhead.

### Deliverables

1. **Cache adapter interface**
   ```typescript
   // src/cache.ts
   interface CacheAdapter {
     read(): Promise<CacheData | null> | CacheData | null;
     write(data: CacheData): Promise<void> | void;
     clear?(): Promise<void> | void;
   }
   
   interface CacheData {
     version: 1;
     timestamp: number;
     termProgram: string | null;
     capabilities: Capabilities;
     palette: PaletteData | null;
   }
   ```

2. **EphemeralCache adapter (default)**
   ```typescript
   // src/cache/ephemeral.ts
   class EphemeralCache implements CacheAdapter {
     // Temp file + CHROMATERM_CACHE env var
     // Session-scoped with 24h TTL fallback
   }
   ```

3. **FileCache adapter**
   ```typescript
   // src/cache/file.ts
   class FileCache implements CacheAdapter {
     constructor(path: string);
     // Durable storage at specific path
     // No automatic TTL
   }
   ```

4. **MemoryCache adapter**
   ```typescript
   // src/cache/memory.ts
   class MemoryCache implements CacheAdapter {
     // In-process only, no persistence
   }
   ```

5. **Cache validation**
   ```typescript
   function validateCacheData(data: unknown): data is CacheData;
   ```

6. **Integrate into `createTheme()`**
   ```typescript
   async function createTheme(options?: {
     cache?: CacheAdapter | null;  // null = no caching
     forceProbe?: boolean;         // bypass cache, write new result
     // ... other options
   }): Promise<Theme>;
   ```

### Environment Variable Handling (EphemeralCache)

- Check `CHROMATERM_CACHE` on read
- Set `CHROMATERM_CACHE` on write (for child process inheritance)
- Generate unique temp file path: `os.tmpdir()/chromaterm-<random>.json`

### Test Coverage

- Each adapter: round-trip write/read
- EphemeralCache: env var inheritance (mock process.env)
- EphemeralCache: TTL expiration
- FileCache: persists across "process restarts" (mock)
- MemoryCache: second call uses cached data
- Cache validation: rejects invalid/corrupt data
- `cache: null` forces fresh probe every time
- `forceProbe: true` bypasses existing cache

### Acceptance Criteria

- [ ] Default behavior unchanged (ephemeral cache)
- [ ] FileCache enables durable storage for CLI tools
- [ ] Custom adapters can be implemented easily
- [ ] Invalid cache data is safely ignored

### Estimated Effort

~6 hours (expanded from 4h due to multiple adapters)

---

## M8: chalk Re-export (`abs`)

**Goal**: Expose chalk as the `abs` export for absolute colors.

### Deliverables

1. **Re-export chalk**
   ```typescript
   // src/index.ts
   export { default as abs } from 'chalk';
   ```

2. **Documentation**
   - README section on theme-relative vs absolute colors
   - Examples showing both APIs

### Test Coverage

- `abs` is callable and produces escape sequences
- `abs.rgb()`, `abs.hex()` work as expected

### Acceptance Criteria

- [ ] `import { abs } from 'chromaterm'` works
- [ ] Users can use chalk methods without separate install

### Estimated Effort

~1 hour

---

## M9: Smoke Test CLI

**Goal**: Create a CLI tool for manual verification in real terminals.

### Deliverables

1. **Smoke test command**
   ```bash
   npx chromaterm-smoke
   ```

2. **Output includes**
   - Detected capabilities
   - Swatch of all 16 base colors
   - Swatch of derived colors (various transforms)
   - Text modifier samples (bold, italic, underline, etc.)
   - Instructions to change theme and re-run

3. **Test matrix checklist**
   - Markdown checklist of terminals to test
   - Columns: terminal, C-level, T-level, visual correctness

### Package Configuration

- Separate bin entry or internal package
- Consider: `packages/smoke` in a monorepo structure

### Acceptance Criteria

- [ ] `npx chromaterm-smoke` runs without errors
- [ ] Output is visually inspectable in any terminal
- [ ] Changing terminal theme + re-running shows different derived colors

### Estimated Effort

~3 hours

---

## M10: attest-it Golden Tests

**Goal**: Snapshot-based tests for integration behavior.

### Deliverables

1. **Probe response golden tests**
   ```typescript
   // Given these raw OSC responses...
   const mockResponses = '...';
   attest(parseOscResponses(mockResponses)).snap();
   ```

2. **Resolution chain golden tests**
   ```typescript
   // Given this palette and these transforms...
   const result = resolveToEscapeSequence(palette, baseColor, transforms, cLevel);
   attest(result).snap();
   ```

3. **Full theme golden tests**
   ```typescript
   const theme = await createTheme({ forceCapability: { color: 'truecolor', theme: 'palette' } });
   attest(theme.red.desaturate(0.3)('test')).snap();
   ```

### Test Organization

```
test/
├── unit/           # Pure function tests (M1-M2)
├── golden/         # Snapshot tests (M9)
│   ├── probe.test.ts
│   ├── resolution.test.ts
│   └── theme.test.ts
└── smoke/          # CLI tool source (M8)
```

### Acceptance Criteria

- [ ] Golden tests cover major code paths
- [ ] Snapshots are human-readable
- [ ] CI fails on unexpected snapshot changes

### Estimated Effort

~4 hours

---

## Summary: v0.1.0 Release Contents

| Milestone | Description | Status |
|-----------|-------------|--------|
| M0 | Project scaffolding | Required |
| M1 | Color math primitives | Required |
| M2 | Capability detection (C-level) | Required |
| M3 | T1 baseline (ANSI-16 fallback) | Required |
| M4 | OSC probing infrastructure | Required |
| M5 | VS Code family config parsing | Required |
| M6 | T3 resolution (theme-aligned) | Required |
| M7 | Pluggable caching | Optional |
| M8 | chalk re-export (`abs`) | Required |
| M9 | Smoke test CLI | Required |
| M10 | Golden tests | Required |

**Total estimated effort**: ~46 hours

**Required milestones**: ~40 hours (M7 caching is optional)

---

## Future Milestones (Post v0.1)

### M11: Windows/Linux Platform Testing

**Required before v1.0 release**

- [ ] Windows Terminal (WSL2) validation
- [ ] Windows Terminal + tmux
- [ ] GNOME Terminal
- [ ] Konsole (KDE)
- [ ] xterm (reference implementation)
- [ ] xfce4-terminal
- [ ] Tilix
- [ ] SSH sessions (extended timeout testing)

### M12: Built-in Theme Palettes

- Dracula, Nord, Solarized Light/Dark, Gruvbox Light/Dark
- `themes.auto` as the probe-based option
- `definePalette()` helper for custom palettes
- Fallback palette option in `createTheme()`

### M13: Contrast Ratio Operations

- `ensureContrast(background, ratio)`
- `minLuminance(threshold)`
- `maxLuminance(threshold)`

### M14: Config File Parsing (Additional Terminals)

- kitty config parser
- Alacritty config parser
- Opt-in only, specific terminals
- Only if probing proves insufficient for specific terminals

### M15: xterm.js Support

- Browser-compatible build
- Alternative probe mechanism for xterm.js
- Async-only API (no sync filesystem)

### M16: Terminal CI Integration

- Headless terminal automation
- Capture probe results programmatically
- Add to CI matrix

---

## Risk Register

| Risk | Likelihood | Impact | Status |
|------|------------|--------|--------|
| OSC probing unreliable in major terminal | ~~Medium~~ **Low** | High | ✅ **Mitigated** - 87.5% T3 success on macOS |
| Probe latency impacts CLI startup | ~~Medium~~ **Very Low** | Medium | ✅ **Mitigated** - P95 <7ms for native terminals |
| VS Code probe latency | **N/A** | Medium | ✅ **Solved** - Config parsing instead (~5ms) |
| Probing corrupts stdin | ~~Low~~ **Very Low** | High | ✅ **Mitigated** - Zero incidents in testing |
| tmux breaks probing | ~~Medium~~ **Low** | Medium | ✅ **Mitigated** - Pass-through works in 6/7 terminals |
| VS Code derivative detection drift | Low | Low | Fallback chain handles gracefully; attest-it snapshots detect changes |
| chalk API changes | Low | Medium | Pin chalk version; wrapper provides stability |
| Color math edge cases | Medium | Low | Comprehensive unit tests; HSL is well-understood |
| Windows/Linux terminal support | Low | Medium | Expected to work; validation pending |

### Remaining Risks

The primary remaining risks are:
1. **Color math correctness** - Must get right before v1.0 (hard to change later)
2. **Windows/Linux coverage** - Untested but expected to work
3. **Edge cases** - SSH latency, exotic terminals, nested multiplexers

---

## Definition of Done (per milestone)

1. Code compiles with no TypeScript errors
2. All tests pass
3. Test coverage meets threshold (aim for 80%+)
4. No ESLint errors
5. README updated if public API changed
6. Changelog entry added
