import { tierInfo } from '../club';

describe('tierInfo (nivel del Belysh Club)', () => {
  it('socia nueva (0 pts) es Plata, progresando a Oro', () => {
    const t = tierInfo(0);
    expect(t.tier).toBe('Plata');
    expect(t.nextTier).toBe('Oro');
    expect(t.toNext).toBe(500);
    expect(t.pct).toBe(0);
    expect(t.isMax).toBe(false);
  });
  it('a mitad de camino a Oro (250 pts) ≈ 50%', () => {
    expect(tierInfo(250).pct).toBe(50);
  });
  it('600 pts ya es Oro, rumbo a Diamante', () => {
    const t = tierInfo(600);
    expect(t.tier).toBe('Oro');
    expect(t.nextTier).toBe('Diamante');
    expect(t.toNext).toBe(900);
  });
  it('1500+ es Diamante (nivel máximo)', () => {
    const t = tierInfo(1600);
    expect(t.tier).toBe('Diamante');
    expect(t.isMax).toBe(true);
    expect(t.pct).toBe(100);
  });
});
