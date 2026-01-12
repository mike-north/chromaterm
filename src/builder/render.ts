import * as chalk from 'chalk';
import type { Chalk } from 'chalk';
import type { ColorState, ColorTransform } from './types.js';
import type { RGB, AnsiColorIndex } from '../types.js';
import { saturate, desaturate, lighten, darken, rotate } from '../color/transforms.js';
import { rgbToAnsi256 } from '../color/quantize.js';

/**
 * Creates a chalk instance with the appropriate color level.
 *
 * @param colorLevel - The color capability level
 * @returns A chalk instance configured for that level
 *
 * @internal
 */
function getChalkInstance(colorLevel: 'none' | 'ansi16' | 'ansi256' | 'truecolor'): Chalk {
  // Chalk 4.x uses Instance() to create new instances with specific levels
  switch (colorLevel) {
    case 'none':
      return new chalk.Instance({ level: 0 });
    case 'ansi16':
      return new chalk.Instance({ level: 1 });
    case 'ansi256':
      return new chalk.Instance({ level: 2 });
    case 'truecolor':
      return new chalk.Instance({ level: 3 });
  }
}

/**
 * Renders colored text using the current color state.
 *
 * @param state - The color state to render
 * @param text - The text to colorize
 * @returns The colored text with ANSI escape codes
 *
 * @internal
 */
export function renderColor(state: ColorState, text: string): string {
  const { capabilities, modifiers, ansiIndex, baseRgb, transforms, background } = state;

  // If no color support, return plain text
  if (capabilities.color === 'none') {
    return text;
  }

  // Resolve foreground color (apply transforms if T3)
  let fgRgb = baseRgb;
  if (fgRgb !== null && transforms.length > 0) {
    // Apply transforms in order
    for (const transform of transforms) {
      fgRgb = applyTransform(fgRgb, transform);
    }
  }

  // Resolve background color (apply transforms if T3)
  let bgRgb: RGB | null = null;
  if (background !== null) {
    bgRgb = background.baseRgb;
    if (bgRgb !== null && background.transforms.length > 0) {
      for (const transform of background.transforms) {
        bgRgb = applyTransform(bgRgb, transform);
      }
    }
  }

  // Get chalk instance with appropriate color level
  let chalkInstance: Chalk = getChalkInstance(capabilities.color);

  // Render based on C-level and availability of RGB data
  if (capabilities.color === 'truecolor' && fgRgb !== null) {
    // T3 with truecolor: use RGB directly
    chalkInstance = chalkInstance.rgb(fgRgb.r, fgRgb.g, fgRgb.b);
  } else if (capabilities.color === 'ansi256' && fgRgb !== null) {
    // T3 with ANSI-256: quantize to 256-color palette
    const ansi256Index = rgbToAnsi256(fgRgb);
    chalkInstance = chalkInstance.ansi256(ansi256Index);
  } else {
    // T1 fallback: use ANSI-16 index
    chalkInstance = applyForeground(chalkInstance, ansiIndex);
  }

  // Apply background
  if (background !== null) {
    if (capabilities.color === 'truecolor' && bgRgb !== null) {
      chalkInstance = chalkInstance.bgRgb(bgRgb.r, bgRgb.g, bgRgb.b);
    } else if (capabilities.color === 'ansi256' && bgRgb !== null) {
      const bgAnsi256Index = rgbToAnsi256(bgRgb);
      chalkInstance = chalkInstance.bgAnsi256(bgAnsi256Index);
    } else {
      chalkInstance = applyBackground(chalkInstance, background.ansiIndex);
    }
  }

  // Apply modifiers
  if (modifiers.bold === true) chalkInstance = chalkInstance.bold;
  if (modifiers.dim === true) chalkInstance = chalkInstance.dim;
  if (modifiers.italic === true) chalkInstance = chalkInstance.italic;
  if (modifiers.underline === true) chalkInstance = chalkInstance.underline;
  if (modifiers.strikethrough === true) chalkInstance = chalkInstance.strikethrough;
  if (modifiers.hidden === true) chalkInstance = chalkInstance.hidden;
  if (modifiers.inverse === true) chalkInstance = chalkInstance.inverse;

  return chalkInstance(text);
}

/**
 * Applies a single transform to an RGB color.
 *
 * @param rgb - The base RGB color
 * @param transform - The transform to apply
 * @returns The transformed RGB color
 *
 * @internal
 */
function applyTransform(rgb: RGB, transform: ColorTransform): RGB {
  switch (transform.type) {
    case 'saturate':
      return saturate(rgb, transform.amount);
    case 'desaturate':
      return desaturate(rgb, transform.amount);
    case 'lighten':
      return lighten(rgb, transform.amount);
    case 'darken':
      return darken(rgb, transform.amount);
    case 'rotate':
      return rotate(rgb, transform.amount);
  }
}

/**
 * Applies foreground color to a chalk instance using ANSI-16.
 *
 * @param chalkInstance - The chalk instance to modify
 * @param ansiIndex - The ANSI color index (0-15)
 * @returns The modified chalk instance
 *
 * @internal
 */
function applyForeground(chalkInstance: Chalk, ansiIndex: AnsiColorIndex): Chalk {
  // Map ANSI index to chalk color method
  // 0-7 = standard colors, 8-15 = bright colors
  const colorMap: Record<AnsiColorIndex, keyof Chalk> = {
    0: 'black',
    1: 'red',
    2: 'green',
    3: 'yellow',
    4: 'blue',
    5: 'magenta',
    6: 'cyan',
    7: 'white',
    8: 'blackBright',
    9: 'redBright',
    10: 'greenBright',
    11: 'yellowBright',
    12: 'blueBright',
    13: 'magentaBright',
    14: 'cyanBright',
    15: 'whiteBright',
  };

  const colorMethod = colorMap[ansiIndex];
  return chalkInstance[colorMethod] as Chalk;
}

/**
 * Applies background color to a chalk instance using ANSI-16.
 *
 * @param chalkInstance - The chalk instance to modify
 * @param ansiIndex - The ANSI color index (0-15)
 * @returns The modified chalk instance
 *
 * @internal
 */
function applyBackground(chalkInstance: Chalk, ansiIndex: AnsiColorIndex): Chalk {
  // Map ANSI index to chalk background color method
  const backgroundMap: Record<AnsiColorIndex, keyof Chalk> = {
    0: 'bgBlack',
    1: 'bgRed',
    2: 'bgGreen',
    3: 'bgYellow',
    4: 'bgBlue',
    5: 'bgMagenta',
    6: 'bgCyan',
    7: 'bgWhite',
    8: 'bgBlackBright',
    9: 'bgRedBright',
    10: 'bgGreenBright',
    11: 'bgYellowBright',
    12: 'bgBlueBright',
    13: 'bgMagentaBright',
    14: 'bgCyanBright',
    15: 'bgWhiteBright',
  };

  const bgMethod = backgroundMap[ansiIndex];
  return chalkInstance[bgMethod] as Chalk;
}
