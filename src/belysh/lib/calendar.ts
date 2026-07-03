import { Platform } from 'react-native';
// OJO: desde expo-calendar 56.0.7 las funciones clásicas importadas desde la
// RAÍZ ("expo-calendar") son stubs @deprecated que LANZAN en runtime; la API
// funcional vive en el subpath legacy (hasta migrar a la API orientada a objetos).
import * as Calendar from 'expo-calendar/legacy';

// Verde Belysh (tarjeta del Club) para el calendario propio.
const BELYSH_GREEN = '#0B5440';

export type AddToCalendarResult = 'added' | 'permission-denied' | 'failed';

export type AppointmentEvent = {
  title: string;
  startDate: Date;
  endDate: Date;
  location: string;
  notes: string;
  timeZone: string;
};

type WritableLike = { allowsModifications: boolean };

// Un calendario de solo lectura (p.ej. cumpleaños/festivos) hace lanzar a
// createEventAsync — jamás caer a cals[0] sin filtrar.
export function pickWritableCalendar<T extends WritableLike>(
  defaultCal: T | null,
  all: T[],
): T | null {
  if (defaultCal?.allowsModifications) return defaultCal;
  return all.find((c) => c.allowsModifications) ?? null;
}

async function createBelyshCalendarId(): Promise<string> {
  if (Platform.OS === 'ios') {
    // getSourcesAsync es solo-iOS (lanza UnavailabilityError en Android).
    const sources = await Calendar.getSourcesAsync();
    const source =
      sources.find((s) => s.type === Calendar.SourceType.LOCAL) ?? sources[0];
    return Calendar.createCalendarAsync({
      title: 'Belysh',
      color: BELYSH_GREEN,
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: source?.id,
    });
  }
  return Calendar.createCalendarAsync({
    title: 'Belysh',
    color: BELYSH_GREEN,
    entityType: Calendar.EntityTypes.EVENT,
    source: { isLocalAccount: true, name: 'Belysh', type: 'local' },
    name: 'belysh',
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
}

// Tipo estructural: el root de expo-calendar 57 ya no exporta el tipo `Calendar`
// (solo las funciones legacy); lo que consumimos de un calendario es esto.
type EventCalendar = { id: string; allowsModifications: boolean };

async function ensureWritableCalendarId(): Promise<string> {
  const cals = (await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT,
  )) as unknown as EventCalendar[];
  let defaultCal: EventCalendar | null = null;
  try {
    defaultCal = (await Calendar.getDefaultCalendarAsync()) as unknown as EventCalendar;
  } catch {
    defaultCal = null; // sin calendario default configurado (equipo recién configurado)
  }
  const picked = pickWritableCalendar(defaultCal, cals);
  if (picked) return picked.id;
  return createBelyshCalendarId();
}

export async function addAppointmentToCalendar(
  event: AppointmentEvent,
): Promise<AddToCalendarResult> {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') return 'permission-denied';
    const calendarId = await ensureWritableCalendarId();
    await Calendar.createEventAsync(calendarId, {
      ...event,
      alarms: [{ relativeOffset: -120 }],
    });
    return 'added';
  } catch {
    return 'failed';
  }
}
