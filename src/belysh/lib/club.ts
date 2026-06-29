import { BELYSH } from '../data';

const B = BELYSH as any;

// Deriva nivel, progreso y siguiente nivel a partir de los puntos reales.
// Fuente única de verdad del "estado de socia" (la usan Club e Inicio).
export function tierInfo(points: number) {
  const tiers = B.CLUB.tiers as any[];
  let idx = 0;
  for (let i = 0; i < tiers.length; i++) if (points >= tiers[i].min) idx = i;
  const current = tiers[idx];
  const next = tiers[idx + 1] || null;
  const tierMin = current.min;
  const tierMax = next ? next.min : current.min;
  const toNext = next ? next.min - points : 0;
  const pct = next ? Math.max(0, Math.min(100, Math.round(((points - tierMin) / (tierMax - tierMin)) * 100))) : 100;
  return { tier: current.name, perk: current.perk, nextTier: next?.name, toNext, tierMin, tierMax, pct, isMax: !next };
}
