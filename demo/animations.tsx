#!/usr/bin/env tsx
/**
 * ChromaTerm Animation Demo
 *
 * Showcases animated color effects using ChromaTerm transforms.
 * Run with: pnpm demo:animations
 */

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useApp, useInput, useStdin } from 'ink';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Resolve paths relative to this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, '..', 'dist', 'index.js');

// Dynamic import for ChromaTerm
const { detectTheme } = (await import(distPath)) as typeof import('../dist/index.js');
import type { Theme, Color } from '../dist/index.js';

// Initialize theme
const theme = await detectTheme();

// ═══════════════════════════════════════════════════════════════════════════
// Animation Components
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Flowing gradient that shifts hue across text over time
 */
function FlowingGradient({
  text,
  speed = 50,
}: {
  text: string;
  speed?: number;
}): React.ReactElement {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((o) => (o + 10) % 360);
    }, speed);
    return () => clearInterval(interval);
  }, [speed]);

  const chars = text.split('').map((char, i) => {
    const hue = (offset + i * 15) % 360;
    const colored = theme.red.rotate(hue)(char);
    return <Text key={i}>{colored}</Text>;
  });

  return <Box>{chars}</Box>;
}

/**
 * Text that pulses opacity in and out
 */
function PulsingText({
  text,
  color,
  speed = 80,
}: {
  text: string;
  color: Color;
  speed?: number;
}): React.ReactElement {
  const [opacity, setOpacity] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity((o) => {
        const next = o + direction * 0.05;
        if (next >= 1) {
          setDirection(-1);
          return 1;
        }
        if (next <= 0) {
          setDirection(1);
          return 0;
        }
        return next;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [direction, speed]);

  // fade amount is inverse of opacity (fade(1) = invisible, fade(0) = solid)
  const fadeAmount = 1 - opacity;
  const colored = fadeAmount > 0 ? color.fade(fadeAmount)(text) : color(text);

  return <Text>{colored}</Text>;
}

/**
 * Rainbow wave effect - each character cycles through hues with a phase offset
 */
function RainbowWave({ text, speed = 60 }: { text: string; speed?: number }): React.ReactElement {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 1);
    }, speed);
    return () => clearInterval(interval);
  }, [speed]);

  const chars = text.split('').map((char, i) => {
    // Create a wave pattern using sine
    const phase = (time * 8 + i * 25) % 360;
    const colored = theme.red.rotate(phase)(char);
    return <Text key={i}>{colored}</Text>;
  });

  return <Box>{chars}</Box>;
}

/**
 * Text that breathes between saturated and desaturated
 */
function BreathingSaturation({
  text,
  color,
  speed = 100,
}: {
  text: string;
  color: Color;
  speed?: number;
}): React.ReactElement {
  const [saturation, setSaturation] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setSaturation((s) => {
        const next = s + direction * 0.05;
        if (next >= 0.5) {
          setDirection(-1);
          return 0.5;
        }
        if (next <= -0.5) {
          setDirection(1);
          return -0.5;
        }
        return next;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [direction, speed]);

  const colored =
    saturation >= 0 ? color.saturate(saturation)(text) : color.desaturate(-saturation)(text);

  return <Text>{colored}</Text>;
}

/**
 * Sparkle effect - random characters briefly lighten
 */
function SparkleText({
  text,
  color,
  speed = 100,
}: {
  text: string;
  color: Color;
  speed?: number;
}): React.ReactElement {
  const [sparkles, setSparkles] = useState<Set<number>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add 1-3 sparkles
      const newSparkles = new Set<number>();
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        newSparkles.add(Math.floor(Math.random() * text.length));
      }
      setSparkles(newSparkles);
    }, speed);
    return () => clearInterval(interval);
  }, [text.length, speed]);

  const chars = text.split('').map((char, i) => {
    const isSparkle = sparkles.has(i);
    const colored = isSparkle ? color.lighten(0.4)(char) : color(char);
    return <Text key={i}>{colored}</Text>;
  });

  return <Box>{chars}</Box>;
}

/**
 * Loading bar with gradient fill
 */
function GradientLoader({
  width = 30,
  speed = 50,
}: {
  width?: number;
  speed?: number;
}): React.ReactElement {
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + direction * 2;
        if (next >= 100) {
          setDirection(-1);
          return 100;
        }
        if (next <= 0) {
          setDirection(1);
          return 0;
        }
        return next;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [direction, speed]);

  const filled = Math.floor((progress / 100) * width);
  const chars: React.ReactElement[] = [];

  for (let i = 0; i < width; i++) {
    if (i < filled) {
      // Gradient from cyan to green based on position
      const hue = 180 - (i / width) * 60; // cyan (180) to green (120)
      chars.push(<Text key={i}>{theme.cyan.rotate(hue - 180)('█')}</Text>);
    } else {
      chars.push(<Text key={i}>{theme.brightBlack('░')}</Text>);
    }
  }

  return (
    <Box>
      <Text>[</Text>
      {chars}
      <Text>] {String(progress).padStart(3)}%</Text>
    </Box>
  );
}

/**
 * Typewriter effect with color
 */
