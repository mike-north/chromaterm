#!/usr/bin/env node
/**
 * ChromaTerm Interactive Demo
 *
 * Run with: pnpm demo
 */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Resolve paths relative to this file, not CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, '..', 'dist', 'index.js');

// Dynamic import to handle path resolution
const { detectTheme, abs } = (await import(distPath)) as typeof import('../dist/index.js');
import type { Theme } from '../dist/index.js';

// ANSI codes for clearing/positioning
const CLEAR = '\x1b[2J\x1b[H';
const RESET = '\x1b[0m';

function header(title: string): string {
  const line = '═'.repeat(60);
  return `\n╔${line}╗\n║  ${title.padEnd(58)}║\n╚${line}╝\n`;
}

function printCapabilities(theme: Theme): void {
  console.log(header('TERMINAL CAPABILITIES'));

  const { color, theme: themeLevel, isTTY } = theme.capabilities;

  console.log('  Detected capabilities:\n');

  // Color level
  const colorDesc: Record<string, string> = {
    none: 'No color support (C0)',
    ansi16: '16-color ANSI (C1)',
    ansi256: '256-color palette (C2)',
    truecolor: '24-bit RGB truecolor (C3)',
  };
  console.log(`  Color Level:  ${color.padEnd(12)} ${colorDesc[color] ?? 'Unknown'}`);

  // Theme level
  const themeDesc: Record<string, string> = {
    blind: 'No theme knowledge (T1)',
    lightdark: 'Light/dark detection (T2)',
    palette: 'Full palette known (T3)',
  };
  console.log(`  Theme Level:  ${themeLevel.padEnd(12)} ${themeDesc[themeLevel] ?? 'Unknown'}`);

  // TTY
  console.log(
    `  TTY:          ${String(isTTY).padEnd(12)} ${isTTY ? 'Interactive terminal' : 'Piped output'}`
  );

  // Palette info
  if (theme.palette) {
    console.log('\n  Palette detected! RGB values are available for transforms.');
    const bg = theme.palette.background;
    const fg = theme.palette.foreground;
    console.log(`  Background:   RGB(${String(bg.r)}, ${String(bg.g)}, ${String(bg.b)})`);
    console.log(`  Foreground:   RGB(${String(fg.r)}, ${String(fg.g)}, ${String(fg.b)})`);
  } else {
    console.log('\n  No palette detected. Transforms will be no-ops at T1.');
  }
}

function printBasicColors(theme: Theme): void {
  console.log(header('BASIC COLORS'));

  console.log('  The 16 standard ANSI colors, rendered using YOUR terminal theme:\n');

  // Standard colors
  const colors = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'] as const;

  process.stdout.write('  Standard:  ');
  for (const name of colors) {
    process.stdout.write(theme[name](` ${name.slice(0, 3).toUpperCase()} `));
    process.stdout.write(' ');
  }
  console.log();

  // Bright colors
  process.stdout.write('  Bright:    ');
  const brightColors = [
    'brightBlack',
    'brightRed',
    'brightGreen',
    'brightYellow',
    'brightBlue',
    'brightMagenta',
    'brightCyan',
    'brightWhite',
  ] as const;
  for (const name of brightColors) {
    const short = name.replace('bright', '').slice(0, 3).toUpperCase();
    process.stdout.write(theme[name](` ${short} `));
    process.stdout.write(' ');
  }
  console.log();

  // Show with backgrounds
  console.log('\n  With backgrounds (white on color):\n');
  process.stdout.write('  ');
  for (const name of colors) {
    if (name === 'white') continue;
    process.stdout.write(theme.white.on(theme[name])(` ${name.slice(0, 3)} `));
    process.stdout.write(' ');
  }
  console.log('\n');
}

function printSemanticColors(theme: Theme): void {
  console.log(header('SEMANTIC COLORS'));

  console.log('  Named colors for common use cases:\n');

  console.log(`  ${theme.error('  ERROR   ')}  theme.error()     - For error messages`);
  console.log(`  ${theme.warning('  WARNING ')}  theme.warning()   - For warnings`);
  console.log(`  ${theme.success('  SUCCESS ')}  theme.success()   - For success messages`);
  console.log(`  ${theme.info('  INFO    ')}  theme.info()      - For informational text`);
  console.log(`  ${theme.muted('  MUTED   ')}  theme.muted()     - For less important text`);
  console.log();
}

