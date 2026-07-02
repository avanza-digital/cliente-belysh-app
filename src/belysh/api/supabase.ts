import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/db';

// Proyecto Supabase "BELYSH" (org Belysh). La llave publishable es segura en el cliente.
// Configurable por entorno (EXPO_PUBLIC_*) para separar dev/prod; fallback a los valores actuales.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://ivacfijeupgcxmzdsqnk.supabase.co';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? 'sb_publishable_j9CC_BKob1QbF_7HXUqbvg_zAGQZ6ZE';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce', // necesario para OAuth (Google) en móvil
  },
});
