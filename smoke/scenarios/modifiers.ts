import type { Theme } from '../../src/theme/index.js';
import type { ScenarioResult } from './basic-colors.js';

export function modifiersScenario(theme: Theme): ScenarioResult {
  let output = '';

  // Show text modifiers
  output += 'Text Styles:\n';
  output += `  ${theme.red.bold()('bold')}  `;
  output += `${theme.green.dim()('dim')}  `;
  output += `${theme.blue.italic()('italic')}  `;
  output += `${theme.yellow.underline()('underline')}  `;
  output += theme.magenta.strikethrough()('strikethrough');
  output += '\n';

  // Show combinations
  output += '\nCombinations:\n';
  output += `  ${theme.red.bold().underline()('bold + underline')}  `;
  output += theme.blue.italic().bold()('italic + bold');
  output += '\n';

  return {
    name: 'Text Modifiers',
    description: 'Bold, italic, underline, and other text modifiers',
    output,
  };
}
