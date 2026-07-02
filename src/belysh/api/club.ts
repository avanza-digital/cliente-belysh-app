import { supabase } from './supabase';
import { PointTransaction } from '../types/db';

// Canjea una recompensa. El servidor deriva el costo real por reward_id (no se confía
// en ningún monto del cliente) y valida saldo. Devuelve el nuevo saldo.
export async function redeemReward(rewardId: string): Promise<number> {
  const { data, error } = await supabase.rpc('redeem_reward', { p_reward_id: rewardId });
  if (error) throw error;
  return data as number;
}

export async function listTransactions(): Promise<PointTransaction[]> {
  const { data, error } = await supabase
    .from('point_transactions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Consumo pagado en los últimos 12 meses (en soles) del propio usuario. Es la fuente de
// verdad del NIVEL (Member/VIP/Elite/Black), separado de los PUNTOS de canje. El servidor
// aplica un self-gate: solo devuelve el consumo del propio auth.uid() (o de staff).
export async function getClientSpend12m(userId: string): Promise<number> {
  const { data, error } = await supabase.rpc('client_spend_12m', { p_user: userId });
  if (error) throw error;
  return Number(data) || 0;
}
