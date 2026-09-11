import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/db';
import { DEMO_MODE } from './demoFlag';
import { demoSupabase } from './demoBackend';

// Proyecto Supabase "BELYSH" (org Belysh). La llave publishable es segura en el cliente.
// Configurable por entorno (EXPO_PUBLIC_*) para separar dev/prod; fallback a los valores actuales.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://ivacfijeupgcxmzdsqnk.supabase.co';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? 'sb_publishable_j9CC_BKob1QbF_7HXUqbvg_zAGQZ6ZE';

const realClient = () => createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce', // necesario para OAuth (Google) en móvil
  },
});

// En MODO DEMO la app no habla con Supabase: usa el backend falso en memoria.
// Es el único punto donde se decide; el resto de api/ y las pantallas no cambian.
if (DEMO_MODE) {
  console.warn(
    '[BELYSH] MODO DEMO ACTIVO: datos falsos en el dispositivo, sin Supabase. ' +
    'Apágalo (src/belysh/api/demoFlag.ts) antes de cualquier build para tiendas.',
  );
}

export const supabase: ReturnType<typeof realClient> = DEMO_MODE ? demoSupabase : realClient();
