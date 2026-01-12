import type { RGB } from '../types.js';

/**
 * Type of OSC response.
 *
 * @internal
 */
type ResponseType = 'color' | 'foreground' | 'background';

/**
 * A parsed OSC response.
 *
 * @internal
 */
export interface ParsedResponse {
  /** Type of the response */
  type: ResponseType;
  /** Palette index (only for 'color' type) */
  index?: number;
  /** The RGB color value */
  rgb: RGB;
}

/**
 * Convert a 16-bit hex string to an 8-bit value.
 *
 * Takes the high 8 bits (first 2 hex chars) of a 4-char hex string,
 * or uses the entire value if it's already 2 chars.
 *
 * @param hex - The hex string (2 or 4 characters)
 * @returns The 8-bit value (0-255)
 *
 * @internal
 */
export function hex16To8(hex: string): number {
  // If already 8-bit (2 chars), use as-is
  // Otherwise take first 2 chars of 16-bit (4 chars)
  const hex8 = hex.length === 2 ? hex : hex.slice(0, 2);
  return parseInt(hex8, 16);
}

/**
 * Parse a single OSC response.
 *
 * Handles both BEL (\x07) and ST (\x1b\\) terminators.
 * Response format: ESC ] <code> ; [<index> ;] rgb:<rrrr>/<gggg>/<bbbb> <terminator>
 *
 * @param response - The raw OSC response string
 * @returns The parsed response, or null if malformed
 *
 * @internal
 */
export function parseOscResponse(response: string): ParsedResponse | null {
  // OSC responses can end with BEL (\x07) or ST (\x1b\\)
  // Strip terminators for easier parsing
  // eslint-disable-next-line no-control-regex
  const cleaned = response.replace(/[\x07]$/, '').replace(/\x1b\\$/, '');

  // Must start with ESC ]
  if (!cleaned.startsWith('\x1b]')) {
    return null;
  }

  // Remove ESC ] prefix
  const content = cleaned.slice(2);

  // Split by semicolons: <code> ; [<index> ;] rgb:...
  const parts = content.split(';');

  if (parts.length < 2) {
    return null;
  }

  const code = parts[0];
  const rgbPart = parts[parts.length - 1]; // RGB is always last

  // Extract RGB values from format: rgb:rrrr/gggg/bbbb
  const rgbMatch = rgbPart?.match(/rgb:([0-9a-fA-F]+)\/([0-9a-fA-F]+)\/([0-9a-fA-F]+)/);

  if (!rgbMatch?.[1] || !rgbMatch[2] || !rgbMatch[3]) {
    return null;
  }

  const rgb: RGB = {
    r: hex16To8(rgbMatch[1]),
    g: hex16To8(rgbMatch[2]),
    b: hex16To8(rgbMatch[3]),
  };

  // Determine response type based on OSC code
  if (code === '4') {
    // Color query: ESC ] 4 ; <index> ; rgb:...
    if (parts.length < 3 || !parts[1]) {
      return null;
    }
    const index = parseInt(parts[1], 10);
    if (isNaN(index)) {
      return null;
    }
    return { type: 'color', index, rgb };
  } else if (code === '10') {
    // Foreground: ESC ] 10 ; rgb:...
    return { type: 'foreground', rgb };
  } else if (code === '11') {
    // Background: ESC ] 11 ; rgb:...
    return { type: 'background', rgb };
  }

  return null;
}

/**
 * Parse multiple OSC responses from a buffer.
 *
 * Splits the buffer on ESC ] sequences and parses each response.
 *
 * @param buffer - The accumulated response buffer
 * @returns Array of parsed responses
 *
 * @internal
 */
export function parseOscResponses(buffer: string): ParsedResponse[] {
  const responses: ParsedResponse[] = [];

  // Split on ESC ] but keep the delimiter
  // We need to look for sequences that start with ESC ]
  // eslint-disable-next-line no-control-regex
  const parts = buffer.split(/(?=\x1b\])/);

  for (const part of parts) {
    if (!part) continue;

    const parsed = parseOscResponse(part);
    if (parsed) {
      responses.push(parsed);
    }
  }

  return responses;
}
