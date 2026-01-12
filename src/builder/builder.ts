import type { ColorState, ColorTransform, ColorModifiers } from './types.js';
import { renderColor } from './render.js';

/**
 * A fluent color builder that supports transformations, modifiers, and composition.
 *
 * The Color class is callable - you can use it as a function to colorize text:
 * ```typescript
 * const red = theme.red;
 * console.log(red('Hello')); // Prints 'Hello' in red
 * ```
 *
 * @public
 */
export interface Color {
  // HSV transformations (amounts are -1.0 to +1.0)
  /**
   * Increases color saturation.
   * @param amount - Amount to saturate (-1.0 to +1.0)
   * @returns A new Color instance with the transformation applied
   */
  saturate(amount: number): Color;

  /**
   * Decreases color saturation.
   * @param amount - Amount to desaturate (-1.0 to +1.0)
   * @returns A new Color instance with the transformation applied
   */
  desaturate(amount: number): Color;

  /**
   * Increases color lightness.
   * @param amount - Amount to lighten (-1.0 to +1.0)
   * @returns A new Color instance with the transformation applied
   */
  lighten(amount: number): Color;

  /**
   * Decreases color lightness.
   * @param amount - Amount to darken (-1.0 to +1.0)
   * @returns A new Color instance with the transformation applied
   */
  darken(amount: number): Color;

  /**
   * Rotates the hue by the specified degrees.
   * @param degrees - Degrees to rotate (can be any number)
   * @returns A new Color instance with the transformation applied
   */
  rotate(degrees: number): Color;

  /**
   * Fades the color toward the background, creating an opacity effect.
   *
   * When applied to a foreground color:
   * - If the color has an explicit background (via `.on()`), fades toward that background
   * - Otherwise, fades toward the terminal's background color
   *
   * When applied to a background color used in `.on()`:
   * - Fades toward the terminal's background color
   *
   * @param amount - Amount to fade (0.0 = fully opaque, 1.0 = fully transparent/faded)
   * @returns A new Color instance with the fade transformation applied
   */
  fade(amount: number): Color;

  // Foreground/background composition
  /**
   * Sets the background color.
   * @param background - The background color
   * @returns A new Color instance with the background applied
   */
  on(background: Color): Color;

  /**
   * Swaps foreground and background colors.
   * @returns A new Color instance with colors inverted
   */
  inverse(): Color;

  // Text modifiers (ANSI SGR attributes)
  /**
   * Makes text bold.
   * @returns A new Color instance with bold applied
   */
  bold(): Color;

  /**
   * Makes text dim.
   * @returns A new Color instance with dim applied
   */
  dim(): Color;

  /**
   * Makes text italic.
   * @returns A new Color instance with italic applied
   */
  italic(): Color;

  /**
   * Makes text underlined.
   * @returns A new Color instance with underline applied
   */
  underline(): Color;

  /**
   * Makes text strikethrough.
   * @returns A new Color instance with strikethrough applied
   */
  strikethrough(): Color;

  /**
   * Makes text hidden.
   * @returns A new Color instance with hidden applied
   */
  hidden(): Color;

  // Terminal rendering (callable - returns styled string)
  /**
   * Colorizes the given text.
   * @param text - The text to colorize
   * @returns The colorized text with ANSI escape codes
   */
  (text: string): string;

  // Introspection
  /**
   * The resolved RGB value, or null if not available.
   */
  readonly rgb: [number, number, number] | null;

  /**
   * The ANSI color index (0-15).
   */
  readonly ansi: number;
}

/**
 * Internal symbol to access color state from a Color instance.
 * @internal
 */
const stateSymbol = Symbol('colorState');

/**
 * Extracts the ColorState from a Color instance.
 * @internal
 */
export function getColorState(color: Color): ColorState {
  const state = (color as unknown as Record<symbol, ColorState>)[stateSymbol];
  if (state === undefined) {
    throw new Error('Invalid Color instance: missing state');
  }
  return state;
}

/**
 * Creates a new Color instance with a transformation added.
 */
function addTransform(state: ColorState, type: ColorTransform['type'], amount: number): Color {
  const newState: ColorState = {
    ...state,
    transforms: [...state.transforms, { type, amount }],
  };
  return createColor(newState);
}

/**
 * Creates a new Color instance with a modifier applied.
 */
function addModifier(state: ColorState, modifier: keyof ColorModifiers): Color {
  const newState: ColorState = {
    ...state,
    modifiers: {
      ...state.modifiers,
      [modifier]: true,
    },
  };
  return createColor(newState);
}

/**
 * Creates a new Color instance from the given state.
 *
 * @param state - The color state
 * @returns A new Color instance
 *
 * @internal
 */
export function createColor(state: ColorState): Color {
  // Create a callable function object with Color methods
  const colorFunction = function (text: string): string {
    return renderColor(state, text);
  };

  // Add state symbol for internal access
  Object.defineProperty(colorFunction, stateSymbol, {
    value: state,
    enumerable: false,
    writable: false,
  });

  // Add transform methods
  colorFunction.saturate = (amount: number) => addTransform(state, 'saturate', amount);
  colorFunction.desaturate = (amount: number) => addTransform(state, 'desaturate', amount);
  colorFunction.lighten = (amount: number) => addTransform(state, 'lighten', amount);
  colorFunction.darken = (amount: number) => addTransform(state, 'darken', amount);
  colorFunction.rotate = (degrees: number) => addTransform(state, 'rotate', degrees);
  colorFunction.fade = (amount: number) => addTransform(state, 'fade', amount);

  // Add composition methods
  colorFunction.on = (background: Color) => {
    // Extract state from background
    const bgState = (background as unknown as Record<symbol, ColorState>)[stateSymbol] ?? null;
    const newState: ColorState = {
      ...state,
      background: bgState,
    };
    return createColor(newState);
  };

  colorFunction.inverse = () => addModifier(state, 'inverse');

  // Add modifier methods
  colorFunction.bold = () => addModifier(state, 'bold');
  colorFunction.dim = () => addModifier(state, 'dim');
  colorFunction.italic = () => addModifier(state, 'italic');
  colorFunction.underline = () => addModifier(state, 'underline');
  colorFunction.strikethrough = () => addModifier(state, 'strikethrough');
  colorFunction.hidden = () => addModifier(state, 'hidden');

  // Add introspection properties
  Object.defineProperty(colorFunction, 'rgb', {
    get(): [number, number, number] | null {
      if (state.baseRgb === null) {
        return null;
      }
      const { r, g, b } = state.baseRgb;
      return [r, g, b];
    },
    enumerable: true,
  });

  Object.defineProperty(colorFunction, 'ansi', {
    get(): number {
      return state.ansiIndex;
    },
    enumerable: true,
  });

  return colorFunction as Color;
}