function printModifiers(theme: Theme): void {
  console.log(header('TEXT MODIFIERS'));

  console.log('  Style modifiers that can be chained with colors:\n');

  console.log(`  ${theme.red.bold()('Bold text')}           theme.red.bold()()`);
  console.log(`  ${theme.green.dim()('Dim text')}            theme.green.dim()()`);
  console.log(`  ${theme.blue.italic()('Italic text')}         theme.blue.italic()()`);
  console.log(`  ${theme.yellow.underline()('Underlined text')}     theme.yellow.underline()()`);
  console.log(
    `  ${theme.magenta.strikethrough()('Strikethrough')}       theme.magenta.strikethrough()()`
  );
  console.log(`  ${theme.cyan.inverse()('Inverse text')}        theme.cyan.inverse()()`);

  console.log('\n  Combining modifiers:\n');

  console.log(
    `  ${theme.red.bold().underline()('Bold + Underline')}    theme.red.bold().underline()()`
  );
  console.log(
    `  ${theme.blue.italic().bold()('Italic + Bold')}       theme.blue.italic().bold()()`
  );
  console.log(
    `  ${theme.green.bold().italic().underline()('All three')}           theme.green.bold().italic().underline()()`
  );
  console.log();
}

function printTransforms(theme: Theme): void {
  console.log(header('COLOR TRANSFORMS'));

  const hasT3 = theme.capabilities.theme === 'palette';

  if (!hasT3) {
    console.log('  Note: Your terminal is at T1/T2. Transforms show base colors.');
    console.log('  In T3 terminals, these would show visible color changes.\n');
  } else {
    console.log('  Your terminal is at T3! Transforms produce precise RGB colors.\n');
  }

  const colors = ['red', 'green', 'blue', 'magenta'] as const;

  // Helper to create a background swatch
  const swatch = (color: typeof theme.red, text = '  '): string => {
    return theme.white.on(color)(text);
  };

  // Fixed width for color name labels (9 chars to fit "MAGENTA" with padding)
  const _label = (name: string): string => ` ${name.toUpperCase().padEnd(8)}`;

  // Lightness spectrum: darken ← base → lighten (-0.5 to +0.5 in 0.05 increments)
  // Position: 4 indent + 9 name = 13, then 10 swatches * 2 chars = 20, center at 33
  console.log('  Lightness (-0.5 → +0.5):\n');
  console.log('                                 ↓ 0.0');
  for (const name of colors) {
    const base = theme[name];
    process.stdout.write(`    ${name.toUpperCase().padEnd(8)} `);
    for (let i = -10; i <= 10; i++) {
      const amount = i / 20;
      if (amount < 0) {
        process.stdout.write(swatch(base.darken(-amount)));
      } else if (amount > 0) {
        process.stdout.write(swatch(base.lighten(amount)));
      } else {
        process.stdout.write(swatch(base));
      }
    }
    console.log();
  }

  // Saturation spectrum: desaturate ← base → saturate (-0.5 to +0.5 in 0.05 increments)
  console.log('\n  Saturation (-0.5 → +0.5):\n');
  console.log('                                 ↓ 0.0');
  for (const name of colors) {
    const base = theme[name];
    process.stdout.write(`    ${name.toUpperCase().padEnd(8)} `);
    for (let i = -10; i <= 10; i++) {
      const amount = i / 20;
      if (amount < 0) {
        process.stdout.write(swatch(base.desaturate(-amount)));
      } else if (amount > 0) {
        process.stdout.write(swatch(base.saturate(amount)));
      } else {
        process.stdout.write(swatch(base));
      }
    }
    console.log();
  }

  // Opacity spectrum: 0% → 100% opacity (in 5% increments)
  console.log('\n  Opacity (0.0 → 1.0):\n');
  console.log('             ↓ 0.0                               1.0 ↓');
  for (const name of colors) {
    const base = theme[name];
    process.stdout.write(`    ${name.toUpperCase().padEnd(8)} `);
    // opacity = 1 - fade amount (fade(1.0) = 0% opacity, fade(0.0) = 100% opacity)
    for (let opacity = 0; opacity <= 20; opacity++) {
      const fadeAmount = 1 - opacity / 20;
      if (fadeAmount > 0) {
        process.stdout.write(swatch(base.fade(fadeAmount)));
      } else {
        process.stdout.write(swatch(base));
      }
    }
    console.log();
  }

  // Hue rotation
  console.log('\n  Hue rotation (starting from red):\n');
  process.stdout.write('    ');
  for (let deg = 0; deg <= 330; deg += 30) {
    process.stdout.write(swatch(theme.red.rotate(deg), '   '));
  }
  console.log('  (0° → 330°)\n');

  // Chained transforms
  console.log('  Chained transforms:\n');
  console.log(`    ${theme.blue.lighten(0.2).saturate(0.3)('Lighter + more saturated blue')}`);
  console.log(`    ${theme.red.darken(0.1).rotate(15)('Darker + hue-shifted red')}`);
  console.log(`    ${theme.green.fade(0.5).bold()('Faded green with bold')}`);
  console.log();
}

