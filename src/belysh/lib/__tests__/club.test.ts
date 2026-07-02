import { describe, it, expect } from '@jest/globals';
import { tierInfo } from '../club';

// Belysh Privilege: el nivel se calcula por CONSUMO pagado en 12 meses (soles),
// no por puntos. tierInfo recibe ese consumo; la fuente real es el servidor
// (client_spend_12m/client_tier) — esto solo valida la matemática de render.
describe('tierInfo (nivel Belysh Privilege por consumo 12m)', () => {
  it('socia nueva (S/0) es Member, progresando a VIP', () => {
    const t = tierInfo(0);
    expect(t.tier).toBe('Member');
    expect(t.nextTier).toBe('VIP');
    expect(t.toNext).toBe(2000);
    expect(t.pct).toBe(0);
    expect(t.isMax).toBe(false);
  });
  it('a mitad de camino a VIP (S/1000) = 50%', () => {
    expect(tierInfo(1000).pct).toBe(50);
  });
  it('S/2000 exactos ya es VIP (umbral inclusivo), rumbo a Elite', () => {
    const t = tierInfo(2000);
    expect(t.tier).toBe('VIP');
    expect(t.nextTier).toBe('Elite');
    expect(t.toNext).toBe(3000);
  });
  it('S/5000 es Elite, rumbo a Black', () => {
    const t = tierInfo(5000);
    expect(t.tier).toBe('Elite');
    expect(t.nextTier).toBe('Black');
    expect(t.toNext).toBe(3000);
  });
  it('S/8000+ es Black (nivel máximo)', () => {
    const t = tierInfo(9500);
    expect(t.tier).toBe('Black');
    expect(t.isMax).toBe(true);
    expect(t.pct).toBe(100);
  });
});
