# Golden Tests (Snapshot Tests)

## Purpose

Golden tests capture the exact escape sequence output of ChromaTerm to catch regressions. These tests ensure that color output remains consistent across code changes.

## What is Tested

- **C0 (no color)**: Plain text output without escape sequences
- **C1 (ANSI-16)**: Standard 16-color ANSI escape codes
- **C2 (ANSI-256)**: 256-color palette escape codes
- **C3 (Truecolor)**: RGB escape codes
- **Modifiers**: Bold, italic, underline, dim, strikethrough, hidden
- **Backgrounds**: Background color application
- **Transforms**: Color transformations (saturate, desaturate, lighten, darken, rotate)
- **Compositions**: Complex combinations of foreground, background, and modifiers
- **Edge cases**: Empty strings, unicode, existing ANSI codes, long strings

## Test Files

- **output.test.ts**: Main golden tests for escape sequence output
- **consistency.test.ts**: Tests that output is deterministic and consistent
- **edge-cases.test.ts**: Tests for edge cases and special inputs

## Updating Snapshots

When making intentional changes to output:

```bash
pnpm nx test:unit -- --update
```

Or for a specific test file:

```bash
pnpm nx test:unit test/golden/output.test.ts -- --update
```

## Reviewing Changes

Snapshot changes should be carefully reviewed in PRs:

1. **Verify the change is intentional**: Ensure the output change was expected
2. **Check escape sequences are valid**: Verify ANSI codes are correct
3. **Ensure no accidental regressions**: Check that unrelated output hasn't changed

## Snapshot Format

Vitest creates snapshot files in:

```
test/golden/__snapshots__/*.test.ts.snap
```

The snapshots contain the actual escape sequences with escape characters, making it easy to verify correct output.

## Example Snapshot

```javascript
exports[
  'Golden Tests - Escape Sequence Output > C1 (ANSI-16) > should output ANSI-16 escape codes for base colors 1'
] = '\x1b[31mhello\x1b[39m';
```

This shows the exact escape sequence (`\x1b[31m` for red, `\x1b[39m` for reset).

## Why Golden Tests Matter

1. **Catch Unintended Changes**: Immediately detect when output changes unexpectedly
2. **Document Behavior**: Snapshots serve as documentation of expected output
3. **Prevent Regressions**: Ensure bug fixes don't reintroduce old issues
4. **Validate Terminal Compatibility**: Ensure escape sequences remain compatible

## Running Golden Tests

```bash
# Run all tests including golden tests
pnpm nx test:unit

# Run only golden tests
pnpm nx test:unit test/golden
```
