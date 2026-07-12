import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../belysh/api/supabase';
import { EmeraldGradient, serif, sans } from '../belysh/ui';
import { traducir } from '../belysh/lib/errors';

/* Destino del enlace "Olvidé mi contraseña" (belysh://reset).
   Supabase redirige aquí con ?code=… (PKCE) o, según configuración del
   proyecto, con #access_token=…&refresh_token=… en el fragmento. Cubrimos
   ambos: canjeamos la sesión de recuperación y pedimos la contraseña nueva. */

// Mismo campo que Welcome (a nivel de módulo: si viviera dentro del componente,
// cada tecla recrearía el tipo y RN desmontaría el TextInput perdiendo el foco).
const Field = ({ value, set, ph }: { value: string; set: (v: string) => void; ph: string }) => (
  <TextInput
    value={value}
    onChangeText={set}
    placeholder={ph}
    accessibilityLabel={ph}
    placeholderTextColor="rgba(255,255,255,0.55)"
    secureTextEntry
    autoCapitalize="none"
    autoCorrect={false}
    style={{
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.26)',
      backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 999,
      paddingVertical: 17, paddingHorizontal: 24,
      fontFamily: sans(500), fontSize: 14.5, color: '#fff',
    }}
  />
);

export default function Reset() {
  const params = useLocalSearchParams<{ code?: string; error_description?: string }>();
  const url = Linking.useURL();
  const [phase, setPhase] = useState<'canjeando' | 'lista' | 'error'>('canjeando');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [busy, setBusy] = useState(false);
  const canjeado = useRef(false); // el canje es de un solo uso: no repetirlo por re-render

  useEffect(() => {
    if (canjeado.current) return;
    (async () => {
      try {
        if (params.error_description) throw new Error(String(params.error_description));
        if (params.code) {
          canjeado.current = true;
          const { error } = await supabase.auth.exchangeCodeForSession(String(params.code));
          if (error) throw error;
          setPhase('lista');
          return;
        }
        // variante con tokens en el fragmento (#access_token=…&refresh_token=…)
        const frag = url?.split('#')[1];
        if (frag) {
          const p = new URLSearchParams(frag);
          const access_token = p.get('access_token');
          const refresh_token = p.get('refresh_token');
          if (access_token && refresh_token) {
            canjeado.current = true;
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) throw error;
            setPhase('lista');
            return;
          }
        }
        // sin code ni tokens todavía: puede que la URL llegue en el siguiente render
        if (url) setPhase('error');
      } catch {
        setPhase('error');
      }
    })();
  }, [params.code, params.error_description, url]);

  const guardar = async () => {
    if (busy) return;
    if (pwd.length < 6) { Alert.alert('Contraseña', 'Usa al menos 6 caracteres.'); return; }
    if (pwd !== pwd2) { Alert.alert('No coinciden', 'Escribe la misma contraseña en ambos campos.'); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwd });
      if (error) throw error;
      Alert.alert('Contraseña actualizada', 'Ya puedes usar tu nueva contraseña.');
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Ups', traducir(e?.message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#0A2A20' }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28, gap: 14 }}>
        <Text style={{ fontFamily: serif(600), fontSize: 30, color: '#fff' }}>
          {phase === 'error' ? 'Enlace no válido' : 'Nueva contraseña'}
        </Text>

        {phase === 'canjeando' && (
          <Text style={{ fontFamily: sans(500), fontSize: 14.5, color: 'rgba(255,255,255,0.72)', lineHeight: 21 }}>
            Verificando tu enlace…
          </Text>
        )}

        {phase === 'error' && (
          <>
            <Text style={{ fontFamily: sans(500), fontSize: 14.5, color: 'rgba(255,255,255,0.72)', lineHeight: 21 }}>
              Este enlace ya se usó o expiró. Pide uno nuevo desde “Olvidé mi contraseña”.
            </Text>
            <Pressable onPress={() => router.replace('/')}
              style={({ pressed }) => [{ borderRadius: 999, overflow: 'hidden', marginTop: 8, opacity: pressed ? 0.92 : 1 }]}>
              <View style={{ paddingVertical: 16, alignItems: 'center', borderRadius: 999, backgroundColor: '#FBF8F1' }}>
                <Text style={{ fontFamily: sans(600), fontSize: 14, color: '#0A3B2C' }}>Volver al inicio</Text>
              </View>
            </Pressable>
          </>
        )}

        {phase === 'lista' && (
          <>
            <Text style={{ fontFamily: sans(500), fontSize: 14.5, color: 'rgba(255,255,255,0.72)', lineHeight: 21 }}>
              Elige una contraseña nueva para tu cuenta.
            </Text>
            <Field value={pwd} set={setPwd} ph="Nueva contraseña" />
            <Field value={pwd2} set={setPwd2} ph="Repite la contraseña" />
            <Pressable onPress={guardar} disabled={busy}
              style={({ pressed }) => [{ borderRadius: 999, overflow: 'hidden', marginTop: 8, opacity: busy ? 0.6 : pressed ? 0.92 : 1 }]}>
              <EmeraldGradient style={{ borderRadius: 999 }}>
                <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                  <Text style={{ fontFamily: sans(600), fontSize: 14, letterSpacing: 0.4, color: '#fff' }}>
                    {busy ? 'Guardando…' : 'Guardar contraseña'}
                  </Text>
                </View>
              </EmeraldGradient>
            </Pressable>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
