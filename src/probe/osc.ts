/**
 * Generate OSC query for a single palette color.
 *
 * Generates a query in the format: ESC ] 4 ; <index> ; ? BEL
 *
 * @param index - The palette color index (0-15 for ANSI colors)
 * @returns The OSC query sequence
 *
 * @internal
 */
export function generateColorQuery(index: number): string {
  return `\x1b]4;${index.toString()};?\x07`;
}

/**
 * Generate OSC query for the terminal's default foreground color.
 *
 * Generates a query in the format: ESC ] 10 ; ? BEL
 *
 * @returns The OSC query sequence
 *
 * @internal
 */
export function generateForegroundQuery(): string {
  return '\x1b]10;?\x07';
}

/**
 * Generate OSC query for the terminal's default background color.
 *
 * Generates a query in the format: ESC ] 11 ; ? BEL
 *
 * @returns The OSC query sequence
 *
 * @internal
 */
export function generateBackgroundQuery(): string {
  return '\x1b]11;?\x07';
}

/**
 * Generate all palette queries in a single batch string.
 *
 * Generates queries for all 16 ANSI colors, plus foreground and background.
 *
 * @returns All OSC query sequences concatenated
 *
 * @internal
 */
export function generateAllQueries(): string {
  let queries = '';

  // Query all 16 ANSI colors
  for (let i = 0; i < 16; i++) {
    queries += `\x1b]4;${i.toString()};?\x07`;
  }

  // Query foreground and background
  queries += generateForegroundQuery();
  queries += generateBackgroundQuery();

  return queries;
}
