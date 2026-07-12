import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppState } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { Profile } from '../types/db';

WebBrowser.maybeCompleteAuthSession();

// Borra la cuenta y sus datos vía RPC delete_account (perfil, citas y puntos se
// van en cascada; los pagos confirmados quedan anónimos por retención contable).
// Tras el borrado la sesión local ya no vale: signOut es best-effort.
export async function deleteAccount() {
  const { error } = await supabase.rpc('delete_account');
  if (error) throw error;
  try { await supabase.auth.signOut(); } catch {}
}

type AuthValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => ReturnType<typeof supabase.auth.signInWithPassword>;
  signUp: (email: string, password: string, fullName?: string) => ReturnType<typeof supabase.auth.signUp>;
  signInGuest: () => ReturnType<typeof supabase.auth.signInAnonymously>;
  // Convierte la cuenta anónima (invitada) en cuenta real conservando citas y puntos.
  // Con "confirm email" activo, Supabase envía un enlace: la conversión se completa al confirmarlo.
  convertGuest: (email: string, password: string, fullName?: string) => ReturnType<typeof supabase.auth.updateUser>;
  signInWithGoogle: () => Promise<{ cancelled: boolean }>;
  resetPassword: (email: string) => ReturnType<typeof supabase.auth.resetPasswordForEmail>;
  signOut: () => ReturnType<typeof supabase.auth.signOut>;
};

const AuthCtx = createContext<AuthValue | null>(null);
export const useAuth = () => {
  const v = useContext(AuthCtx);
  if (!v) throw new Error('useAuth fuera de <AuthProvider>');
  return v;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid?: string | null) => {
    if (!uid) { setProfile(null); return; }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    // Error transitorio de red: NO pisar un perfil válido previo (evita que el Home
    // muestre "Bienvenida"/0 puntos por un blip). data null sin error = realmente sin fila.
    if (error) return;
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      loadProfile(data.session?.user?.id).finally(() => { if (mounted) setLoading(false); });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      loadProfile(s?.user?.id);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [loadProfile]);

  // refresca el token cuando la app vuelve al frente
  useEffect(() => {
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    return () => sub.remove();
  }, []);

  const refreshProfile = useCallback(() => loadProfile(session?.user?.id), [session, loadProfile]);

  const value = React.useMemo<AuthValue>(() => ({
    session,
    user: session?.user ?? null,
    profile,
    loading,
    refreshProfile,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email: email.trim(), password }),
    signUp: (email, password, fullName) =>
      supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: fullName } } }),
    signInGuest: () => supabase.auth.signInAnonymously(),
    convertGuest: async (email, password, fullName) => {
      const res = await supabase.auth.updateUser({
        email: email.trim(),
        password,
        data: fullName ? { full_name: fullName } : undefined,
      });
      // el trigger de profiles solo corre al CREAR el usuario; al convertir hay que
      // guardar el nombre directamente (RLS: profiles_update_own).
      if (!res.error && fullName && session?.user?.id) {
        await supabase.from('profiles').update({ full_name: fullName }).eq('id', session.user.id);
        await loadProfile(session.user.id);
      }
      return res;
    },
    signInWithGoogle: async () => {
      const redirectTo = Linking.createURL('auth-callback');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data?.url) throw new Error('No se pudo iniciar Google.');
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (res.type !== 'success' || !res.url) return { cancelled: true };
      const { queryParams } = Linking.parse(res.url);
      const code = queryParams?.code as string | undefined;
      if (!code) throw new Error('No se recibió el código de Google.');
      const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
      if (exErr) throw exErr;
      return { cancelled: false };
    },
    resetPassword: (email: string) =>
      supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: Linking.createURL('reset') }),
    signOut: () => supabase.auth.signOut(),
  }), [session, profile, loading, refreshProfile, loadProfile]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