function TypewriterText({
  text,
  color,
  speed = 100,
}: {
  text: string;
  color: Color;
  speed?: number;
}): React.ReactElement {
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (length < text.length) {
      const timeout = setTimeout(() => {
        setLength((l) => l + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      // Reset after a pause
      const timeout = setTimeout(() => {
        setLength(0);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [length, text.length, speed]);

  const visible = text.slice(0, length);
  const cursor = length < text.length ? '▌' : '';

  return (
    <Text>
      {color(visible)}
      {theme.brightWhite(cursor)}
    </Text>
  );
}

/**
 * Fire effect - text with flickering warm colors
 */
function FireText({ text, speed = 80 }: { text: string; speed?: number }): React.ReactElement {
  const [flicker, setFlicker] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Generate random flicker values for each character
      setFlicker(text.split('').map(() => Math.random()));
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  const chars = text.split('').map((char, i) => {
    const f = flicker[i] ?? 0.5;
    // Vary between red, orange, and yellow
    const hue = f * 60; // 0 = red, 30 = orange, 60 = yellow
    const lightness = f * 0.2; // Add some brightness variation
    const colored = theme.red.rotate(hue).lighten(lightness)(char);
    return <Text key={i}>{colored}</Text>;
  });

  return <Box>{chars}</Box>;
}

/**
 * Rotating alarm light effect - a brightness gradient sweeps across the background like a beacon
 */
function AlarmLight({
  text,
  speed = 40,
  beamWidth = 6,
}: {
  text: string;
  speed?: number;
  beamWidth?: number;
}): React.ReactElement {
  const [beamPos, setBeamPos] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBeamPos((p) => (p + 1) % (text.length + beamWidth * 2));
    }, speed);
    return () => clearInterval(interval);
  }, [text.length, beamWidth, speed]);

  const chars = text.split('').map((char, i) => {
    // Calculate distance from beam center
    const distance = Math.abs(i - (beamPos - beamWidth));

    // Create brightness falloff - closer to beam = brighter
    let brightness: number;
    if (distance < beamWidth) {
      // Gaussian-like falloff for smooth gradient
      brightness = Math.pow(1 - distance / beamWidth, 2);
    } else {
      brightness = 0;
    }

    // Background: dark red base, beam creates bright glint
    const baseDarken = 0.3; // How dark the unlit parts are
    const lightenAmount = brightness * 0.6; // How bright the glint gets

    let bgColor;
    if (brightness > 0.8) {
      // Hot center - brightest red
      bgColor = theme.red.lighten(0.4);
    } else if (brightness > 0) {
      // Gradient from dark red to bright
      bgColor = theme.red.darken(baseDarken * (1 - brightness)).lighten(lightenAmount);
    } else {
      // Unlit - dark red
      bgColor = theme.red.darken(baseDarken);
    }

    // White text on the red background gradient
    const colored = theme.white.bold().on(bgColor)(char);

    return <Text key={i}>{colored}</Text>;
  });

  return <Box>{chars}</Box>;
}

// ═══════════════════════════════════════════════════════════════════════════
// Main App
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Input handler that only activates when raw mode is supported
 */
function InputHandler(): null {
  const { exit } = useApp();

  useInput((input, key) => {
    if (input === 'q' || key.escape) {
      exit();
    }
  });

  return null;
}

function App(): React.ReactElement {
  const { isRawModeSupported } = useStdin();

  return (
    <Box flexDirection="column" padding={1}>
      {isRawModeSupported && <InputHandler />}

      <Box marginBottom={1}>
        <Text bold>
          {theme.cyan('ChromaTerm')} {theme.muted('Animation Demo')}
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text dimColor>
          {isRawModeSupported ? "Press 'q' or ESC to exit" : 'Press Ctrl+C to exit'}
        </Text>
      </Box>

      <Box flexDirection="column" gap={1}>
        {/* Flowing Gradient */}
        <Box>
          <Box width={20}>
            <Text>{theme.muted('Flowing Gradient:')}</Text>
          </Box>
          <FlowingGradient text="ChromaTerm brings color to life" />
        </Box>

        {/* Rainbow Wave */}
        <Box>
          <Box width={20}>
            <Text>{theme.muted('Rainbow Wave:')}</Text>
          </Box>
          <RainbowWave text="Surfing the color spectrum" />
        </Box>

        {/* Pulsing Opacity */}
        <Box>
          <Box width={20}>
            <Text>{theme.muted('Pulsing Opacity:')}</Text>
          </Box>
          <PulsingText text="Fading in and out..." color={theme.cyan} />
        </Box>

        {/* Breathing Saturation */}
        <Box>
          <Box width={20}>
            <Text>{theme.muted('Breathing Color:')}</Text>
          </Box>
          <BreathingSaturation text="Vivid to muted and back" color={theme.magenta} />
        </Box>

        {/* Sparkle Effect */}
        <Box>
          <Box width={20}>
            <Text>{theme.muted('Sparkle Effect:')}</Text>
          </Box>
          <SparkleText text="Twinkling like stars at night" color={theme.blue} />
        </Box>

        {/* Alarm Light */}
        <Box>
          <Box width={20}>
            <Text>{theme.muted('Alarm Light:')}</Text>
          </Box>
          <AlarmLight text="ALERT! System requires attention" />
        </Box>

        {/* Fire Effect */}
        <Box>
          <Box width={20}>
            <Text>{theme.muted('Fire Effect:')}</Text>
          </Box>
          <FireText text="Burning with intensity" />
        </Box>

        {/* Typewriter */}
        <Box>
          <Box width={20}>
            <Text>{theme.muted('Typewriter:')}</Text>
          </Box>
          <TypewriterText text="Terminal colors that adapt to you..." color={theme.green} />
        </Box>

        {/* Gradient Loader */}
        <Box>
          <Box width={20}>
            <Text>{theme.muted('Gradient Loader:')}</Text>
          </Box>
          <GradientLoader />
        </Box>
      </Box>

      <Box marginTop={2}>
        <Text dimColor>
          These animations use ChromaTerm's {theme.yellow('rotate')}, {theme.yellow('fade')},{' '}
          {theme.yellow('saturate')}, and {theme.yellow('lighten')} transforms.
        </Text>
      </Box>
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Entry Point
// ═══════════════════════════════════════════════════════════════════════════

render(<App />);
