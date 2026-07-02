// Moneda del negocio: Sol peruano (S/). Formatea con separador de miles.
// Sin Intl (Hermes lo trae recortado) → agrupación manual con regex.
export const money = (n: number | string | undefined | null): string => {
  const num = typeof n === 'string' ? Number(n) : (n ?? 0);
  if (!Number.isFinite(num)) return `S/ ${n ?? 0}`;
  const neg = num < 0;
  const abs = Math.abs(num);
  const hasFraction = abs % 1 > 1e-9;
  const intStr = String(Math.floor(abs)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const frac = hasFraction ? '.' + abs.toFixed(2).split('.')[1] : '';
  return `S/ ${neg ? '-' : ''}${intStr}${frac}`;
};
