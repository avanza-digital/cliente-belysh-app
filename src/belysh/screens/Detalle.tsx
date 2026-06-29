import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import {
  T, serif, sans, RES, parsePos,
  Glass, EmeraldGradient, Photo, Eyebrow, Stars, Btn, Scroll, FixedBar, I,
} from '../ui';
import { BELYSH } from '../data';
import { money } from '../lib/money';

const B = BELYSH as any;

const RITUAL = ['Consulta y diagnóstico capilar', 'Productos premium sin amoníaco', 'Lavado ritual y peinado final'];

export default function Detalle(props: any) {
  const s = props.s || B.SERVICES[0];
  const onBook = props.onBook;
  const stylist = B.STYLISTS[0];

  return (
    <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <Scroll pb={120}>
        {/* Hero */}
        <View style={{ paddingHorizontal: 16 }}>
          <Photo tone={s.tone} tag={s.tag} img={s.img} pos={s.pos} h={300} r={18} style={{ marginTop: -88 }} />
        </View>

        <View style={{ paddingTop: 22, paddingHorizontal: 24 }}>
          <Eyebrow>{s.cat}</Eyebrow>
          <Text style={{ fontFamily: serif(500), fontSize: 32, color: T.ink, lineHeight: Math.round(32 * 1.05), marginTop: 8 }}>
            {s.name}
          </Text>

          {/* Chips precio / min / rating */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <EmeraldGradient radius={999} style={{ paddingVertical: 8, paddingHorizontal: 16, boxShadow: '0 6px 14px rgba(15,107,80,0.3)' as any }}>
              <Text style={{ color: '#fff', fontFamily: sans(600), fontSize: 13 }}>{money(s.price)}</Text>
            </EmeraldGradient>
            <Glass variant="chip" radius={999} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 16 }}>
              {I.clock(T.body)}
              <Text style={{ color: T.body, fontFamily: sans(700), fontSize: 13 }}>{s.min} min</Text>
            </Glass>
            <Glass variant="chip" radius={999} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16 }}>
              <Text style={{ color: T.body, fontFamily: sans(700), fontSize: 13 }}>4.9 <Text style={{ color: '#C9A063' }}>★</Text></Text>
            </Glass>
          </View>

          <Text style={{ fontFamily: sans(400), fontSize: 15, lineHeight: Math.round(15 * 1.65), color: T.body, marginTop: 18 }}>
            {s.desc}
          </Text>

          {/* Antes / Después */}
          <Eyebrow style={{ marginTop: 22, marginBottom: 12 }}>Antes / Después</Eyebrow>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {['Antes', 'Después'].map((lbl) => (
              <View key={lbl} style={{ flex: 1, borderRadius: 18, overflow: 'hidden', height: 132 }}>
                <Image source={RES(s.img)} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition={parsePos(s.pos)} transition={200} />
                <View style={{ position: 'absolute', left: 10, bottom: 10, backgroundColor: 'rgba(20,30,24,0.5)', paddingVertical: 4, paddingHorizontal: 11, borderRadius: 999 }}>
                  <Text style={{ color: '#fff', fontFamily: sans(600), fontSize: 11, letterSpacing: 0.5 }}>{lbl}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Tu estilista */}
          <Eyebrow style={{ marginTop: 24, marginBottom: 12 }}>Tu estilista</Eyebrow>
          <Glass radius={20} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16, boxShadow: '0 8px 20px rgba(20,45,35,0.06)' as any }}>
            <View style={{ width: 52, height: 52, borderRadius: 26, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(201,160,99,0.5)', alignItems: 'center', justifyContent: 'center' }}>
              <EmeraldGradient style={StyleSheet.absoluteFill} />
              <Text style={{ color: '#fff', fontFamily: serif(600), fontSize: 19 }}>{stylist.initials}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: serif(600), fontSize: 18, color: T.ink }}>{stylist.name}</Text>
              <Text style={{ fontFamily: sans(600), fontSize: 12.5, color: T.body, marginTop: 1 }}>{stylist.role}</Text>
            </View>
            <Text style={{ fontFamily: sans(600), fontSize: 12.5, color: '#C9A063' }}>{stylist.rating} ★</Text>
          </Glass>

          {/* Tu ritual incluye */}
          <Glass radius={22} style={{ paddingVertical: 18, paddingHorizontal: 20, marginTop: 20 }}>
            <Eyebrow style={{ marginBottom: 12 }}>Tu ritual incluye</Eyebrow>
            {RITUAL.map((x) => (
              <View key={x} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 9 }}>
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: T.soft, alignItems: 'center', justifyContent: 'center' }}>
                  <Svg width={9} height={9} viewBox="0 0 9 9">
                    <Path d="M1 4.5L3.5 7L8 1.5" stroke={T.roseDeep} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={{ fontFamily: sans(600), fontSize: 14, color: T.body }}>{x}</Text>
              </View>
            ))}
          </Glass>

          {/* Reviews */}
          <Eyebrow style={{ marginTop: 24, marginBottom: 12 }}>Lo que dicen ♥</Eyebrow>
          {B.REVIEWS.slice(0, 2).map((r: any) => (
            <Glass key={r.id} radius={18} style={{ paddingVertical: 16, paddingHorizontal: 18, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontFamily: sans(600), fontSize: 13.5, color: T.ink }}>{r.name}</Text>
                <Stars n={r.stars} s={11} />
              </View>
              <Text style={{ fontFamily: sans(400), fontSize: 13.5, color: T.body, lineHeight: Math.round(13.5 * 1.55), marginTop: 6 }}>
                "{r.text}"
              </Text>
            </Glass>
          ))}
        </View>
      </Scroll>

      <FixedBar>
        <Btn full onPress={onBook}>{`Reservar este ritual · ${money(s.price)}`}</Btn>
      </FixedBar>
    </View>
  );
}
