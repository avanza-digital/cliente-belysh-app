import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, Pattern, Rect } from 'react-native-svg';
import {
  Glass, Photo, Eyebrow, GradientText, EmeraldGradient, EmeraldCard, Scroll,
  T, serif, sans,
} from '../ui';
import { BELYSH, Promo } from '../data';
import { money } from '../lib/money';
const B = BELYSH;

// Botón pequeño "Reservar" — réplica del Btn solid del prototipo con padding 11/20 y fontSize 12.5
function ReserveBtn({ onPress }: any) {
  return (
    <Pressable onPress={onPress}
      style={({ pressed }) => [{
        borderRadius: 999, overflow: 'hidden',
        opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.97 : 1 }],
      }]}>
      <EmeraldGradient style={{ borderRadius: 999, boxShadow: '0 14px 28px rgba(15,107,80,0.4)' as any }}>
        <View style={{ paddingVertical: 11, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: sans(600), fontSize: 12.5, letterSpacing: 0.4, color: '#fff' }}>Reservar</Text>
        </View>
      </EmeraldGradient>
    </Pressable>
  );
}

export default function Promos({ go, openPromo }: { go: (t: string) => void; openPromo: (p: Promo) => void }) {
  return (
    <Scroll pb={40}>
      {/* Encabezado */}
      <View style={{ paddingTop: 8, paddingHorizontal: 20 }}>
        <Eyebrow>Mimos & ofertas</Eyebrow>
        <View style={{ marginTop: 6 }}>
          <GradientText style={{ fontFamily: serif(500), fontSize: 32, lineHeight: 38 }}>Promociones</GradientText>
        </View>
      </View>

      {/* Lista */}
      <View style={{ paddingTop: 16, paddingHorizontal: 20, flexDirection: 'column', gap: 16 }}>
        {B.PROMOS.map((p) => (
          <Glass key={p.id} radius={22} style={{ overflow: 'hidden', boxShadow: '0 10px 26px rgba(20,45,35,0.08)' as any }}>
            <View style={{ position: 'relative', padding: 10 }}>
              <Photo tone={p.tone} tag={String(p.kind).toLowerCase()} img={p.img} h={130} r={18} />
              <Glass variant="card" radius={999}
                style={{ position: 'absolute', top: 20, right: 20, paddingVertical: 7, paddingHorizontal: 14 }}>
                <Text style={{ fontFamily: sans(700), fontSize: 12.5, color: T.roseDeep }}>{p.badge}</Text>
              </Glass>
            </View>
            <View style={{ paddingTop: 6, paddingHorizontal: 20, paddingBottom: 20 }}>
              <Eyebrow style={{ fontSize: 9.5 }}>{p.kind}</Eyebrow>
              <Text style={{ fontFamily: serif(600), fontSize: 22, color: T.ink, marginTop: 5 }}>{p.title}</Text>
              <Text style={{ fontFamily: sans(600), fontSize: 13, color: T.body, lineHeight: 20, marginTop: 6 }}>{p.desc}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 9 }}>
                  <Text style={{ fontFamily: serif(600), fontSize: 26, color: T.roseDeep }}>{money(p.now)}</Text>
                  <Text style={{ fontFamily: sans(700), fontSize: 14, color: T.muted, textDecorationLine: 'line-through' }}>{money(p.was)}</Text>
                </View>
                <ReserveBtn onPress={() => {
                  // la promo entra al flujo con su precio; el servidor lo valida vía promo_id
                  if (openPromo) openPromo(p);
                  else if (go) go('servicios');
                }} />
              </View>
            </View>
          </Glass>
        ))}

        {/* Tarjeta de regalo */}
        <EmeraldCard radius={20}
          style={{ boxShadow: '0 20px 40px -14px rgba(6,32,24,0.5), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 0 0 1px rgba(201,160,99,0.28)' as any }}>
          {/* guilloché metálico (repeating-linear-gradient 116deg del prototipo) */}
          <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Defs>
              <Pattern id="promo-guilloche" patternUnits="userSpaceOnUse" width={8} height={8} patternTransform="rotate(26)">
                <Rect width={1} height={8} fill="#fff" fillOpacity={0.045} />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#promo-guilloche)" opacity={0.55} />
          </Svg>
          {/* glow dorado (aprox. del radial-gradient) */}
          <View pointerEvents="none" style={{ position: 'absolute', right: -50, top: -60, width: 190, height: 190, borderRadius: 95, backgroundColor: 'rgba(201,160,99,0.12)' }} />
          {/* brillo diagonal (aprox. del sheen 118deg) */}
          <LinearGradient pointerEvents="none" colors={['transparent', 'rgba(255,255,255,0.10)', 'transparent']}
            locations={[0.34, 0.47, 0.57]} start={{ x: 0, y: 0.2 }} end={{ x: 1, y: 0.8 }}
            style={StyleSheet.absoluteFill} />

          <View style={{ paddingVertical: 22, paddingHorizontal: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={{ fontFamily: sans(700), fontSize: 9.5, letterSpacing: 2.4, textTransform: 'uppercase', color: '#EBD6A0' }}>Tarjeta de regalo</Text>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M4 11h16v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8zM3 7h18v4H3zM12 7v13" stroke="#EBD6A0" strokeWidth={1.4} strokeLinejoin="round" />
                <Path d="M12 7C12 7 10.5 3.5 8.2 4.3 6.4 5 7.5 7 12 7zm0 0s1.5-3.5 3.8-2.7c1.8.7.7 2.7-3.8 2.7z" stroke="#EBD6A0" strokeWidth={1.4} strokeLinejoin="round" />
              </Svg>
            </View>

            <Text style={{ fontFamily: serif(500), fontSize: 25, color: '#fff', marginTop: 12, lineHeight: 27 }}>
              Regala belleza <Text style={{ fontFamily: serif(500, true), color: '#fff' }}>Belysh</Text>
            </Text>
            <Text style={{ fontFamily: sans(500), fontSize: 12.5, color: 'rgba(255,255,255,0.72)', marginTop: 8, lineHeight: 19 }}>
              Digital, lista para enviar a quien más quieres en segundos.
            </Text>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
              {[50, 100, 200].map((d, i) =>
                i === 0 ? (
                  <LinearGradient key={d} colors={['#F3E0A6', '#C9A063']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={{ flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: sans(700), fontSize: 13.5, letterSpacing: 0.3, color: '#0A3B2C', fontVariant: ['tabular-nums'] }}>{money(d)}</Text>
                  </LinearGradient>
                ) : (
                  <View key={d} style={{ flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(231,207,155,0.32)' }}>
                    <Text style={{ fontFamily: sans(700), fontSize: 13.5, letterSpacing: 0.3, color: '#EBD6A0', fontVariant: ['tabular-nums'] }}>{money(d)}</Text>
                  </View>
                )
              )}
            </View>

            {/* Btn override: fondo crema + texto roseDeep */}
            <Pressable onPress={() => Alert.alert('Próximamente', 'Pronto disponible.')}
              style={({ pressed }) => [{
                marginTop: 14, borderRadius: 999, backgroundColor: '#FBF8F1',
                boxShadow: '0 10px 24px rgba(0,0,0,0.22)' as any,
                opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.98 : 1 }],
              }]}>
              <View style={{ paddingVertical: 16, paddingHorizontal: 26, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: sans(600), fontSize: 14, letterSpacing: 0.4, color: T.roseDeep }}>Comprar tarjeta de regalo</Text>
              </View>
            </Pressable>
          </View>
        </EmeraldCard>

        {/* Trae una amiga */}
        <Pressable onPress={() => Alert.alert('Próximamente', 'Pronto disponible.')}
          style={{ backgroundColor: T.blush, borderWidth: 1.5, borderStyle: 'dashed', borderColor: T.rose, borderRadius: 22, padding: 22, alignItems: 'center' }}>
          <Text style={{ fontFamily: serif(600), fontSize: 22, color: T.ink, marginTop: 6, textAlign: 'center' }}>Trae una amiga</Text>
          <Text style={{ fontFamily: sans(600), fontSize: 13, color: T.body, marginTop: 6, lineHeight: 20, textAlign: 'center' }}>
            Ambas reciben <Text style={{ fontFamily: sans(700), color: T.roseDeep }}>{money(20)}</Text> en su próxima visita.
          </Text>
        </Pressable>
      </View>
    </Scroll>
  );
}
