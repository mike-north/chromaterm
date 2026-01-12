#!/usr/bin/env tsx
/**
 * ChromaTerm VHS Showcase (Ink version)
 *
 * Demonstrates theme-derived colors beyond ANSI-16:
 * - Gradient bars using lighten/darken transforms
 * - ASCII banner with animated shine effect
 * - All colors derived from the user's theme
 */

import React, { useState, useEffect, memo } from 'react';
import { render, Box, Text } from 'ink';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, '..', 'dist', 'index.js');

const { createTheme } = (await import(distPath)) as typeof import('../dist/index.js');

const theme = await createTheme();

// Banner ASCII art
const banner = [
  '   ██████╗██╗  ██╗██████╗  ██████╗ ███╗   ███╗ █████╗ ',
  '  ██╔════╝██║  ██║██╔══██╗██╔═══██╗████╗ ████║██╔══██╗',
  '  ██║     ███████║██████╔╝██║   ██║██╔████╔██║███████║',
  '  ██║     ██╔══██║██╔══██╗██║   ██║██║╚██╔╝██║██╔══██║',
  '  ╚██████╗██║  ██║██║  ██║╚██████╔╝██║ ╚═╝ ██║██║  ██║',
  '   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝',
];

const BANNER_WIDTH = banner[0].length;

/**
 * Creates a horizontal gradient bar using theme-derived colors
 */
const GradientBar = memo(function GradientBar({
  width,
  baseColor,
}: {
  width: number;
  baseColor: 'cyan';
}): React.ReactElement {
  const steps = 10;
  const segmentWidth = Math.floor(width / steps);
  const segments: React.ReactElement[] = [];

  for (let i = 0; i < steps; i++) {
    const lightness = (i / steps) * 0.5 - 0.25;
    const segment = '█'.repeat(segmentWidth);
    const colored =
      lightness < 0
        ? theme[baseColor].darken(-lightness)(segment)
        : theme[baseColor].lighten(lightness)(segment);
    segments.push(<Text key={i}>{colored}</Text>);
  }

  return <Box>{segments}</Box>;
});

/**
 * Banner with animated shine effect
 */
function ShiningBanner({ shinePos }: { shinePos: number }): React.ReactElement {
  const shineWidth = 8;

  return (
    <Box flexDirection="column">
      {banner.map((line, lineIdx) => (
        <Box key={lineIdx}>
          {line.split('').map((char, i) => {
            const distFromShine = Math.abs(i - shinePos);
            let colored: string;

            if (distFromShine < shineWidth) {
              const brightness = 1 - distFromShine / shineWidth;
              if (brightness > 0.7) {
                colored = theme.cyan.lighten(0.4)(char);
              } else if (brightness > 0.3) {
                colored = theme.cyan.lighten(0.2)(char);
              } else {
                colored = theme.cyan(char);
              }
            } else {
              colored = theme.blue.darken(0.1)(char);
            }
            return <Text key={i}>{colored}</Text>;
          })}
        </Box>
      ))}
    </Box>
  );
}

/**
 * Color swatches showing derived colors
 */
const DerivedColors = memo(function DerivedColors(): React.ReactElement {
  const baseColors = ['red', 'green', 'blue', 'yellow'] as const;

  return (
    <Box flexDirection="column">
      <Text>{theme.white.bold()('  Theme-Derived Colors (beyond ANSI-16):')}</Text>
      <Text> </Text>
      {baseColors.map((color) => (
        <Box key={color}>
          <Text>{'  ' + color.padEnd(7)}</Text>
          {Array.from({ length: 9 }, (_, i) => {
            const amount = (i - 4) * 0.1;
            let swatch: string;
            if (amount < 0) {
              swatch = theme[color].darken(-amount)('██');
            } else if (amount > 0) {
              swatch = theme[color].lighten(amount)('██');
            } else {
              swatch = theme[color]('██');
            }
            return <Text key={i}>{swatch}</Text>;
          })}
        </Box>
      ))}
    </Box>
  );
});

/**
 * Progress bar with hue gradient
 */
const ProgressBar = memo(function ProgressBar(): React.ReactElement {
  const filled: React.ReactElement[] = [];
  for (let i = 0; i < 20; i++) {
    const hue = (i / 20) * 60;
    filled.push(<Text key={i}>{theme.cyan.rotate(hue)('█')}</Text>);
  }

  return (
    <Box>
      <Text>{'  Progress: ['}</Text>
      {filled}
      <Text>{theme.muted('░░░░░░░░░░')}</Text>
      <Text>{'] 67%'}</Text>
    </Box>
  );
});

/**
 * Static content below the banner (memoized to prevent flicker)
 */
const StaticContent = memo(function StaticContent(): React.ReactElement {
  const buttonText = ' Get Started ';

  return (
    <>
      <Text> </Text>
      <Text>
        {'  '}
        {theme.muted('Terminal colors that adapt to YOUR theme')}
      </Text>
      <Text> </Text>

      <DerivedColors />
      <Text> </Text>

      <Text>{theme.white.bold()('  Example UI with derived colors:')}</Text>
      <Text> </Text>

      <Box>
        <Text>{'  '}</Text>
        <Text>{theme.white.bold().on(theme.green.darken(0.1))(buttonText)}</Text>
        <Text>{'  '}</Text>
        <Text>{theme.white.on(theme.blue)(buttonText)}</Text>
        <Text>{'  '}</Text>
        <Text>{theme.white.on(theme.magenta.darken(0.1))(buttonText)}</Text>
      </Box>
      <Text> </Text>

      <Text>
        {'  '}
        {theme.green('●')} {theme.green.lighten(0.1)('System Online')}
        {'     '}
        {theme.yellow('●')} {theme.yellow.lighten(0.1)('2 Warnings')}
        {'     '}
        {theme.red('●')} {theme.red.lighten(0.1)('1 Error')}
      </Text>
      <Text> </Text>

      <ProgressBar />
      <Text> </Text>

      <Text>{theme.muted('  All colors derived from your terminal theme.')}</Text>
      <Text> </Text>
    </>
  );
});

/**
 * Main showcase component
 */
function Showcase({ animate }: { animate: boolean }): React.ReactElement {
  // Add padding before/after shine so we get a clean sweep with pause at ends
  const SHINE_START = -30;
  const SHINE_END = BANNER_WIDTH + 30;
  const [shinePos, setShinePos] = useState(SHINE_START);

  useEffect(() => {
    if (!animate) return;

    const interval = setInterval(() => {
      setShinePos((pos) => {
        const next = pos + 2;
        if (next > SHINE_END) {
          return SHINE_START;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [animate]);

  return (
    <Box flexDirection="column" paddingTop={1}>
      {/* Top gradient bar */}
      <Box marginLeft={2}>
        <GradientBar width={56} baseColor="cyan" />
      </Box>
      <Text> </Text>

      {/* Banner */}
      <ShiningBanner shinePos={animate ? shinePos : 28} />

      <Text> </Text>
      {/* Bottom gradient bar */}
      <Box marginLeft={2}>
        <GradientBar width={56} baseColor="cyan" />
      </Box>

      {/* Static content below (memoized) */}
      <StaticContent />
    </Box>
  );
}

// Check for --animate flag
const animate = process.argv.includes('--animate');

render(<Showcase animate={animate} />);
