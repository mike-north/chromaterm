import type { Theme } from '../../src/theme/index.js';
import type { ScenarioResult } from './basic-colors.js';

export function backgroundsScenario(theme: Theme): ScenarioResult {
  let output = '';

  // Show background colors
  output += 'Background Colors:\n';
  output += `  ${theme.white.on(theme.red)(' on red ')}  `;
  output += `${theme.white.on(theme.green)(' on green ')}  `;
  output += `${theme.white.on(theme.blue)(' on blue ')}  `;
  output += theme.black.on(theme.yellow)(' on yellow ');
  output += '\n';

  // Show inverse
  output += '\nInverse:\n';
  output += `  ${theme.red('normal')}  ${theme.red.inverse()('inverse')}`;
  output += '\n';

  return {
    name: 'Background Colors',
    description: 'Text on colored backgrounds and inverse rendering',
    output,
  };
}
