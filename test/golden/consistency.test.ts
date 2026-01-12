import { describe, it, expect } from 'vitest';
import { createT1Theme } from '../../src/theme/theme.js';

describe('Output Consistency', () => {
  it('should produce identical output for identical inputs', () => {
    const theme1 = createT1Theme();
    const theme2 = createT1Theme();

    expect(theme1.red('test')).toBe(theme2.red('test'));
    expect(theme1.red.bold()('test')).toBe(theme2.red.bold()('test'));
  });

  it('should be deterministic across multiple calls', () => {
    const theme = createT1Theme();
    const outputs = Array.from({ length: 10 }, () => theme.red.bold()('test'));

    // All outputs should be identical
    expect(new Set(outputs).size).toBe(1);
  });

  it('should produce consistent output with modifiers', () => {
    const theme = createT1Theme();

    const result1 = theme.red.bold().underline()('test');
    const result2 = theme.red.bold().underline()('test');

    expect(result1).toBe(result2);
  });

  it('should produce consistent output with backgrounds', () => {
    const theme = createT1Theme();

    const result1 = theme.white.on(theme.blue)('test');
    const result2 = theme.white.on(theme.blue)('test');

    expect(result1).toBe(result2);
  });

  it('should produce consistent output with transforms at T1', () => {
    const theme = createT1Theme();

    // Transforms are no-ops at T1, so should be consistent
    const result1 = theme.red.saturate(0.5)('test');
    const result2 = theme.red.saturate(0.5)('test');

    expect(result1).toBe(result2);
  });
});
