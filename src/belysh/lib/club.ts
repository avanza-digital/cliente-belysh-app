import { BELYSH, Tier } from '../data';

const B = BELYSH;

// Deriva NIVEL, progreso y siguiente nivel a partir del CONSUMO pagado en 12 meses (en soles).
// Belysh Privilege separa dos ejes: el nivel sale del consumo (esta función), los puntos son
// la moneda de canje. Los umbrales viven en data.ts (0/2000/5000/8000 soles).
export function tierInfo(spendSoles: number) {
  const tiers: Tier[] = B.CLUB.tiers;
  let idx = 0;
  for (let i = 0; i < tiers.length; i++) if (spendSoles >= tiers[i].min) idx = i;
  const current = tiers[idx];
  const next = tiers[idx + 1] || null;
  const tierMin = current.min;
  const tierMax = next ? next.min : current.min;
  const toNext = next ? next.min - spendSoles : 0;
  const pct = next ? Math.max(0, Math.min(100, Math.round(((spendSoles - tierMin) / (tierMax - tierMin)) * 100))) : 100;
  return { tier: current.name, perk: current.perk, nextTier: next?.name, toNext, tierMin, tierMax, pct, isMax: !next };
}
