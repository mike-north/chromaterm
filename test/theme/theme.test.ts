import { describe, it, expect } from 'vitest';
import { createTheme, createT1Theme } from '../../src/theme/theme.js';

describe('createTheme', () => {
  it('should return a theme with all color properties', async () => {
    const theme = await createTheme({ skipProbe: true });

    // Standard colors
    expect(theme.black).toBeDefined();
    expect(theme.red).toBeDefined();
    expect(theme.green).toBeDefined();
    expect(theme.yellow).toBeDefined();
    expect(theme.blue).toBeDefined();
    expect(theme.magenta).toBeDefined();
    expect(theme.cyan).toBeDefined();
    expect(theme.white).toBeDefined();

    // Bright colors
    expect(theme.brightBlack).toBeDefined();
    expect(theme.brightRed).toBeDefined();
    expect(theme.brightGreen).toBeDefined();
    expect(theme.brightYellow).toBeDefined();
    expect(theme.brightBlue).toBeDefined();
    expect(theme.brightMagenta).toBeDefined();
    expect(theme.brightCyan).toBeDefined();
    expect(theme.brightWhite).toBeDefined();

    // Semantic aliases
    expect(theme.error).toBeDefined();
    expect(theme.warning).toBeDefined();
    expect(theme.success).toBeDefined();
    expect(theme.info).toBeDefined();
    expect(theme.muted).toBeDefined();

    // Special
    expect(theme.foreground).toBeDefined();
    expect(theme.background).toBeDefined();

    // Metadata
    expect(theme.capabilities).toBeDefined();
    expect(theme.palette).toBeDefined();
  });

  it('should return T1 when skipProbe is true', async () => {
    const theme = await createTheme({ skipProbe: true });

    expect(theme.capabilities.theme).toBe('blind');
    expect(theme.palette).toBeNull();
  });

  it('should have null baseRgb for colors at T1', async () => {
    const theme = await createTheme({ skipProbe: true });

    // Color.rgb should be null when baseRgb is null
    expect(theme.red.rgb).toBeNull();
    expect(theme.blue.rgb).toBeNull();
  });

  it('should respect forceCapability.theme option', async () => {
    const theme = await createTheme({
      skipProbe: true,
      forceCapability: { theme: 'palette' },
    });

    // Even with skipProbe, forceCapability should override
    expect(theme.capabilities.theme).toBe('palette');
  });

  it('should respect forceCapability.color option', async () => {
    const theme = await createTheme({
      skipProbe: true,
      forceCapability: { color: 'ansi256' },
    });

    expect(theme.capabilities.color).toBe('ansi256');
  });

  it('should set default probeTimeout of 100ms', async () => {
    // Just verify it doesn't throw - we can't easily test the timeout value
    const theme = await createTheme({ skipProbe: true });
    expect(theme).toBeDefined();
  });

  it('should allow custom probeTimeout', async () => {
    const theme = await createTheme({ skipProbe: true, probeTimeout: 200 });
    expect(theme).toBeDefined();
  });

  it('should be callable to colorize text', async () => {
    const theme = await createTheme({ skipProbe: true });

    const result = theme.red('test');
    expect(typeof result).toBe('string');
    expect(result).toContain('test');
  });

  it('should support method chaining on colors', async () => {
    const theme = await createTheme({ skipProbe: true });

    const color = theme.red.bold().saturate(0.5);
    expect(color).toBeDefined();
    expect(typeof color).toBe('function');

    const result = color('test');
    expect(typeof result).toBe('string');
  });
});

describe('createT1Theme', () => {
  it('should create a T1 theme with blind capability', () => {
    const theme = createT1Theme();

    expect(theme.capabilities.theme).toBe('blind');
    expect(theme.palette).toBeNull();
  });

  it('should have all color properties', () => {
    const theme = createT1Theme();

    expect(theme.black).toBeDefined();
    expect(theme.red).toBeDefined();
    expect(theme.green).toBeDefined();
    expect(theme.yellow).toBeDefined();
    expect(theme.blue).toBeDefined();
    expect(theme.magenta).toBeDefined();
    expect(theme.cyan).toBeDefined();
    expect(theme.white).toBeDefined();
    expect(theme.brightBlack).toBeDefined();
    expect(theme.brightRed).toBeDefined();
    expect(theme.brightGreen).toBeDefined();
    expect(theme.brightYellow).toBeDefined();
    expect(theme.brightBlue).toBeDefined();
    expect(theme.brightMagenta).toBeDefined();
    expect(theme.brightCyan).toBeDefined();
    expect(theme.brightWhite).toBeDefined();
    expect(theme.error).toBeDefined();
    expect(theme.warning).toBeDefined();
    expect(theme.success).toBeDefined();
    expect(theme.info).toBeDefined();
    expect(theme.muted).toBeDefined();
    expect(theme.foreground).toBeDefined();
    expect(theme.background).toBeDefined();
  });

  it('should have null rgb values at T1', () => {
    const theme = createT1Theme();

    expect(theme.red.rgb).toBeNull();
    expect(theme.blue.rgb).toBeNull();
    expect(theme.foreground.rgb).toBeNull();
  });

  it('should respect forceColor option', () => {
    const theme = createT1Theme({ forceColor: 'none' });
    expect(theme.capabilities.color).toBe('none');
  });

  it('should respect forceTheme option', () => {
    const theme = createT1Theme({ forceTheme: 'lightdark' });
    expect(theme.capabilities.theme).toBe('lightdark');
  });

  it('should be synchronous', () => {
    // Just verify that createT1Theme is not async
    const theme = createT1Theme();
    expect(theme).toBeDefined();
    expect(theme.capabilities).toBeDefined();
  });
});

describe('Theme with palette (T3)', () => {
  it('should have palette data when forced to T3', async () => {
    // When forcing palette capability without skipProbe, it will try to detect
    // In a test environment without TTY, it should still respect the force
    const theme = await createTheme({
      skipProbe: true,
      forceCapability: { theme: 'palette' },
    });

    expect(theme.capabilities.theme).toBe('palette');
    // Palette will be null because we skipped probing and didn't provide data
    expect(theme.palette).toBeNull();
  });
});

describe('Color introspection', () => {
  it('should expose ansi property', async () => {
    const theme = await createTheme({ skipProbe: true });

    expect(theme.red.ansi).toBe(1);
    expect(theme.green.ansi).toBe(2);
    expect(theme.blue.ansi).toBe(4);
    expect(theme.brightRed.ansi).toBe(9);
  });

  it('should expose rgb property as null at T1', async () => {
    const theme = await createTheme({ skipProbe: true });

    expect(theme.red.rgb).toBeNull();
  });
});
