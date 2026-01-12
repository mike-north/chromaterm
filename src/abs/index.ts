/**
 * Absolute colors via chalk.
 *
 * Use `abs` when you need exact color values that don't adapt to the user's theme.
 * For theme-relative colors that harmonize with the terminal palette, use the Theme API.
 *
 * The `abs` export provides direct access to chalk's color methods without requiring
 * a separate chalk installation. This is useful for:
 * - Brand colors that must match exact specifications
 * - Color values specified in design systems
 * - Cases where you need precise RGB/hex values
 *
 * @example
 * ```typescript
 * import { abs } from 'chromaterm';
 *
 * // Exact hex color
 * console.log(abs.hex('#ff6600')('Orange text'));
 *
 * // Exact RGB color
 * console.log(abs.rgb(255, 128, 0)('Also orange'));
 *
 * // Standard chalk methods
 * console.log(abs.red('Red text'));
 * console.log(abs.bgBlue.white('White on blue'));
 *
 * // Chaining styles
 * console.log(abs.bold.underline.hex('#ff00ff')('Styled text'));
 * ```
 *
 * @remarks
 * The `abs` export is simply a re-export of chalk. All chalk methods and functionality
 * are available through this export.
 *
 * @public
 */

// Use import = require syntax for CommonJS modules without esModuleInterop
// eslint-disable-next-line @typescript-eslint/no-require-imports
import chalk = require('chalk');

/**
 * Re-export of chalk for absolute color support
 *
 * @public
 */
export const abs = chalk;

// Re-export chalk types for convenience
/**
 * The Chalk instance type
 *
 * @public
 */
export type ChalkInstance = chalk.Chalk;

/**
 * Color support information
 *
 * @public
 */
export type ColorSupport = chalk.ColorSupport;
