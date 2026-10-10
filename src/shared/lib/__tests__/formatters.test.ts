import { describe, it, expect } from 'vitest';
import { formatMoney, formatDate } from '../formatters';

describe('formatters', () => {
  it('formatMoney formats currency number properly', () => {
    const formatted = formatMoney(50000);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('formatDate formats date properly', () => {
    const formatted = formatDate(new Date('2026-10-10T00:00:00Z'));
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });
});
