import { describe, it, expect } from 'vitest';
import { hex16To8, parseOscResponse, parseOscResponses } from '../../src/probe/parse.js';

describe('hex16To8', () => {
  it('should convert 4-char hex by taking high 8 bits', () => {
    expect(hex16To8('cd31')).toBe(0xcd); // 205
    expect(hex16To8('ebdb')).toBe(0xeb); // 235
    expect(hex16To8('1e1e')).toBe(0x1e); // 30
  });

  it('should handle 2-char hex as-is', () => {
    expect(hex16To8('cd')).toBe(0xcd); // 205
    expect(hex16To8('eb')).toBe(0xeb); // 235
    expect(hex16To8('1e')).toBe(0x1e); // 30
  });

  it('should handle zero values', () => {
    expect(hex16To8('0000')).toBe(0);
    expect(hex16To8('00')).toBe(0);
  });

  it('should handle max values', () => {
    expect(hex16To8('ffff')).toBe(0xff); // 255
    expect(hex16To8('ff')).toBe(0xff); // 255
  });
});

describe('parseOscResponse', () => {
  describe('color responses', () => {
    it('should parse color response with BEL terminator', () => {
      const response = '\x1b]4;1;rgb:cd31/3131/3131\x07';
      const result = parseOscResponse(response);
      expect(result).toEqual({
        type: 'color',
        index: 1,
        rgb: { r: 205, g: 49, b: 49 },
      });
    });

    it('should parse color response with ST terminator', () => {
      const response = '\x1b]4;1;rgb:cd31/3131/3131\x1b\\';
      const result = parseOscResponse(response);
      expect(result).toEqual({
        type: 'color',
        index: 1,
        rgb: { r: 205, g: 49, b: 49 },
      });
    });

    it('should parse color 0 (black)', () => {
      const response = '\x1b]4;0;rgb:0000/0000/0000\x07';
      const result = parseOscResponse(response);
      expect(result).toEqual({
        type: 'color',
        index: 0,
        rgb: { r: 0, g: 0, b: 0 },
      });
    });

    it('should parse color 15 (bright white)', () => {
      const response = '\x1b]4;15;rgb:ffff/ffff/ffff\x07';
      const result = parseOscResponse(response);
      expect(result).toEqual({
        type: 'color',
        index: 15,
        rgb: { r: 255, g: 255, b: 255 },
      });
    });

    it('should handle 2-char hex format', () => {
      const response = '\x1b]4;1;rgb:cd/31/31\x07';
      const result = parseOscResponse(response);
      expect(result).toEqual({
        type: 'color',
        index: 1,
        rgb: { r: 205, g: 49, b: 49 },
      });
    });
  });

  describe('foreground responses', () => {
    it('should parse foreground response with BEL terminator', () => {
      const response = '\x1b]10;rgb:ebdb/b2b2/8585\x07';
      const result = parseOscResponse(response);
      expect(result).toEqual({
        type: 'foreground',
        rgb: { r: 235, g: 178, b: 133 },
      });
    });

    it('should parse foreground response with ST terminator', () => {
      const response = '\x1b]10;rgb:ebdb/b2b2/8585\x1b\\';
      const result = parseOscResponse(response);
      expect(result).toEqual({
        type: 'foreground',
        rgb: { r: 235, g: 178, b: 133 },
      });
    });

    it('should handle 2-char hex format', () => {
      const response = '\x1b]10;rgb:eb/b2/85\x07';
      const result = parseOscResponse(response);
      expect(result).toEqual({
        type: 'foreground',
        rgb: { r: 235, g: 178, b: 133 },
      });
    });
  });

  describe('background responses', () => {
    it('should parse background response with BEL terminator', () => {
      const response = '\x1b]11;rgb:1e1e/1e1e/1e1e\x07';
      const result = parseOscResponse(response);
      expect(result).toEqual({
        type: 'background',
        rgb: { r: 30, g: 30, b: 30 },
      });
    });

    it('should parse background response with ST terminator', () => {
      const response = '\x1b]11;rgb:1e1e/1e1e/1e1e\x1b\\';
      const result = parseOscResponse(response);
      expect(result).toEqual({
        type: 'background',
        rgb: { r: 30, g: 30, b: 30 },
      });
    });

    it('should handle 2-char hex format', () => {
      const response = '\x1b]11;rgb:1e/1e/1e\x07';
      const result = parseOscResponse(response);
      expect(result).toEqual({
        type: 'background',
        rgb: { r: 30, g: 30, b: 30 },
      });
    });
  });

  describe('malformed responses', () => {
    it('should return null for garbage input', () => {
      expect(parseOscResponse('garbage')).toBeNull();
    });

    it('should return null for incomplete response', () => {
      expect(parseOscResponse('\x1b]4;')).toBeNull();
    });

    it('should return null for missing RGB', () => {
      expect(parseOscResponse('\x1b]4;1;\x07')).toBeNull();
    });

    it('should return null for invalid RGB format', () => {
      expect(parseOscResponse('\x1b]4;1;notrgb\x07')).toBeNull();
    });

    it('should return null for color response missing index', () => {
      expect(parseOscResponse('\x1b]4;rgb:ff/ff/ff\x07')).toBeNull();
    });

    it('should return null for unknown OSC code', () => {
      expect(parseOscResponse('\x1b]99;rgb:ff/ff/ff\x07')).toBeNull();
    });
  });
});

