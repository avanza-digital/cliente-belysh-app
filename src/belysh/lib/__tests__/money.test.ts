import { describe, it, expect } from '@jest/globals';
import { money } from '../money';

describe('money', () => {
  it('formatea soles peruanos con prefijo S/', () => {
    expect(money(90)).toBe('S/ 90');
    expect(money(240)).toBe('S/ 240');
  });
  it('agrupa miles con coma', () => {
    expect(money(1500)).toBe('S/ 1,500');
    expect(money(12000)).toBe('S/ 12,000');
    expect(money(1234567)).toBe('S/ 1,234,567');
  });
  it('muestra 2 decimales solo si hay fracción', () => {
    expect(money(1500.5)).toBe('S/ 1,500.50');
    expect(money(90.9)).toBe('S/ 90.90');
  });
  it('maneja string y nulos', () => {
    expect(money('150')).toBe('S/ 150');
    expect(money(undefined)).toBe('S/ 0');
    expect(money(null)).toBe('S/ 0');
  });
});