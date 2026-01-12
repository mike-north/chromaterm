#!/usr/bin/env node
/**
 * ChromaTerm Playground
 *
 * Edit this file and run: pnpm demo:play
 *
 * This is your sandbox to experiment with ChromaTerm!
 */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Resolve paths relative to this file, not CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, '..', 'dist', 'index.js');

// Dynamic import to handle path resolution
const { detectTheme, abs } = (await import(distPath)) as typeof import('../dist/index.js');

async function playground(): Promise<void> {
  const theme = await detectTheme();

  console.log('\n🎨 ChromaTerm Playground\n');
  console.log('Edit demo/playground.ts and re-run to experiment!\n');

  // ═══════════════════════════════════════════════════════════════
  // TRY EDITING BELOW THIS LINE
  // ═══════════════════════════════════════════════════════════════

  // Basic colors
  console.log(theme.red('Hello, red world!'));
  console.log(theme.green('Hello, green world!'));
  console.log(theme.blue('Hello, blue world!'));

  // Modifiers
  console.log(theme.yellow.bold()('Bold yellow'));
  console.log(theme.cyan.italic()('Italic cyan'));
  console.log(theme.magenta.underline()('Underlined magenta'));

  // Transforms (visible at T3)
  console.log(theme.red.lighten(0.2)('Lighter red'));
  console.log(theme.blue.darken(0.2)('Darker blue'));
  console.log(theme.green.saturate(0.5)('Saturated green'));
  console.log(theme.yellow.rotate(30)('Hue-rotated yellow'));

  // Backgrounds
  console.log(theme.white.on(theme.red)(' White on Red '));
  console.log(theme.black.on(theme.yellow)(' Black on Yellow '));

  // Semantic colors
  console.log(theme.error('This is an error'));
  console.log(theme.warning('This is a warning'));
  console.log(theme.success('This is a success'));
  console.log(theme.info('This is info'));

  // Chaining
  console.log(theme.blue.bold().underline().lighten(0.1)('Chained styles!'));

  // Absolute colors (when you need exact values)
  console.log(abs.hex('#ff6600')('Exact orange'));
  console.log(abs.rgb(100, 200, 255)('Exact light blue'));

  // Introspection
  console.log(`\nRed ANSI index: ${String(theme.red.ansi)}`);
  console.log(`Red RGB: ${theme.red.rgb ? theme.red.rgb.join(', ') : 'null (T1/T2)'}`);

  // ═══════════════════════════════════════════════════════════════
  // TRY EDITING ABOVE THIS LINE
  // ═══════════════════════════════════════════════════════════════

  console.log();
}

playground().catch((error: unknown) => {
  console.error('Playground error:', error);
  process.exit(1);
});
