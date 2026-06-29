import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import {
  EmeraldGradient, Eyebrow, MonthCal, Scroll, FixedBar, Btn,
  T, serif, sans,
} from '../ui';
import { BELYSH } from '../data';
import { takenTimes } from '../api/appointments';
const B = BELYSH as any;

export default function Booking({ s, st, setSt, onNext }: any) {
  const ready = st.day && st.time && st.stylist;
  const [takenList, setTakenList] = useState<string[]>([]);

  // Cupos ya reservados para ese día + estilista (disponibilidad real).
  useEffect(() => {
    let alive = true;
    if (st.day && st.stylist) {
      takenTimes(st.day, st.stylist)
        .then((arr) => {
          if (!alive) return;
          setTakenList(arr);
          if (st.time && arr.includes(st.time)) setSt((o: any) => ({ ...o, time: null }));
        })
        .catch(() => {});
    } else {
      setTakenList([]);
    }
    return () => { alive = false; };
  }, [st.day, st.stylist]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <Scroll pb={120}>
        <View style={{ paddingHorizontal: 22 }}>
          <Eyebrow>Reservar</Eyebrow>
          <Text style={{ fontFamily: serif(500), fontSize: 27, color: T.ink, marginTop: 6, lineHeight: 30 }}>{s.name}</Text>

          <Eyebrow style={{ marginTop: 24, marginBottom: 12 }}>¿Con quién?</Eyebrow>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingTop: 2, paddingBottom: 8 }}>
            {B.STYLISTS.map((p: any) => {
              const on = st.stylist === p.id;
              return (
                <Pressable key={p.id} onPress={() => setSt((o: any) => ({ ...o, stylist: p.id }))}
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

          <Eyebrow style={{ marginTop: 26, marginBottom: 12 }}>¿Qué día? — Junio 2026</Eyebrow>
          <MonthCal sel={st.day} onPick={(n: number) => setSt((o: any) => ({ ...o, day: n }))} />

          <Eyebrow style={{ marginTop: 26, marginBottom: 4 }}>¿A qué hora?</Eyebrow>
          {!st.stylist || !st.day ? (
            <Text style={{ fontFamily: sans(600), fontSize: 12, color: T.muted, marginBottom: 12 }}>
              Elige estilista y día para ver los cupos disponibles.
            </Text>
          ) : (
            <View style={{ height: 8 }} />
          )}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {B.TIMES.map((t: string) => {
              const isTaken = takenList.includes(t);
              const on = st.time === t;
              return (
                <Pressable key={t} disabled={isTaken} onPress={() => setSt((o: any) => ({ ...o, time: t }))}
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
            })}
          </View>
        </View>
      </Scroll>
      <FixedBar>
        <Btn full onPress={ready ? onNext : undefined} disabled={!ready} style={{ opacity: ready ? 1 : 0.4 }}>Continuar</Btn>
      </FixedBar>
    </View>
  );
}
