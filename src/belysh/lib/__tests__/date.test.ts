import { describe, it, expect } from '@jest/globals';
import {
  limaISO, partsLima, fmtDate, fmtDateLong, fmtTime, relTime,
  monthMatrix, monthLabel, ymd,
} from '../date';

describe('lib/date — zona Lima (UTC−5, sin DST)', () => {
  it('limaISO arma el instante con offset −05:00 (pad de hora/min)', () => {
    expect(limaISO('2026-06-08', '9:30')).toBe('2026-06-08T09:30:00-05:00');
    expect(limaISO('2026-06-10', '13:00')).toBe('2026-06-10T13:00:00-05:00');
  });

  it('fmtTime hace round-trip con limaISO y espeja el to_char FMHH24:MI (hora sin cero a la izquierda)', () => {
    expect(fmtTime(limaISO('2026-06-08', '9:30'))).toBe('9:30');
    expect(fmtTime(limaISO('2026-06-10', '13:00'))).toBe('13:00');
  });

  it('fmtDate corto: 8-jun-2026 es lunes', () => {
    expect(fmtDate('2026-06-08T09:30:00-05:00')).toBe('Lun 8 jun');
  });

  it('frontera de zona horaria: 02:00Z del 9 = 21:00 del 8 en Lima → "8 jun"', () => {
    expect(fmtDate('2026-06-09T02:00:00Z')).toBe('Lun 8 jun');
  });

  it('fmtDateLong: nombre completo de día y mes', () => {
    expect(fmtDateLong('2026-06-08T09:30:00-05:00')).toBe('Lunes 8 de junio');
  });

  it('monthMatrix junio 2026: 1-jun es lunes (columna 0, lunes-first) y 30 días', () => {
    expect(monthMatrix(2026, 6)).toEqual({ firstDow: 0, days: 30 });
  });

  it('monthMatrix febrero 2027 (no bisiesto): 28 días', () => {
    expect(monthMatrix(2027, 2).days).toBe(28);
  });

  it('monthLabel capitaliza el mes', () => {
    expect(monthLabel(2026, 6)).toBe('Junio 2026');
  });

  it('ymd: cero a la izquierda en mes y día', () => {
    expect(ymd(2026, 6, 8)).toBe('2026-06-08');
    expect(ymd(2026, 12, 1)).toBe('2026-12-01');
  });

  it('partsLima: weekday domingo-first (getUTCDay), lunes = 1', () => {
    expect(partsLima('2026-06-08T09:30:00-05:00').weekday).toBe(1);
  });

  it('relTime con "now" inyectable', () => {
    const now = Date.UTC(2026, 5, 8, 14, 30, 0);
    expect(relTime(new Date(now).toISOString(), now)).toBe('ahora');
    expect(relTime(new Date(now - 5 * 60000).toISOString(), now)).toBe('hace 5 min');
    expect(relTime(new Date(now - 3 * 3600000).toISOString(), now)).toBe('hace 3 h');
    expect(relTime(new Date(now - 25 * 3600000).toISOString(), now)).toBe('ayer');
    expect(relTime(new Date(now - 3 * 86400000).toISOString(), now)).toBe('hace 3 días');
  });

  it('formateadores toleran null/undefined', () => {
    expect(fmtDate(null)).toBe('');
    expect(fmtTime(undefined)).toBe('');
    expect(relTime(null)).toBe('');
  });
});