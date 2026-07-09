import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  Scroll, Eyebrow, Glass, EmeraldGradient,
  T, serif, sans,
} from '../ui';
import { useAuth } from '../api/auth';
import { listMyAppointments, cancelAppointment } from '../api/appointments';
import { cancelReminder } from '../lib/reminders';
import { traducir } from '../lib/errors';
import { fmtDate, fmtTime } from '../lib/date';
import { Appointment } from '../types/db';

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const yearOf = (iso?: string) => {
  if (!iso) return '';
  const y = new Date(iso).getFullYear();
  return Number.isFinite(y) ? String(y) : '';
};
const initials = (name?: string | null) =>
  (name || 'Tú').trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'Tú';

// Botón "pill" del prototipo (ghost / soft / grad).
function PillBtn({ kind, label, onPress, full }: any) {
  const isGrad = kind === 'grad';
  const isSoft = kind === 'soft';
  const isGhost = kind === 'ghost';
  const color = isSoft ? T.roseDeep : isGrad ? '#fff' : T.body;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      // Amplía el área táctil de estos pills angostos: generoso en vertical,
      // acotado en horizontal (los pares Reagendar/Cancelar van con gap 10 → 4+4<10, sin solape).
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      style={({ pressed }) => [
        {
          flex: full ? undefined : 1,
          width: full ? '100%' : undefined,
          marginTop: full ? 14 : 0,
          borderRadius: 999,
          overflow: 'hidden',
          borderWidth: isGhost ? 1.5 : 0,
          borderColor: isGhost ? T.line : undefined,
          backgroundColor: isSoft ? T.soft : 'transparent',
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      {isGrad && <EmeraldGradient style={StyleSheet.absoluteFill} />}
      <Text style={{ textAlign: 'center', paddingVertical: 11, fontFamily: sans(600), fontSize: 12.5, color }}>
        {label}
      </Text>
    </Pressable>
  );
}

// Banner + formulario inline para que la invitada guarde su cuenta (citas y puntos
// se conservan: es el mismo usuario de Supabase, solo se le añade email/contraseña).
function GuestBanner({ onConvert }: { onConvert: (name: string, email: string, pwd: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const inputStyle = {
    fontFamily: sans(600), fontSize: 14, color: T.ink,
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: T.line,
    paddingVertical: 13, paddingHorizontal: 16,
  } as const;

  const submit = async () => {
    if (busy) return;
    if (!email.trim() || !pwd) { Alert.alert('Faltan datos', 'Escribe tu correo y una contraseña.'); return; }
    if (pwd.length < 6) { Alert.alert('Contraseña corta', 'Usa al menos 6 caracteres.'); return; }
    setBusy(true);
    try {
      await onConvert(name.trim(), email, pwd);
      setSent(true);
    } catch (e: any) {
      Alert.alert('Ups', traducir(e?.message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Glass radius={22} style={{ marginTop: 22, marginHorizontal: 20, padding: 18, boxShadow: '0 10px 26px rgba(20,45,35,0.1)' as any }}>
      {sent ? (
        <>
          <Text style={{ fontFamily: serif(600), fontSize: 19, color: T.ink }}>Revisa tu correo ✉️</Text>
          <Text style={{ fontFamily: sans(600), fontSize: 12.5, color: T.body, marginTop: 6, lineHeight: 18 }}>
            Te enviamos un enlace a {email.trim()}. Al confirmarlo, tu cuenta quedará guardada con tus citas y puntos.
          </Text>
        </>
      ) : (
        <>
          <Eyebrow c={T.goldText} style={{ fontSize: 9.5 }}>Estás como invitada</Eyebrow>
          <Text style={{ fontFamily: serif(600), fontSize: 19, color: T.ink, marginTop: 5 }}>Guarda tus citas y puntos</Text>
          <Text style={{ fontFamily: sans(600), fontSize: 12.5, color: T.body, marginTop: 5, lineHeight: 18 }}>
            Crea tu cuenta y conserva todo tu historial: nada se pierde si cambias de teléfono.
          </Text>
          {open && (
            <View style={{ gap: 10, marginTop: 14 }}>
              <TextInput placeholder="Tu nombre" placeholderTextColor={T.muted} value={name} onChangeText={setName}
                autoCapitalize="words" style={inputStyle} accessibilityLabel="Tu nombre" />
              <TextInput placeholder="Correo electrónico" placeholderTextColor={T.muted} value={email} onChangeText={setEmail}
                autoCapitalize="none" keyboardType="email-address" autoComplete="email" style={inputStyle} accessibilityLabel="Correo electrónico" />
              <TextInput placeholder="Contraseña (mín. 6)" placeholderTextColor={T.muted} value={pwd} onChangeText={setPwd}
                secureTextEntry style={inputStyle} accessibilityLabel="Contraseña" />
            </View>
          )}
          <PillBtn kind="grad" full label={busy ? 'Guardando…' : open ? 'Guardar mi cuenta' : 'Crear mi cuenta'}
            onPress={open ? submit : () => setOpen(true)} />
        </>
      )}
    </Glass>
  );
}

export default function Perfil({ onReschedule, onRebook }: { onReschedule: (a: Appointment) => void; onRebook: (a: Appointment) => void }) {
  const { profile, user, signOut, convertGuest } = useAuth();
  const isGuest = !!user?.is_anonymous;
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isAlive: () => boolean = () => true) => {
    setError(false);
    try {
      const rows = await listMyAppointments();
      if (isAlive()) setAppts(rows);
    } catch {
      if (isAlive()) setError(true);
    } finally {
      if (isAlive()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    load(() => alive);
    return () => { alive = false; };
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  };

  const cancel = (id: string) => {
    Alert.alert('Cancelar cita', '¿Seguro que quieres cancelar esta cita?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar', style: 'destructive',
        onPress: async () => {
          try { await cancelAppointment(id); cancelReminder(id); await load(); }
          catch (e: any) { Alert.alert('Ups', traducir(e?.message)); }
        },
      },
    ]);
  };

  const badge = (status: string) => {
    if (status === 'Confirmada' || status === 'Completada') return { c: T.emerald, bg: '#EFE7DF' };
    if (status === 'Cancelada') return { c: '#B5562F', bg: 'rgba(181,86,47,0.12)' };
    return { c: T.roseDeep, bg: T.soft };
  };

  const name = profile?.full_name || (isGuest ? 'Invitada' : 'Bienvenida');
  // "Visitas" = solo citas realmente completadas (no futuras ni canceladas).
  const visits = appts.filter((a) => a.status === 'completada').length;

  const account = ['Notificaciones y recordatorios', 'Métodos de pago', 'Mis reseñas', 'Ayuda', 'Cerrar sesión'];
  const onAccount = (item: string) => {
    if (item === 'Cerrar sesión') {
      Alert.alert('Cerrar sesión', '¿Salir de tu cuenta?', [
        { text: 'No', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: () => signOut() },
      ]);
    } else {
      Alert.alert('Próximamente', 'Pronto disponible.');
    }
  };

  return (
    <Scroll pb={40} onRefresh={refresh} refreshing={refreshing}>
      {/* Avatar + nombre */}
      <View style={{ paddingTop: 12, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View
          style={{
            width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            borderWidth: 2, borderColor: 'rgba(255,255,255,0.55)',
            boxShadow: '0 12px 24px rgba(15,107,80,0.3), 0 0 0 3px rgba(201,160,99,0.55)' as any,
          }}
        >
          <EmeraldGradient style={StyleSheet.absoluteFill} />
          <Text style={{ fontFamily: sans(500), fontSize: 26, color: '#fff' }}>{initials(profile?.full_name)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: serif(600), fontSize: 25, color: T.ink }}>{name}</Text>
          <Text style={{ fontFamily: sans(600), fontSize: 12.5, color: T.muted, marginTop: 3 }}>
            {isGuest ? 'Cuenta de invitada' : profile?.member_since ? `Miembro desde ${yearOf(profile.member_since)}` : 'Miembro Belysh'} · {visits} {visits === 1 ? 'visita' : 'visitas'}
          </Text>
        </View>
      </View>

      {/* Invitada: convertir a cuenta real conservando citas y puntos (patrón Tubi/Skip) */}
      {isGuest && (
        <GuestBanner
          onConvert={async (name, email, pwd) => {
            const { error } = await convertGuest(email, pwd, name || undefined);
            if (error) throw error;
          }}
        />
      )}

      {/* Mis citas */}
      <Eyebrow style={{ paddingTop: 26, paddingHorizontal: 20, paddingBottom: 12 }}>Mis citas</Eyebrow>
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {loading ? (
          <ActivityIndicator color={T.rose} style={{ paddingVertical: 24 }} />
        ) : error ? (
          <Glass radius={22} style={{ paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center', boxShadow: '0 8px 20px rgba(20,45,35,0.06)' as any }}>
            <Text style={{ fontFamily: serif(600), fontSize: 18, color: T.ink, textAlign: 'center' }}>No pudimos cargar tus citas.</Text>
            <Pressable
              onPress={() => load()}
              accessibilityRole="button"
              accessibilityLabel="Reintentar"
              hitSlop={8}
              style={({ pressed }) => ({
                marginTop: 14, backgroundColor: T.soft, borderRadius: 999,
                paddingVertical: 11, paddingHorizontal: 28, opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ fontFamily: sans(600), fontSize: 12.5, color: T.roseDeep }}>Reintentar</Text>
            </Pressable>
          </Glass>
        ) : appts.length === 0 ? (
          <Glass radius={22} style={{ paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center', boxShadow: '0 8px 20px rgba(20,45,35,0.06)' as any }}>
            <Text style={{ fontFamily: serif(600), fontSize: 18, color: T.ink }}>Aún no tienes citas</Text>
            <Text style={{ fontFamily: sans(600), fontSize: 13, color: T.muted, marginTop: 6, textAlign: 'center' }}>
              Reserva tu primer ritual y aparecerá aquí.
            </Text>
          </Glass>
        ) : (
          appts.map((a) => {
            const status = cap(a.status);
            const cancelled = a.status === 'cancelada';
            const bd = badge(status);
            return (
              <Glass
                key={a.id}
                radius={22}
                style={{ paddingVertical: 18, paddingHorizontal: 20, boxShadow: '0 8px 20px rgba(20,45,35,0.07)' as any, opacity: cancelled ? 0.66 : 1 }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={{ fontFamily: serif(600), fontSize: 19, color: T.ink, lineHeight: 21, maxWidth: 190, textDecorationLine: cancelled ? 'line-through' : 'none' }}>
                    {a.service_name}
                  </Text>
                  <View style={{ backgroundColor: bd.bg, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 }}>
                    <Text style={{ fontFamily: sans(600), fontSize: 10, color: bd.c }}>{status}</Text>
                  </View>
                </View>
                <Text style={{ fontFamily: sans(600), fontSize: 13, color: T.body, marginTop: 10 }}>
                  {fmtDate(a.starts_at)} · {fmtTime(a.starts_at)}{a.stylist_name ? ` · con ${a.stylist_name}` : ''}
                </Text>
                {a.status === 'completada' || cancelled ? (
                  // Cita terminada o cancelada → NUEVA reserva (patrón "Book again" de Fresha),
                  // nunca reagendar la cita vieja.
                  <PillBtn kind="grad" full label="Reservar de nuevo" onPress={() => onRebook && onRebook(a)} />
                ) : (
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                    <PillBtn kind="ghost" label="Reagendar" onPress={() => onReschedule && onReschedule(a)} />
                    <PillBtn kind="soft" label="Cancelar" onPress={() => cancel(a.id)} />
                  </View>
                )}
              </Glass>
            );
          })
        )}
      </View>

      {/* Cuenta */}
      <Eyebrow style={{ paddingTop: 26, paddingHorizontal: 20, paddingBottom: 12 }}>Cuenta</Eyebrow>
      <Glass
        radius={22}
        style={{ marginHorizontal: 20, paddingHorizontal: 20, paddingBottom: 8, boxShadow: '0 8px 20px rgba(20,45,35,0.06)' as any }}
      >
        {account.map((x, i, arr) => (
          <Pressable
            key={x}
            onPress={() => onAccount(x)}
            accessibilityRole="button"
            accessibilityLabel={x}
            style={{
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              paddingVertical: 16, paddingHorizontal: 18,
              borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: T.line,
            }}
          >
            <Text style={{ fontFamily: sans(700), fontSize: 14.5, color: x === 'Cerrar sesión' ? T.roseDeep : T.ink }}>{x}</Text>
            <Svg width={7} height={12} viewBox="0 0 7 12">
              <Path d="M1 1l5 5-5 5" stroke={T.muted} strokeWidth={1.5} fill="none" strokeLinecap="round" />
            </Svg>
          </Pressable>
        ))}
      </Glass>
    </Scroll>
  );
}
