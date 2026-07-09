// Recordatorios LOCALES de cita (sin servidor): se programan en el dispositivo
// al confirmar/reagendar y se cancelan al cancelar la cita.
// identifier = appt.id → reprogramar reemplaza, cancelar es directo.
import * as Notifications from 'expo-notifications';
import { Appointment } from '../types/db';
import { fmtTime } from './date';

const DAY_MS = 24 * 60 * 60 * 1000;

// Mostrar la notificación también con la app en primer plano.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensurePermission(): Promise<boolean> {
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  if (!cur.canAskAgain) return false;
  const req = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return req.granted;
}

// Programa (o reprograma) el recordatorio 24 h antes de la cita.
// Best-effort: nunca rompe el flujo de reserva si falla o no hay permiso.
export async function scheduleReminder(appt: Appointment): Promise<void> {
  try {
    if (!appt.starts_at) return;
    if (!(await ensurePermission())) return;
    const at = new Date(new Date(appt.starts_at).getTime() - DAY_MS);
    if (at.getTime() <= Date.now() + 60_000) return; // cita en <24 h: sin recordatorio
    await Notifications.cancelScheduledNotificationAsync(appt.id).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: appt.id,
      content: {
        title: 'Tu cita en Belysh es mañana ✨',
        body: `${appt.service_name} a las ${fmtTime(appt.starts_at)}${appt.stylist_name ? ` con ${appt.stylist_name}` : ''}. Te esperamos.`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
    });
  } catch {
    // silencioso: el recordatorio es un extra, no parte del contrato de reserva
  }
}

export async function cancelReminder(apptId: string): Promise<void> {
  try { await Notifications.cancelScheduledNotificationAsync(apptId); } catch {}
}
