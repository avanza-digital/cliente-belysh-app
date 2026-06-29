import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const SEEN_KEY = 'belysh:notif_last_seen';
export async function markNotifsSeen() {
  try { await AsyncStorage.setItem(SEEN_KEY, String(Date.now())); } catch {}
}
export async function countUnread(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_KEY);
    const seen = raw ? Number(raw) : 0;
    const items = await listNotifications();
    return items.filter((n) => new Date(n.created_at).getTime() > seen).length;
  } catch {
    return 0;
  }
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
function fmtDate(isoDate?: string): string {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${DOW[new Date(y, m - 1, d).getDay()]} ${d} ${MESES[m - 1]}`;
}
function relTime(iso?: string): string {
  if (!iso) return '';
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'ayer' : `hace ${d} días`;
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

  const items: Omit<Notif, 'time' | 'unread'>[] = [];

  (appts.data ?? []).forEach((a: any) => {
    const titles: Record<string, string> = {
      pendiente: 'Reserva recibida', confirmada: 'Tu cita está confirmada', completada: '¡Gracias por tu visita!',
    };
    items.push({
      id: 'a-' + a.id, icon: 'clock', tone: 'rose', created_at: a.created_at,
      title: titles[a.status] || 'Tu cita',
      body: `${a.service_name} · ${fmtDate(a.appt_date)}, ${a.appt_time}${a.stylist_name ? ` con ${a.stylist_name}` : ''}`,
    });
  });

  (txs.data ?? []).forEach((t: any) => {
    if (t.kind === 'earn') {
      items.push({
        id: 't-' + t.id, icon: 'gift', tone: 'emerald', created_at: t.created_at,
        title: `Ganaste +${t.points} puntos`,
        body: t.note ? `Por ${t.note}. Sigue sumando para tus recompensas.` : 'Sigue sumando para tus recompensas.',
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
  const now = Date.now();
  return items.map((n) => ({
    ...n,
    time: relTime(n.created_at),
    unread: now - new Date(n.created_at).getTime() < 36 * 3600 * 1000,
  }));
}
