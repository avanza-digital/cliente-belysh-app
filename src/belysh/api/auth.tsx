import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppState } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';
import { Profile } from '../types/db';

WebBrowser.maybeCompleteAuthSession();

type AuthValue = {
  session: any;
  user: any;
  profile: any;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName?: string) => Promise<any>;
  signInGuest: () => Promise<any>;
  signInWithGoogle: () => Promise<{ cancelled: boolean }>;
  resetPassword: (email: string) => Promise<any>;
  signOut: () => Promise<any>;
};

const AuthCtx = createContext<AuthValue | null>(null);
export const useAuth = () => {
  const v = useContext(AuthCtx);
  if (!v) throw new Error('useAuth fuera de <AuthProvider>');
  return v;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid?: string | null) => {
    if (!uid) { setProfile(null); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadProfile(data.session?.user?.id).finally(() => setLoading(false));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      loadProfile(s?.user?.id);
    });
    return () => sub.subscription.unsubscribe();
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
  }), [session, profile, loading, refreshProfile]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
