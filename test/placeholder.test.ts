import { describe, it, expect } from 'vitest';
import { VERSION } from '../src/index.js';

describe('ChromaTerm', () => {
  it('should export VERSION', () => {
    expect(VERSION).toBe('0.0.0');
  });

  it('should have a string version', () => {
    expect(typeof VERSION).toBe('string');
  });
});
