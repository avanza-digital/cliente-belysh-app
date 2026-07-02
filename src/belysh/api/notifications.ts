import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { fmtDate, relTime } from '../lib/date';

const SEEN_KEY = 'belysh:notif_last_seen';

export async function markNotifsSeen() {
  try { await AsyncStorage.setItem(SEEN_KEY, String(Date.now())); } catch {}
}

async function getSeen(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

// Badge: cuenta no-leídas usando LA MISMA definición que la lista (creado tras "último visto").
export async function countUnread(): Promise<number> {
  try {
    const items = await listNotifications();
    return items.filter((n) => n.unread).length;
  } catch {
    return 0;
  }
}

export type Notif = {
  id: string; icon: 'clock' | 'gift' | 'spark' | 'promo'; tone: 'rose' | 'emerald';
  title: string; body: string; time: string; unread: boolean; created_at: string;
};

// Construye las notificaciones a partir de datos reales: reservas + movimientos de puntos.
export async function listNotifications(): Promise<Notif[]> {
  const [appts, txs] = await Promise.all([
    supabase.from('appointments').select('*').neq('status', 'cancelada').order('created_at', { ascending: false }),
    supabase.from('point_transactions').select('*').order('created_at', { ascending: false }),
  ]);
  // No tragar errores: que el estado de error de la pantalla aparezca en vez de "bandeja vacía".
  if (appts.error) throw appts.error;
  if (txs.error) throw txs.error;

  const items: Omit<Notif, 'time' | 'unread'>[] = [];

  (appts.data ?? []).forEach((a) => {
    const titles: Record<string, string> = {
      pendiente: 'Reserva recibida', confirmada: 'Tu cita está confirmada', completada: '¡Gracias por tu visita!',
    };
    items.push({
      id: 'a-' + a.id, icon: 'clock', tone: 'rose', created_at: a.created_at,
      title: titles[a.status] || 'Tu cita',
      body: `${a.service_name} · ${fmtDate(a.starts_at)}, ${a.appt_time}${a.stylist_name ? ` con ${a.stylist_name}` : ''}`,
    });
  });

  (txs.data ?? []).forEach((t) => {
    if (t.kind === 'earn') {
      items.push({
        id: 't-' + t.id, icon: 'gift', tone: 'emerald', created_at: t.created_at,
        title: `Ganaste +${t.points} puntos`,
        body: t.note ? `Por ${t.note}. Sigue sumando para tus recompensas.` : 'Sigue sumando para tus recompensas.',
      });
    } else if (t.ref_type === 'appointment_reversal') {
      // Clawback al cancelar: es una DEVOLUCIÓN de puntos, no un canje.
      items.push({
        id: 't-' + t.id, icon: 'gift', tone: 'emerald', created_at: t.created_at,
        title: `Te devolvimos ${t.points} puntos`,
        body: 'Revertimos los puntos de la cita que cancelaste.',
      });
    } else {
      items.push({
        id: 't-' + t.id, icon: 'spark', tone: 'emerald', created_at: t.created_at,
        title: `Canjeaste ${t.note || 'una recompensa'}`,
        body: `−${t.points} puntos del Belysh Club.`,
      });
    }
  });

  items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const seen = await getSeen();
  return items.map((n) => ({
    ...n,
    time: relTime(n.created_at),
    unread: new Date(n.created_at).getTime() > seen,
  }));
}
