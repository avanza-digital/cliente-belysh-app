import { money } from '../money';

describe('money', () => {
  it('formatea soles peruanos con prefijo S/', () => {
    expect(money(90)).toBe('S/ 90');
    expect(money(240)).toBe('S/ 240');
  });
  it('maneja string y nulos', () => {
    expect(money('150')).toBe('S/ 150');
    expect(money(undefined)).toBe('S/ 0');
    expect(money(null)).toBe('S/ 0');
  });
});