describe('parseOscResponses', () => {
  it('should parse multiple responses', () => {
    const buffer = '\x1b]4;0;rgb:0000/0000/0000\x07\x1b]4;1;rgb:cd31/3131/3131\x07';
    const results = parseOscResponses(buffer);

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      type: 'color',
      index: 0,
      rgb: { r: 0, g: 0, b: 0 },
    });
    expect(results[1]).toEqual({
      type: 'color',
      index: 1,
      rgb: { r: 205, g: 49, b: 49 },
    });
  });

  it('should parse mixed response types', () => {
    const buffer = '\x1b]4;1;rgb:cd/31/31\x07\x1b]10;rgb:eb/b2/85\x07\x1b]11;rgb:1e/1e/1e\x07';
    const results = parseOscResponses(buffer);

    expect(results).toHaveLength(3);
    expect(results[0]?.type).toBe('color');
    expect(results[1]?.type).toBe('foreground');
    expect(results[2]?.type).toBe('background');
  });

  it('should parse responses with ST terminators', () => {
    const buffer = '\x1b]4;0;rgb:00/00/00\x1b\\\x1b]4;1;rgb:cd/31/31\x1b\\';
    const results = parseOscResponses(buffer);

    expect(results).toHaveLength(2);
  });

  it('should handle mixed terminators', () => {
    const buffer = '\x1b]4;0;rgb:00/00/00\x07\x1b]4;1;rgb:cd/31/31\x1b\\';
    const results = parseOscResponses(buffer);

    expect(results).toHaveLength(2);
  });

  it('should skip malformed responses', () => {
    const buffer = 'garbage\x1b]4;0;rgb:00/00/00\x07invalid\x1b]4;1;rgb:cd/31/31\x07';
    const results = parseOscResponses(buffer);

    // Should only get the valid responses
    expect(results).toHaveLength(2);
    expect(results[0]?.index).toBe(0);
    expect(results[1]?.index).toBe(1);
  });

  it('should handle empty buffer', () => {
    const results = parseOscResponses('');
    expect(results).toHaveLength(0);
  });

  it('should handle buffer with only malformed data', () => {
    const results = parseOscResponses('no valid responses here');
    expect(results).toHaveLength(0);
  });

  it('should parse all 18 responses (16 colors + fg + bg)', () => {
    let buffer = '';
    // Add 16 color responses
    for (let i = 0; i < 16; i++) {
      const hex = i.toString(16).padStart(2, '0');
      buffer += `\x1b]4;${i.toString()};rgb:${hex}/${hex}/${hex}\x07`;
    }
    // Add foreground and background
    buffer += '\x1b]10;rgb:eb/b2/85\x07';
    buffer += '\x1b]11;rgb:1e/1e/1e\x07';

    const results = parseOscResponses(buffer);
    expect(results).toHaveLength(18);

    // Verify we got all 16 colors
    const colorResults = results.filter((r) => r.type === 'color');
    expect(colorResults).toHaveLength(16);

    // Verify foreground and background
    expect(results.some((r) => r.type === 'foreground')).toBe(true);
    expect(results.some((r) => r.type === 'background')).toBe(true);
  });
});
