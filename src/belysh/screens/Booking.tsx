import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  EmeraldGradient, Eyebrow, Glass, Scroll, FixedBar, Btn,
  T, serif, sans,
} from '../ui';
import { BELYSH, Service, BookingState } from '../data';
import { takenTimes, fullDays } from '../api/appointments';
import { todayLima, ymd } from '../lib/date';
const B = BELYSH;

const DAYS_HORIZON = 42; // 6 semanas reservables en la tira de días

const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

type DayCell = { ds: string; dow: number; d: number; m: number };
function nextDays(n: number): DayCell[] {
  const t = todayLima();
  const base = Date.UTC(t.y, t.m - 1, t.d);
  return Array.from({ length: n }, (_, i) => {
    const dt = new Date(base + i * 86400000);
    return { ds: ymd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate()), dow: dt.getUTCDay(), d: dt.getUTCDate(), m: dt.getUTCMonth() };
  });
}

export default function Booking({ s, st, setSt, onNext }: { s: Service; st: BookingState; setSt: React.Dispatch<React.SetStateAction<BookingState>>; onNext: () => void }) {
  const ready = st.date && st.time && st.stylist;
  const [takenList, setTakenList] = useState<string[]>([]);
  const [loadErr, setLoadErr] = useState(false);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [fullDaysList, setFullDaysList] = useState<string[]>([]);

  // Selección con feedback háptico sutil (no-op si el dispositivo no lo soporta).
  const pick = (patch: Partial<BookingState>) => {
    Haptics.selectionAsync().catch(() => {});
    setSt((o: any) => ({ ...o, ...patch }));
  };

  const days = useMemo(() => nextDays(DAYS_HORIZON), []);
  const todayStr = days[0].ds;

  // Franjas: mañana (antes de 12:00) y tarde, como agrupan Careem/Zocdoc.
  const morning = useMemo(() => B.TIMES.filter((t: string) => parseInt(t, 10) < 12), []);
  const afternoon = useMemo(() => B.TIMES.filter((t: string) => parseInt(t, 10) >= 12), []);

  // Días completamente llenos para la estilista en las próximas 6 semanas.
  useEffect(() => {
    let alive = true;
    if (!st.stylist) { setFullDaysList([]); return; }
    fullDays(st.stylist, days[0].ds, days[days.length - 1].ds)
      .then((arr) => { if (alive) setFullDaysList(arr); })
      .catch(() => { if (alive) setFullDaysList([]); });
    return () => { alive = false; };
  }, [st.stylist, days]);

  // Cupos por hora ya reservados para ese día + estilista (disponibilidad real).
  useEffect(() => {
    let alive = true;
    setLoadErr(false);
    if (st.date && st.stylist) {
      setTakenList([]); // limpia disponibilidad anterior mientras carga
      setLoadingTimes(true);
      takenTimes(st.date, st.stylist)
        .then((arr) => {
          if (!alive) return;
          setTakenList(arr);
          // updater funcional: lee la hora ACTUAL (sin closure obsoleto)
          setSt((o: any) => (o.time && arr.includes(o.time) ? { ...o, time: null } : o));
        })
        .catch(() => { if (alive) setLoadErr(true); })
        .finally(() => { if (alive) setLoadingTimes(false); });
    } else {
      setTakenList([]);
      setLoadingTimes(false);
    }
    return () => { alive = false; };
  }, [st.date, st.stylist, setSt]);

  const dayFull = st.stylist && st.date && !loadErr && B.TIMES.length > 0 && B.TIMES.every((t: string) => takenList.includes(t));

  const TimeChip = ({ t }: { t: string }) => {
    const isTaken = takenList.includes(t);
    const on = st.time === t;
    return (
      <Pressable key={t} disabled={isTaken} onPress={() => pick({ time: t })}
        accessibilityRole="button" accessibilityLabel={`${t}${isTaken ? ', no disponible' : ''}`} accessibilityState={{ selected: on, disabled: isTaken }}
        style={{
          width: '31%', borderRadius: 16, paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
          backgroundColor: on ? undefined : '#fff', opacity: isTaken ? 0.45 : 1,
          boxShadow: (on ? '0 8px 18px rgba(15,107,80,0.3)' : '0 4px 12px rgba(20,45,35,0.05)') as any,
        }}>
        {on && <EmeraldGradient style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />}
        <Text style={{
          fontFamily: sans(600), fontSize: 14,
          color: on ? '#fff' : isTaken ? T.muted : T.ink,
          textDecorationLine: isTaken ? 'line-through' : 'none',
        }}>{t}</Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <Scroll pb={140}>
        <View style={{ paddingHorizontal: 22 }}>
          <Eyebrow>Reservar</Eyebrow>
          <Text style={{ fontFamily: serif(500), fontSize: 27, color: T.ink, marginTop: 6, lineHeight: 30 }}>{s.name}</Text>

          <Eyebrow style={{ marginTop: 24, marginBottom: 12 }}>¿Con quién?</Eyebrow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingTop: 2, paddingBottom: 8 }}>
            {B.STYLISTS.map((p: any) => {
              const on = st.stylist === p.id;
              return (
                <Pressable key={p.id} onPress={() => pick({ stylist: p.id })}
                  accessibilityRole="button" accessibilityLabel={p.name} accessibilityState={{ selected: on }}
                  style={{
                    flexShrink: 0, width: 96, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 8,
                    backgroundColor: on ? undefined : '#fff',
                    boxShadow: (on ? '0 10px 22px rgba(15,107,80,0.3)' : '0 6px 16px rgba(20,45,35,0.06)') as any,
                  }}>
                  {on && <EmeraldGradient style={[StyleSheet.absoluteFill, { borderRadius: 18 }]} />}
                  <View style={{
                    width: 48, height: 48, borderRadius: 24, alignSelf: 'center', marginBottom: 8,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: on ? 'rgba(255,255,255,0.25)' : T.soft,
                  }}>
                    <Text style={{ fontFamily: serif(600), fontSize: 18, color: on ? '#fff' : T.roseDeep }}>{p.initials}</Text>
                  </View>
                  <Text style={{ fontFamily: sans(600), fontSize: 11.5, color: on ? '#fff' : T.ink, textAlign: 'center' }}>{p.name}</Text>
                  <Text style={{ fontFamily: sans(400), fontSize: 10, color: on ? 'rgba(255,255,255,0.8)' : T.muted, marginTop: 2, textAlign: 'center' }}>{p.rating} ♥</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Eyebrow style={{ marginTop: 26, marginBottom: 12 }}>¿Qué día?</Eyebrow>
        </View>

        {/* Tira horizontal de días (6 semanas), estilo Careem/Warby Parker */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 22, paddingTop: 2, paddingBottom: 8 }}>
          {days.map((c) => {
            const full = fullDaysList.includes(c.ds);
            const on = st.date === c.ds;
            const isToday = c.ds === todayStr;
            return (
              <Pressable key={c.ds} disabled={full} onPress={() => pick({ date: c.ds })}
                accessibilityRole="button"
                accessibilityLabel={`${DOW[c.dow]} ${c.d} de ${MES[c.m]}${full ? ', no disponible' : ''}`}
                accessibilityState={{ selected: on, disabled: full }}
                style={{
                  flexShrink: 0, width: 62, borderRadius: 18, paddingVertical: 12, alignItems: 'center',
                  backgroundColor: on ? undefined : '#fff', opacity: full ? 0.45 : 1,
                  borderWidth: isToday && !on ? 1.5 : 0, borderColor: T.rose,
                  boxShadow: (on ? '0 10px 22px rgba(15,107,80,0.3)' : '0 6px 16px rgba(20,45,35,0.06)') as any,
                }}>
                {on && <EmeraldGradient style={[StyleSheet.absoluteFill, { borderRadius: 18 }]} />}
                <Text style={{ fontFamily: sans(700), fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: on ? 'rgba(255,255,255,0.85)' : T.muted }}>
                  {DOW[c.dow]}
                </Text>
                <Text style={{
                  fontFamily: serif(600), fontSize: 22, color: on ? '#fff' : full ? T.muted : T.ink, marginTop: 2,
                  textDecorationLine: full ? 'line-through' : 'none',
                }}>{c.d}</Text>
                <Text style={{ fontFamily: sans(600), fontSize: 9.5, color: on ? 'rgba(255,255,255,0.75)' : T.muted, marginTop: 1 }}>
                  {MES[c.m]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={{ paddingHorizontal: 22 }}>
          <Eyebrow style={{ marginTop: 26, marginBottom: 4 }}>¿A qué hora?</Eyebrow>
          {!st.stylist || !st.date ? (
            <Text style={{ fontFamily: sans(600), fontSize: 12, color: T.muted, marginBottom: 12 }}>
              Elige estilista y día para ver los cupos disponibles.
            </Text>
          ) : loadErr ? (
            <View style={{ paddingVertical: 8 }}>
              <Text style={{ fontFamily: sans(600), fontSize: 12.5, color: T.muted }}>
                No pudimos cargar la disponibilidad. Cambia de día u hora para reintentar.
              </Text>
            </View>
          ) : dayFull ? (
            <View style={{ paddingVertical: 8 }}>
              <Text style={{ fontFamily: sans(700), fontSize: 13, color: T.roseDeep }}>Este día se llenó.</Text>
              <Text style={{ fontFamily: sans(600), fontSize: 12.5, color: T.muted, marginTop: 2 }}>Elige otro día en el calendario.</Text>
            </View>
          ) : (
            <View style={{ height: 8 }} />
          )}
          {st.stylist && st.date && loadingTimes && !loadErr && (
            // Skeleton de cupos: mismas dimensiones que los chips reales, sin salto de layout.
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {B.TIMES.map((t: string) => (
                <View key={t} style={{ width: '31%', borderRadius: 16, paddingVertical: 15, backgroundColor: T.soft, opacity: 0.55 }}>
                  <Text style={{ fontFamily: sans(600), fontSize: 14, color: 'transparent' }}>{t}</Text>
                </View>
              ))}
            </View>
          )}
          {st.stylist && st.date && !loadingTimes && !loadErr && !dayFull && (
            <>
              <Text style={{ fontFamily: sans(700), fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: T.goldText, marginBottom: 10 }}>Mañana</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                {morning.map((t: string) => <TimeChip key={t} t={t} />)}
              </View>
              <Text style={{ fontFamily: sans(700), fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: T.goldText, marginBottom: 10 }}>Tarde</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {afternoon.map((t: string) => <TimeChip key={t} t={t} />)}
              </View>
            </>
          )}

          {/* Nota tipo Careem: política real (Perfil permite reagendar/cancelar) */}
          <Glass radius={18} style={{ marginTop: 22, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: T.soft, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: serif(700), fontSize: 14, color: T.roseDeep }}>i</Text>
            </View>
            <Text style={{ flex: 1, fontFamily: sans(600), fontSize: 12, lineHeight: 17, color: T.body }}>
              Puedes reagendar o cancelar tu cita sin costo desde tu perfil.
            </Text>
          </Glass>
        </View>
      </Scroll>
      <FixedBar>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ flexShrink: 0 }}>
            <Text style={{ fontFamily: sans(700), fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: T.muted }}>Total</Text>
            <Text style={{ fontFamily: serif(600), fontSize: 22, color: T.ink }}>
              S/ {s.price}
              <Text style={{ fontFamily: sans(600), fontSize: 12, color: T.muted }}>  · {s.min} min</Text>
            </Text>
          </View>
          <Btn onPress={ready ? onNext : undefined} disabled={!ready} style={{ flex: 1, opacity: ready ? 1 : 0.4 }}>Continuar</Btn>
        </View>
      </FixedBar>
    </View>
  );
}