function printAbsoluteColors(theme: Theme): void {
  console.log(header('ABSOLUTE VS THEME COLORS'));

  console.log('  Theme colors adapt to your terminal palette.');
  console.log('  Absolute colors (via abs/chalk) are exact RGB values.\n');

  console.log('  Theme-relative red:');
  console.log(`    ${theme.red('████████████████████████████████')}`);
  console.log();

  console.log('  Absolute reds (same in every terminal):');
  console.log(`    ${abs.hex('#ff0000')('████████████████████████████████')}  #ff0000`);
  console.log(`    ${abs.hex('#cc0000')('████████████████████████████████')}  #cc0000`);
  console.log(`    ${abs.hex('#990000')('████████████████████████████████')}  #990000`);
  console.log();

  console.log('  When to use each:\n');
  console.log(
    `    ${theme.info('Theme colors:')} UI messages, status indicators, syntax highlighting`
  );
  console.log(
    `    ${abs.hex('#1da1f2')('Absolute colors:')} Brand colors, design tokens, exact specifications`
  );
  console.log();
}

function printCodeExamples(theme: Theme): void {
  console.log(header('CODE EXAMPLES'));

  console.log('  Basic usage:\n');
  console.log(theme.muted("    import { detectTheme } from 'chromaterm';"));
  console.log(theme.muted(''));
  console.log(theme.muted('    const theme = await detectTheme();'));
  console.log(theme.muted("    console.log(theme.red('Hello!'));"));

  console.log('\n  With transforms:\n');
  console.log(theme.muted("    console.log(theme.blue.lighten(0.2)('Lighter blue'));"));
  console.log(theme.muted("    console.log(theme.red.saturate(0.3).bold()('Vivid bold red'));"));

  console.log('\n  Semantic colors:\n');
  console.log(theme.muted("    console.log(theme.error('Something went wrong'));"));
  console.log(theme.muted("    console.log(theme.success('All tests passed'));"));

  console.log('\n  Backgrounds:\n');
  console.log(theme.muted("    console.log(theme.white.on(theme.red)('Alert!'));"));

  console.log('\n  Absolute colors (when needed):\n');
  console.log(theme.muted("    import { abs } from 'chromaterm';"));
  console.log(theme.muted("    console.log(abs.hex('#ff6600')('Exact orange'));"));
  console.log();
}

function printIntrospection(theme: Theme): void {
  console.log(header('COLOR INTROSPECTION'));

  console.log('  Each color exposes its ANSI index and RGB values (at T3):\n');

  const colors = ['red', 'green', 'blue', 'yellow', 'cyan', 'magenta'] as const;

  console.log('    Color      ANSI    RGB');
  console.log('    ' + '─'.repeat(35));

  for (const name of colors) {
    const color = theme[name];
    const rgb = color.rgb;
    const rgbStr = rgb ? `[${rgb.join(', ')}]` : 'null (T1/T2)';
    console.log(`    ${color(name.padEnd(10))} ${String(color.ansi).padEnd(7)} ${rgbStr}`);
  }
  console.log();
}

function printGradient(theme: Theme): void {
  console.log(header('COLOR GRADIENT DEMO'));

  console.log('  A hue rotation gradient using theme.red.rotate():\n');

  process.stdout.write('    ');
  for (let deg = 0; deg < 360; deg += 3) {
    process.stdout.write(theme.red.rotate(deg)('█'));
  }
  console.log('\n');

  console.log('  Lightness gradient using theme.blue:\n');

  process.stdout.write('    Dark ');
  for (let i = -5; i <= 5; i++) {
    const amount = i * 0.08;
    if (amount < 0) {
      process.stdout.write(theme.blue.darken(-amount)('██'));
    } else if (amount > 0) {
      process.stdout.write(theme.blue.lighten(amount)('██'));
    } else {
      process.stdout.write(theme.blue('██'));
    }
  }
  console.log(' Light\n');
}

async function main(): Promise<void> {
  console.log(CLEAR);

  console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║   ██████╗██╗  ██╗██████╗  ██████╗ ███╗   ███╗ █████╗          ║
  ║  ██╔════╝██║  ██║██╔══██╗██╔═══██╗████╗ ████║██╔══██╗         ║
  ║  ██║     ███████║██████╔╝██║   ██║██╔████╔██║███████║         ║
  ║  ██║     ██╔══██║██╔══██╗██║   ██║██║╚██╔╝██║██╔══██║         ║
  ║  ╚██████╗██║  ██║██║  ██║╚██████╔╝██║ ╚═╝ ██║██║  ██║         ║
  ║   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝         ║
  ║                                                               ║
  ║              Terminal colors that adapt to YOU                ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
`);

  // Create theme with probing
  console.log('  Detecting terminal capabilities...\n');

  const theme = await detectTheme();

  // Run all demo sections
  printCapabilities(theme);
  printBasicColors(theme);
  printSemanticColors(theme);
  printModifiers(theme);
  printTransforms(theme);
  printGradient(theme);
  printAbsoluteColors(theme);
  printIntrospection(theme);
  printCodeExamples(theme);

  console.log(header('TRY IT YOURSELF'));
  console.log('  Edit demo/playground.ts and run: pnpm demo:play\n');
  console.log('  Or import ChromaTerm in your own project:\n');
  console.log(theme.muted("    import { detectTheme } from 'chromaterm';\n"));

  console.log(RESET);
}

main().catch((error: unknown) => {
  console.error('Demo error:', error);
  process.exit(1);
});
