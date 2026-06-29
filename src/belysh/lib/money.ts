// Moneda del negocio: Sol peruano (S/), no "$".
export const money = (n: number | string | undefined | null) =>
  `S/ ${n ?? 0}`;
