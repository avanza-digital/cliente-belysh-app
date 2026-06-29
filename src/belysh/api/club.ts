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
