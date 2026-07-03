import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as Calendar from 'expo-calendar/legacy';
import { pickWritableCalendar, addAppointmentToCalendar } from '../calendar';

// El bug real (smoke 2026-07-03), DOS capas:
// (1) desde expo-calendar 56.0.7 los métodos clásicos de la RAÍZ lanzan en
//     runtime (stubs @deprecated) — la lib debe importar de expo-calendar/legacy;
// (2) en equipos sin calendario default, el viejo fallback cals[0] podía elegir
//     un calendario de solo lectura (cumpleaños) y createEventAsync lanzaba.
// La lib debe: preferir default escribible → primer escribible → CREAR "Belysh".
// (babel-jest hoistea este mock por encima de los imports.)
jest.mock('expo-calendar/legacy', () => ({
  requestCalendarPermissionsAsync: jest.fn(),
  getCalendarsAsync: jest.fn(),
  getDefaultCalendarAsync: jest.fn(),
  createCalendarAsync: jest.fn(),
  createEventAsync: jest.fn(),
  getSourcesAsync: jest.fn(),
  EntityTypes: { EVENT: 'event', REMINDER: 'reminder' },
  SourceType: { LOCAL: 'local', CALDAV: 'caldav', BIRTHDAYS: 'birthdays' },
  CalendarAccessLevel: { OWNER: 'owner' },
}));

type MockFn<T extends (...args: never[]) => unknown> = ReturnType<typeof jest.fn<T>>;
const mockCalendar = Calendar as unknown as {
  requestCalendarPermissionsAsync: MockFn<() => Promise<{ status: string }>>;
  getCalendarsAsync: MockFn<(entityType?: string) => Promise<unknown[]>>;
  getDefaultCalendarAsync: MockFn<() => Promise<unknown>>;
  createCalendarAsync: MockFn<(details?: unknown) => Promise<string>>;
  createEventAsync: MockFn<(calendarId: string, event?: unknown) => Promise<string>>;
  getSourcesAsync: MockFn<() => Promise<unknown[]>>;
};

const writable = (id: string) => ({ id, title: id, allowsModifications: true });
const readOnly = (id: string) => ({ id, title: id, allowsModifications: false });

const EVENT = {
  title: 'Belysh · Corte & Estilo Signature',
  startDate: new Date('2026-10-31T18:00:00-05:00'),
  endDate: new Date('2026-10-31T19:15:00-05:00'),
  location: 'Belysh, Lima, Perú',
  notes: 'Tu cita en Belysh. ¡Prepárate para brillar! ✦',
  timeZone: 'America/Lima',
};

describe('pickWritableCalendar (selección segura de calendario)', () => {
  it('prefiere el default cuando es escribible', () => {
    const def = writable('default');
    expect(pickWritableCalendar(def, [readOnly('cumples'), def])).toBe(def);
  });

  it('si el default es de solo lectura, elige el primer escribible de la lista', () => {
    const good = writable('icloud');
    expect(pickWritableCalendar(readOnly('suscrito'), [readOnly('cumples'), good])).toBe(good);
  });

  it('sin default (getDefault falló), elige el primer escribible', () => {
    const good = writable('gmail');
    expect(pickWritableCalendar(null, [readOnly('cumples'), good])).toBe(good);
  });

  it('NUNCA cae a un calendario de solo lectura: sin escribibles devuelve null (el bug era cals[0])', () => {
    expect(pickWritableCalendar(null, [readOnly('cumples'), readOnly('festivos')])).toBeNull();
  });

  it('lista vacía devuelve null', () => {
    expect(pickWritableCalendar(null, [])).toBeNull();
  });
});

describe('addAppointmentToCalendar (flujo completo con expo-calendar mockeado)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCalendar.requestCalendarPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockCalendar.getCalendarsAsync.mockResolvedValue([]);
    mockCalendar.getDefaultCalendarAsync.mockRejectedValue(new Error('no default'));
    mockCalendar.getSourcesAsync.mockResolvedValue([]);
    mockCalendar.createCalendarAsync.mockResolvedValue('nuevo-belysh');
    mockCalendar.createEventAsync.mockResolvedValue('evento-1');
  });

  it('permiso denegado → "permission-denied" y NO intenta crear el evento', async () => {
    mockCalendar.requestCalendarPermissionsAsync.mockResolvedValue({ status: 'denied' });
    const result = await addAppointmentToCalendar(EVENT);
    expect(result).toBe('permission-denied');
    expect(mockCalendar.createEventAsync).not.toHaveBeenCalled();
  });

  it('camino feliz: default escribible → evento en ese calendario con recordatorio -120 min', async () => {
    mockCalendar.getDefaultCalendarAsync.mockResolvedValue(writable('default-icloud'));
    mockCalendar.getCalendarsAsync.mockResolvedValue([writable('default-icloud')]);

    const result = await addAppointmentToCalendar(EVENT);

    expect(result).toBe('added');
    expect(mockCalendar.getCalendarsAsync).toHaveBeenCalledWith('event');
    expect(mockCalendar.createEventAsync).toHaveBeenCalledWith(
      'default-icloud',
      expect.objectContaining({
        title: EVENT.title,
        startDate: EVENT.startDate,
        endDate: EVENT.endDate,
        timeZone: 'America/Lima',
        alarms: [{ relativeOffset: -120 }],
      }),
    );
    expect(mockCalendar.createCalendarAsync).not.toHaveBeenCalled();
  });

  it('caso del bug (sim prístino): default falla y solo hay read-only → CREA calendario "Belysh" en la fuente local y agrega ahí', async () => {
    mockCalendar.getCalendarsAsync.mockResolvedValue([readOnly('cumples')]);
    mockCalendar.getSourcesAsync.mockResolvedValue([
      { id: 'src-caldav', type: 'caldav', name: 'iCloud' },
      { id: 'src-local', type: 'local', name: 'Default' },
    ]);

    const result = await addAppointmentToCalendar(EVENT);

    expect(result).toBe('added');
    expect(mockCalendar.createCalendarAsync).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Belysh', sourceId: 'src-local' }),
    );
    expect(mockCalendar.createEventAsync).toHaveBeenCalledWith('nuevo-belysh', expect.anything());
  });

  it('sin fuente local usa la primera fuente disponible para crear el calendario', async () => {
    mockCalendar.getSourcesAsync.mockResolvedValue([
      { id: 'src-caldav', type: 'caldav', name: 'iCloud' },
    ]);

    const result = await addAppointmentToCalendar(EVENT);

    expect(result).toBe('added');
    expect(mockCalendar.createCalendarAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sourceId: 'src-caldav' }),
    );
  });

  it('si crear el evento lanza → "failed" (sin excepción hacia el caller)', async () => {
    mockCalendar.getDefaultCalendarAsync.mockResolvedValue(writable('default'));
    mockCalendar.createEventAsync.mockRejectedValue(new Error('EKError'));
    const result = await addAppointmentToCalendar(EVENT);
    expect(result).toBe('failed');
  });

  it('si tampoco se puede crear calendario (creación lanza) → "failed"', async () => {
    mockCalendar.createCalendarAsync.mockRejectedValue(new Error('no source'));
    const result = await addAppointmentToCalendar(EVENT);
    expect(result).toBe('failed');
  });
});
