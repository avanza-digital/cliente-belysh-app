import { Platform } from 'react-native';
// API ORIENTADA A OBJETOS (expo-calendar 57, raíz "expo-calendar"):
// las funciones clásicas de la RAÍZ eran stubs @deprecated que LANZAN desde
// 56.0.7, y el subpath /legacy (que usábamos) está deprecado y desaparecerá en
// un SDK futuro. La API OO vive en la raíz: getCalendars/getDefaultCalendarSync/
// createCalendar/getSourcesSync + el método de INSTANCIA ExpoCalendar.createEvent.
import * as Calendar from 'expo-calendar';

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
// createEvent — jamás caer a cals[0] sin filtrar. Función pura y testeable;
// ahora opera sobre instancias ExpoCalendar (que exponen allowsModifications).
export function pickWritableCalendar<T extends WritableLike>(
  defaultCal: T | null,
  all: T[],
): T | null {
  if (defaultCal?.allowsModifications) return defaultCal;
  return all.find((c) => c.allowsModifications) ?? null;
}

async function createBelyshCalendar(): Promise<Calendar.ExpoCalendar> {
  if (Platform.OS === 'ios') {
    // getSourcesSync es SÍNCRONA y solo-iOS (lanza UnavailabilityError en Android).
    const sources = Calendar.getSourcesSync();
    const source =
      sources.find((s) => s.type === Calendar.SourceType.LOCAL) ?? sources[0];
    return Calendar.createCalendar({
      title: 'Belysh',
      color: BELYSH_GREEN,
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: source?.id,
    });
  }
  return Calendar.createCalendar({
    title: 'Belysh',
    color: BELYSH_GREEN,
    entityType: Calendar.EntityTypes.EVENT,
    source: { isLocalAccount: true, name: 'Belysh', type: 'local' },
    name: 'belysh',
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
}

async function ensureWritableCalendar(): Promise<Calendar.ExpoCalendar> {
  const cals = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
  let defaultCal: Calendar.ExpoCalendar | null = null;
  try {
    // getDefaultCalendarSync es SÍNCRONA y LANZA si no hay default (o en Android,
    // donde no existe un default de sistema) → equipo recién configurado.
    defaultCal = Calendar.getDefaultCalendarSync();
  } catch {
    defaultCal = null;
  }
  const picked = pickWritableCalendar(defaultCal, cals);
  if (picked) return picked;
  return createBelyshCalendar();
}

export async function addAppointmentToCalendar(
  event: AppointmentEvent,
): Promise<AddToCalendarResult> {
  try {
    // Pedimos acceso FULL (writeOnly por defecto = false): aunque createEvent
    // se contentaría con write-only, getCalendars() (lectura) requiere FULL.
    const { status } = await Calendar.requestCalendarPermissions();
    if (status !== 'granted') return 'permission-denied';
    const calendar = await ensureWritableCalendar();
    await calendar.createEvent({
      ...event,
      alarms: [{ relativeOffset: -120 }],
    });
    return 'added';
  } catch {
    return 'failed';
  }
}
