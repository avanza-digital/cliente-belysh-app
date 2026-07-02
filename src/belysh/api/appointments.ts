import { supabase } from './supabase';
import { Appointment } from '../types/db';
import { limaISO } from '../lib/date';

export async function createAppointment(input: {
  service_id?: string;
  service_name: string;
  stylist_id?: string;
  stylist_name?: string;
  price: number;
  duration_min?: number;
  date: string; // 'YYYY-MM-DD' en zona Lima
  time: string; // 'H:MM'
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
      starts_at: limaISO(input.date, input.time), // el trigger deriva appt_date/appt_time
    })
    .select()
    .single();
  if (error) {
    // 23505 = violación del índice único de cupo (estilista/instante)
    if ((error as { code?: string }).code === '23505') throw new Error('Ese horario acaba de ocuparse. Elige otro, por favor.');
    throw error;
  }
  return data;
}

export async function listMyAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('starts_at', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function cancelAppointment(id: string) {
  const { error } = await supabase.from('appointments').update({ status: 'cancelada' }).eq('id', id);
  if (error) throw error;
}

// Cupos ya tomados por CUALQUIER clienta ese día (RPC security definer: la RLS solo
// deja ver las citas propias). `date` = 'YYYY-MM-DD' en zona Lima.
export async function takenTimes(date: string, stylistId?: string): Promise<string[]> {
  if (!stylistId) return [];
  const { data, error } = await supabase.rpc('taken_times', { p_appt_date: date, p_stylist: stylistId });
  if (error) throw error;
  return (data ?? []) as string[];
}

// Días completamente llenos (todos los cupos tomados) para una estilista en un rango.
export async function fullDays(stylistId: string, from: string, to: string): Promise<string[]> {
  if (!stylistId) return [];
  const { data, error } = await supabase.rpc('full_days', { p_stylist: stylistId, p_from: from, p_to: to });
  if (error) throw error;
  return (data ?? []) as string[];
}

// Reagenda una cita existente (mismo id, mismo servicio): mueve instante/estilista
// vía RPC transaccional. NO duplica la cita ni los puntos.
export async function reschedule(input: {
  id: string;
  date: string;
  time: string;
  stylistId: string;
  stylistName: string;
}): Promise<Appointment> {
  const { data, error } = await supabase.rpc('reschedule_appointment', {
    p_appointment_id: input.id,
    p_starts_at: limaISO(input.date, input.time),
    p_stylist_id: input.stylistId,
    p_stylist_name: input.stylistName,
  });
  if (error) throw error; // 'slot_taken'/'forbidden'/… los traduce lib/errors
  return data as Appointment;
}
