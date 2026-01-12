import type { RGB, AnsiColorIndex } from '../types.js';
import type { Capabilities } from '../capability/types.js';

/**
 * A color transformation operation.
 *
 * @public
 */
export interface ColorTransform {
  /**
   * The type of transformation to apply.
   */
  type: 'saturate' | 'desaturate' | 'lighten' | 'darken' | 'rotate';
  /**
   * The amount of transformation.
   * For saturate/desaturate/lighten/darken: -1.0 to +1.0
   * For rotate: degrees (can be any number)
   */
  amount: number;
}

/**
 * Text modifiers that can be applied to colored text.
 *
 * @public
 */
export interface ColorModifiers {
  /** Bold text */
  bold?: boolean;
  /** Dimmed text */
  dim?: boolean;
  /** Italic text */
  italic?: boolean;
  /** Underlined text */
  underline?: boolean;
  /** Strikethrough text */
  strikethrough?: boolean;
  /** Hidden text */
  hidden?: boolean;
  /** Inverse video (swap fg/bg) */
  inverse?: boolean;
}

/**
 * Internal state of a Color instance.
 *
 * @internal
 */
export interface ColorState {
  /**
   * Base color as ANSI index (for T1 fallback).
   */
  ansiIndex: AnsiColorIndex;
  /**
   * Base RGB from palette (T3) or null (T1).
   */
  baseRgb: RGB | null;
  /**
   * Accumulated transforms (applied at render time if T3).
   */
  transforms: ColorTransform[];
  /**
   * Text modifiers.
   */
  modifiers: ColorModifiers;
  /**
   * Background color (for on()).
   */
  background: ColorState | null;
  /**
   * Reference to capabilities.
   */
  capabilities: Capabilities;
}
