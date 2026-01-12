import { describe, it, expect } from 'vitest';
import {
  generateColorQuery,
  generateForegroundQuery,
  generateBackgroundQuery,
  generateAllQueries,
} from '../../src/probe/osc.js';

describe('generateColorQuery', () => {
  it('should generate correct OSC 4 query for color index 0', () => {
    const query = generateColorQuery(0);
    expect(query).toBe('\x1b]4;0;?\x07');
  });

  it('should generate correct OSC 4 query for color index 15', () => {
    const query = generateColorQuery(15);
    expect(query).toBe('\x1b]4;15;?\x07');
  });

  it('should generate correct OSC 4 query for middle index', () => {
    const query = generateColorQuery(7);
    expect(query).toBe('\x1b]4;7;?\x07');
  });
});

describe('generateForegroundQuery', () => {
  it('should generate correct OSC 10 query', () => {
    const query = generateForegroundQuery();
    expect(query).toBe('\x1b]10;?\x07');
  });
});

describe('generateBackgroundQuery', () => {
  it('should generate correct OSC 11 query', () => {
    const query = generateBackgroundQuery();
    expect(query).toBe('\x1b]11;?\x07');
  });
});

describe('generateAllQueries', () => {
  it('should generate all 18 queries (16 colors + fg + bg)', () => {
    const allQueries = generateAllQueries();

    // Should contain all 16 color queries
    for (let i = 0; i < 16; i++) {
      expect(allQueries).toContain(`\x1b]4;${i.toString()};?\x07`);
    }

    // Should contain foreground and background queries
    expect(allQueries).toContain('\x1b]10;?\x07');
    expect(allQueries).toContain('\x1b]11;?\x07');
  });

  it('should generate queries in correct order', () => {
    const allQueries = generateAllQueries();

    // Queries should start with color 0
    expect(allQueries.startsWith('\x1b]4;0;?\x07')).toBe(true);

    // Should end with background query
    expect(allQueries.endsWith('\x1b]11;?\x07')).toBe(true);
  });
});
