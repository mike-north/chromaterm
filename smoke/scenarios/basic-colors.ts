import type { Theme } from '../../src/theme/index.js';

export interface ScenarioResult {
  name: string;
  description: string;
  output: string;
}

type ColorName =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'brightBlack'
  | 'brightRed'
  | 'brightGreen'
  | 'brightYellow'
  | 'brightBlue'
  | 'brightMagenta'
  | 'brightCyan'
  | 'brightWhite';

export function basicColorsScenario(theme: Theme): ScenarioResult {
  let output = '';

  // Build output showing all colors
  const colors: ColorName[] = [
    'black',
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white',
  ];

  output += 'Normal:\n';
  for (const name of colors) {
    output += theme[name](`  ${name.padEnd(10)}  `) + '\n';
  }

  output += '\nBright:\n';
  const brightColors: ColorName[] = [
    'brightBlack',
    'brightRed',
    'brightGreen',
    'brightYellow',
    'brightBlue',
    'brightMagenta',
    'brightCyan',
    'brightWhite',
  ];
  for (const name of brightColors) {
    const shortName = name.replace('bright', 'br');
    output += theme[name](`  ${shortName.padEnd(10)}  `) + '\n';
  }

  return {
    name: 'Basic Colors',
    description: 'All 16 ANSI colors should match your terminal theme',
    output,
  };
}
