import type { Theme } from '../../src/theme/index.js';
import type { ScenarioResult } from './basic-colors.js';

type ColorName = 'red' | 'green' | 'blue' | 'yellow' | 'magenta' | 'cyan';

export function transformsScenario(theme: Theme): ScenarioResult {
  let output = '';

  // Show original and transformed colors side by side
  const colors: ColorName[] = ['red', 'green', 'blue', 'yellow', 'magenta', 'cyan'];

  // Saturate
  output += 'Saturate +0.3:\n';
  for (const name of colors) {
    const base = theme[name];
    const transformed = base.saturate(0.3);
    output += `  ${base(name.padEnd(8))} → ${transformed(`${name} +sat`)}` + '\n';
  }

  // Lighten
  output += '\nLighten +0.2:\n';
  for (const name of colors) {
    const base = theme[name];
    const transformed = base.lighten(0.2);
    output += `  ${base(name.padEnd(8))} → ${transformed(`${name} +light`)}` + '\n';
  }

  // Darken
  output += '\nDarken -0.2:\n';
  for (const name of colors) {
    const base = theme[name];
    const transformed = base.darken(0.2);
    output += `  ${base(name.padEnd(8))} → ${transformed(`${name} +dark`)}` + '\n';
  }

  // Rotate
  output += '\nRotate +30°:\n';
  for (const name of colors) {
    const base = theme[name];
    const transformed = base.rotate(30);
    output += `  ${base(name.padEnd(8))} → ${transformed(`${name} +30°`)}` + '\n';
  }

  return {
    name: 'Color Transforms',
    description: 'Transformed colors should show visible changes from base colors',
    output,
  };
}
