/**
 * ChromaTerm - Terminal color library
 *
 * @packageDocumentation
 */

/**
 * The current version of ChromaTerm
 *
 * @public
 */
export const VERSION: string = '0.0.0';

export * from './capability/index.js';
export * from './color/index.js';
export * from './types.js';
export * from './builder/index.js';
export * from './theme/index.js';
export * from './probe/index.js';
export * from './config/index.js';

// Absolute colors (chalk re-export)
export { abs } from './abs/index.js';
export type { ChalkInstance } from './abs/index.js';
