import { supabase } from './supabase';
import { Appointment } from '../types/db';

// Convierte el día del calendario (número, junio 2026) + hora a fecha/hora reales.
function toDate(day: number): string {
  const d = String(day).padStart(2, '0');
  return `2026-06-${d}`; // mes del prototipo: Junio 2026
}

export async function createAppointment(input: {
  service_id?: string;
  service_name: string;
  stylist_id?: string;
  stylist_name?: string;
  price: number;
  duration_min?: number;
  day: number;
  time: string;
}): Promise<Appointment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Inicia sesión para reservar');
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      user_id: user.id,
      service_id: input.service_id,
      service_name: input.service_name,
      stylist_id: input.stylist_id,
      stylist_name: input.stylist_name,
      price: input.price,
      duration_min: input.duration_min,
      appt_date: toDate(input.day),
      appt_time: input.time,
    })
    .select()
    .single();
  if (error) {
    // 23505 = violación del índice único de cupo (estilista/fecha/hora)
    if ((error as any).code === '23505') throw new Error('Ese horario acaba de ocuparse. Elige otro, por favor.');
    throw error;
  }
  return data;
}

export async function listMyAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('appt_date', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function cancelAppointment(id: string) {
  const { error } = await supabase.from('appointments').update({ status: 'cancelada' }).eq('id', id);
  if (error) throw error;
}

// Cupos ya tomados por CUALQUIER clienta (vía RPC security definer: la RLS solo
// deja ver las citas propias, así que un SELECT directo no vería las de otras).
export async function takenTimes(day: number, stylistId?: string): Promise<string[]> {
  if (!stylistId) return [];
  const { data, error } = await supabase.rpc('taken_times', { p_appt_date: toDate(day), p_stylist: stylistId });
  if (error) throw error;
  return (data ?? []) as string[];
}
