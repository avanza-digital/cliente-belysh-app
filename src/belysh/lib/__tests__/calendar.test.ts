import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as Calendar from 'expo-calendar';
import { pickWritableCalendar, addAppointmentToCalendar } from '../calendar';

// El bug real (smoke 2026-07-03), DOS capas:
// (1) desde expo-calendar 56.0.7 los métodos clásicos de la RAÍZ lanzan en
//     runtime; el subpath /legacy quedó deprecado → migramos a la API OO de la
//     raíz "expo-calendar" (getCalendars/getDefaultCalendarSync/createCalendar/
//     getSourcesSync + el método de INSTANCIA ExpoCalendar.createEvent);
// (2) en equipos sin calendario default, el viejo fallback cals[0] podía elegir
//     un calendario de solo lectura (cumpleaños) y createEvent lanzaba.
// La lib debe: preferir default escribible → primer escribible → CREAR "Belysh".
// (babel-jest hoistea este mock por encima de los imports.)
jest.mock('expo-calendar', () => ({
  requestCalendarPermissions: jest.fn(),
  getCalendars: jest.fn(),
  getDefaultCalendarSync: jest.fn(), // SÍNCRONA
  createCalendar: jest.fn(),
  getSourcesSync: jest.fn(), // SÍNCRONA
  EntityTypes: { EVENT: 'event', REMINDER: 'reminder' },
  SourceType: { LOCAL: 'local', CALDAV: 'caldav', BIRTHDAYS: 'birthdays' },
  CalendarAccessLevel: { OWNER: 'owner' },
}));

type MockFn<T extends (...args: never[]) => unknown> = ReturnType<typeof jest.fn<T>>;
// Instancia ExpoCalendar de mentira: el evento se crea sobre la INSTANCIA elegida.
type FakeCalendar = {
  id: string;
  title: string;
  allowsModifications: boolean;
  createEvent: MockFn<(event?: unknown) => Promise<{ id: string }>>;
};
const mockCalendar = Calendar as unknown as {
  requestCalendarPermissions: MockFn<() => Promise<{ status: string }>>;
  getCalendars: MockFn<(entityType?: string) => Promise<unknown[]>>;
  getDefaultCalendarSync: MockFn<() => unknown>; // SÍNCRONA
  createCalendar: MockFn<(details?: unknown) => Promise<unknown>>;
  getSourcesSync: MockFn<() => unknown[]>; // SÍNCRONA
};

// Cada calendario mock lleva su PROPIO createEvent (método de instancia).
const writable = (id: string): FakeCalendar => ({
  id,
  title: id,
  allowsModifications: true,
  createEvent: jest.fn<(event?: unknown) => Promise<{ id: string }>>().mockResolvedValue({ id: 'evento-1' }),
});
const readOnly = (id: string): FakeCalendar => ({
  id,
  title: id,
  allowsModifications: false,
  createEvent: jest.fn<(event?: unknown) => Promise<{ id: string }>>().mockResolvedValue({ id: 'evento-1' }),
});

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
  let belyshInstance: FakeCalendar;

  beforeEach(() => {
    jest.clearAllMocks();
    // Instancia devuelta por createCalendar (creada tras clearAllMocks → limpia).
    belyshInstance = writable('nuevo-belysh');
    mockCalendar.requestCalendarPermissions.mockResolvedValue({ status: 'granted' });
    mockCalendar.getCalendars.mockResolvedValue([]);
    // getDefaultCalendarSync es SÍNCRONA: lanza cuando no hay default (o Android).
    mockCalendar.getDefaultCalendarSync.mockImplementation(() => {
      throw new Error('no default');
    });
    // getSourcesSync es SÍNCRONA.
    mockCalendar.getSourcesSync.mockReturnValue([]);
    mockCalendar.createCalendar.mockResolvedValue(belyshInstance);
  });

  it('permiso denegado → "permission-denied" y NO intenta elegir/crear calendario ni evento', async () => {
    mockCalendar.requestCalendarPermissions.mockResolvedValue({ status: 'denied' });
    const result = await addAppointmentToCalendar(EVENT);
    expect(result).toBe('permission-denied');
    expect(mockCalendar.getCalendars).not.toHaveBeenCalled();
    expect(belyshInstance.createEvent).not.toHaveBeenCalled();
  });

  it('camino feliz: default escribible → evento en ESA instancia con recordatorio -120 min', async () => {
    const def = writable('default-icloud');
    mockCalendar.getDefaultCalendarSync.mockReturnValue(def);
    mockCalendar.getCalendars.mockResolvedValue([def]);

    const result = await addAppointmentToCalendar(EVENT);

    expect(result).toBe('added');
    expect(mockCalendar.getCalendars).toHaveBeenCalledWith('event');
    // El evento se crea sobre la INSTANCIA elegida, SIN el primer arg calendarId.
    expect(def.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: EVENT.title,
        startDate: EVENT.startDate,
        endDate: EVENT.endDate,
        timeZone: 'America/Lima',
        alarms: [{ relativeOffset: -120 }],
      }),
    );
    expect(mockCalendar.createCalendar).not.toHaveBeenCalled();
  });

  it('caso del bug (sim prístino): default lanza y solo hay read-only → CREA calendario "Belysh" en la fuente local y agrega ahí', async () => {
    mockCalendar.getCalendars.mockResolvedValue([readOnly('cumples')]);
    mockCalendar.getSourcesSync.mockReturnValue([
      { id: 'src-caldav', type: 'caldav', name: 'iCloud' },
      { id: 'src-local', type: 'local', name: 'Default' },
    ]);

    const result = await addAppointmentToCalendar(EVENT);

    expect(result).toBe('added');
    expect(mockCalendar.createCalendar).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Belysh', sourceId: 'src-local' }),
    );
    // La instancia devuelta por createCalendar es la que crea el evento.
    expect(belyshInstance.createEvent).toHaveBeenCalledWith(expect.anything());
  });

  it('sin fuente local usa la primera fuente disponible para crear el calendario', async () => {
    mockCalendar.getSourcesSync.mockReturnValue([
      { id: 'src-caldav', type: 'caldav', name: 'iCloud' },
    ]);

    const result = await addAppointmentToCalendar(EVENT);

    expect(result).toBe('added');
    expect(mockCalendar.createCalendar).toHaveBeenCalledWith(
      expect.objectContaining({ sourceId: 'src-caldav' }),
    );
  });

  it('si crear el evento lanza → "failed" (sin excepción hacia el caller)', async () => {
    const def = writable('default');
    def.createEvent.mockRejectedValue(new Error('EKError'));
    mockCalendar.getDefaultCalendarSync.mockReturnValue(def);
    mockCalendar.getCalendars.mockResolvedValue([def]);
    const result = await addAppointmentToCalendar(EVENT);
    expect(result).toBe('failed');
  });

  it('si tampoco se puede crear calendario (creación lanza) → "failed"', async () => {
    mockCalendar.createCalendar.mockRejectedValue(new Error('no source'));
    const result = await addAppointmentToCalendar(EVENT);
    expect(result).toBe('failed');
  });
});
