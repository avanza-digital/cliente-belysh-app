// Fechas/horas de BELYSH en zona Lima (America/Lima = UTC−5 fijo, sin DST).
// Fuente única: reemplaza los 3 formateadores duplicados (Perfil, notifications, data.ts)
// y unifica el día-de-semana a UNA convención (domingo-first, indexado por getUTCDay
// del instante ya desplazado a Lima). Sin Intl (Hermes lo trae recortado) → offset fijo.

export const LIMA_OFFSET = '-05:00';
const LIMA_SHIFT_MS = 5 * 3600 * 1000;

const pad = (n: number) => String(n).padStart(2, '0');

const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DOW_LONG = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_LONG = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export type LimaParts = { y: number; m: number; d: number; hh: number; mm: number; weekday: number };

// Instante (ISO con o sin offset) → componentes de pared en Lima. Determinista, sin Intl:
// desplazamos el epoch −5h y leemos los getters UTC.
export function partsLima(iso: string): LimaParts {
  const shifted = new Date(new Date(iso).getTime() - LIMA_SHIFT_MS);
  return {
    y: shifted.getUTCFullYear(),
    m: shifted.getUTCMonth() + 1,
    d: shifted.getUTCDate(),
    hh: shifted.getUTCHours(),
    mm: shifted.getUTCMinutes(),
    weekday: shifted.getUTCDay(), // 0=Dom … 6=Sáb
  };
}

// (YYYY-MM-DD local Lima, 'H:MM') → ISO con offset fijo. Sin Date → 100% determinista.
export function limaISO(ymdStr: string, hm: string): string {
  const [h, m] = hm.split(':').map(Number);
  return `${ymdStr}T${pad(h)}:${pad(m)}:00${LIMA_OFFSET}`;
}

// 'H:MM' espejo del to_char(... 'FMHH24:MI') del servidor (hora sin cero a la izquierda).
export function fmtTime(startsAt?: string | null): string {
  if (!startsAt) return '';
  const p = partsLima(startsAt);
  return `${p.hh}:${pad(p.mm)}`;
}

// 'Lun 8 jun'
export function fmtDate(startsAt?: string | null): string {
  if (!startsAt) return '';
  const p = partsLima(startsAt);
  return `${DOW[p.weekday]} ${p.d} ${MESES[p.m - 1]}`;
}

// 'Lunes 8 de junio'
export function fmtDateLong(startsAt?: string | null): string {
  if (!startsAt) return '';
  const p = partsLima(startsAt);
  return `${DOW_LONG[p.weekday]} ${p.d} de ${MESES_LONG[p.m - 1]}`;
}

// Tiempo relativo ('ahora' / 'hace 5 min' / 'ayer' / 'hace 3 días'). `now` inyectable para tests.
export function relTime(iso?: string | null, now: number = Date.now()): string {
  if (!iso) return '';
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'ayer' : `hace ${d} días`;
}

// 'YYYY-MM-DD' (mes y día 1-based)
export function ymd(y: number, m: number, d: number): string {
  return `${y}-${pad(m)}-${pad(d)}`;
}

// Hoy en Lima (Y/M/D 1-based). `now` inyectable para tests.
export function todayLima(now: number = Date.now()): { y: number; m: number; d: number } {
  const p = partsLima(new Date(now).toISOString());
  return { y: p.y, m: p.m, d: p.d };
}

// Geometría del mes para el calendario: firstDow lunes-first (casa el header 'L M M J V S D'), nº de días.
export function monthMatrix(year: number, month: number): { firstDow: number; days: number } {
  const firstDow = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7; // 0 = lunes
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { firstDow, days };
}

// 'Junio 2026'
export function monthLabel(year: number, month: number): string {
  const m = MESES_LONG[month - 1];
  return `${m.charAt(0).toUpperCase() + m.slice(1)} ${year}`;
}
