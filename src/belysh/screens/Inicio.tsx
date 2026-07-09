import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import {
  T, serif, sans,
  Scroll, Photo, Eyebrow, Petal, Glass, EmeraldCard, EmeraldGradient,
} from '../ui';
import { BELYSH, Service } from '../data';
import { useAuth } from '../api/auth';
import { getClientSpend12m } from '../api/club';
import { listMyAppointments } from '../api/appointments';
import { Appointment } from '../types/db';
import { tierInfo } from '../lib/club';
import { money } from '../lib/money';
import { partsLima, fmtDate, fmtTime } from '../lib/date';

const B = BELYSH;

function saludoPorHora(): string {
  const h = partsLima(new Date().toISOString()).hh;
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

// Iconos de categoría (inline del prototipo → react-native-svg)
const CAT_ICONS: Record<string, (c: string) => React.ReactNode> = {
  Corte: (c) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={6} cy={7} r={2.3} stroke={c} strokeWidth={1.6} />
      <Circle cx={6} cy={17} r={2.3} stroke={c} strokeWidth={1.6} />
      <Path d="M8 8.4L19 16M8 15.6L19 8" stroke={c} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  ),
  Color: (c) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3.5c3.2 4 5 6.6 5 9.1a5 5 0 11-10 0c0-2.5 1.8-5.1 5-9.1z" stroke={c} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  ),
  Tratamiento: (c) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M5.5 18.5C5.5 11 11 5.5 18.5 5.5c0 7.5-5.5 13-13 13z" stroke={c} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M9 15c1.8-2.8 4.2-5.2 7-7" stroke={c} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  ),
  Peinado: (c) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M5 8c2-2.4 5-2.4 7 0s5 2.4 7 0M5 13c2-2.4 5-2.4 7 0s5 2.4 7 0M5 18c2-2.4 5-2.4 7 0s5 2.4 7 0" stroke={c} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  ),
};

export default function Inicio({ openService, go }: { openService: (s: Service) => void; go: (t: string) => void }) {
  const { profile, user } = useAuth();
  const firstName = (profile?.full_name || 'Bienvenida').trim().split(/\s+/)[0];
  const pts = profile?.club_points ?? 0;              // PUNTOS de canje
  // NIVEL = consumo 12 meses (soles) del servidor. Fetch defensivo → 0 si falla (Member).
  const [spend, setSpend] = useState(0);
  useEffect(() => {
    let ok = true;
    if (user?.id) getClientSpend12m(user.id).then((s) => { if (ok) setSpend(s); }).catch(() => {});
    return () => { ok = false; };
  }, [user?.id]);
  const ti = tierInfo(spend);                          // NIVEL en soles
  // Próxima cita (patrón Fresha/Zocdoc): la más cercana en el futuro, no cancelada.
  const [nextAppt, setNextAppt] = useState<Appointment | null>(null);
  useEffect(() => {
    let ok = true;
    if (!user?.id) { setNextAppt(null); return; }
    listMyAppointments()
      .then((rows) => {
        if (!ok) return;
        const now = Date.now();
        const up = rows.find((a) => a.status !== 'cancelada' && a.status !== 'completada' && !!a.starts_at && new Date(a.starts_at).getTime() > now);
        setNextAppt(up ?? null);
      })
      .catch(() => {});
    return () => { ok = false; };
  }, [user?.id]);
  const pop = B.SERVICES.filter((s) => s.popular);
  const promo = B.PROMOS[0];
  const promoSvc = promo ? B.SERVICES.find((x) => x.id === promo.serviceId) : undefined;
  const cats = [
    { name: 'Corte', tint: 'rose' },
    { name: 'Color', tint: 'emerald' },
    { name: 'Tratamiento', tint: 'rose' },
    { name: 'Peinado', tint: 'emerald' },
  ];

  return (
    <Scroll>
      {/* saludo */}
      <View style={{ paddingTop: 16, paddingHorizontal: 22 }}>
        <Eyebrow>{saludoPorHora()}</Eyebrow>
        <Text style={{ fontFamily: serif(500), fontSize: 30, color: T.ink, marginTop: 8, lineHeight: 34 }}>
          ¿Lista para consentirte,{' '}
          <Text style={{ fontFamily: serif(500, true), color: T.rose }}>{firstName}</Text>?
        </Text>
      </View>

      {/* próxima cita (patrón Fresha/Zocdoc: "Up next" arriba del hero) */}
      {nextAppt?.starts_at && (
        <Pressable onPress={() => go('perfil')} accessibilityRole="button"
          accessibilityLabel={`Tu próxima cita: ${nextAppt.service_name}, ${fmtDate(nextAppt.starts_at)} a las ${fmtTime(nextAppt.starts_at)}`}>
          <Glass radius={22} style={{ marginTop: 20, marginHorizontal: 20, padding: 18, boxShadow: '0 10px 26px rgba(20,45,35,0.1)' as any }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              {/* bloque fecha tipo calendario */}
              <View style={{ width: 56, borderRadius: 16, overflow: 'hidden', alignItems: 'center' }}>
                <EmeraldGradient style={StyleSheet.absoluteFill} />
                <Text style={{ fontFamily: sans(700), fontSize: 9, letterSpacing: 1.4, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', marginTop: 8 }}>
                  {fmtDate(nextAppt.starts_at).split(' ')[0]}
                </Text>
                <Text style={{ fontFamily: serif(600), fontSize: 24, color: '#fff', marginTop: 1, marginBottom: 8 }}>
                  {partsLima(nextAppt.starts_at).d}
                </Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Eyebrow style={{ fontSize: 9.5 }} c={T.goldText}>Tu próxima cita</Eyebrow>
                <Text numberOfLines={1} style={{ fontFamily: serif(600), fontSize: 18, color: T.ink, marginTop: 4 }}>
                  {nextAppt.service_name}
                </Text>
                <Text numberOfLines={1} style={{ fontFamily: sans(600), fontSize: 12, color: T.body, marginTop: 3 }}>
                  {fmtTime(nextAppt.starts_at)}{nextAppt.stylist_name ? ` · con ${nextAppt.stylist_name}` : ''}
                </Text>
              </View>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: T.soft, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={7} height={12} viewBox="0 0 7 12">
                  <Path d="M1 1l5 5-5 5" stroke={T.roseDeep} strokeWidth={1.6} fill="none" strokeLinecap="round" />
                </Svg>
              </View>
            </View>
          </Glass>
        </Pressable>
      )}

      {/* hero card */}
      <View style={{ marginTop: 24, marginHorizontal: 20, borderRadius: 24, overflow: 'hidden', position: 'relative', boxShadow: '0 16px 34px rgba(20,45,35,0.16)' as any }}>
        <Photo tone="rose" tag="salón belysh" img="assets/hair-1.png" h={200} r={18} />
        <LinearGradient
          colors={['rgba(8,40,30,0.55)', 'transparent']}
          locations={[0, 0.6]}
          start={{ x: 0.5, y: 1 }} end={{ x: 0.5, y: 0 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={{ position: 'absolute', left: 20, right: 20, bottom: 18 }}>
          <Text style={{ fontFamily: serif(600, true), fontSize: 23, color: '#fff' }}>Tu belleza es nuestra prioridad</Text>
          <LinearGradient colors={['#E7CF9B', '#C9A063']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ width: 48, height: 2, borderRadius: 2, marginTop: 11 }} />
          <Pressable onPress={() => go('servicios')}
            accessibilityRole="button" accessibilityLabel="Reservar ahora"
            style={{ marginTop: 12, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 999, paddingVertical: 11, paddingHorizontal: 22 }}>
            <Text style={{ color: T.roseDeep, fontFamily: sans(600), fontSize: 13 }}>Reservar ahora</Text>
          </Pressable>
        </View>
      </View>

      {/* category tiles */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 11, paddingTop: 24, paddingHorizontal: 20, paddingBottom: 4 }}>
        {cats.map((c) => {
          const isE = c.tint === 'emerald';
          return (
            <Pressable key={c.name} onPress={() => go('servicios')} accessibilityRole="button" accessibilityLabel={`Categoría ${c.name}`}>
              <Glass radius={18} style={{ width: 84, alignItems: 'center', gap: 9, paddingTop: 14, paddingHorizontal: 8, paddingBottom: 13, boxShadow: '0 6px 16px rgba(20,45,35,0.07)' as any }}>
                <LinearGradient
                  colors={isE ? ['#F4E8D4', '#E7CF9B'] : ['#D9F0E7', '#BFE7DB']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{ width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65), 0 4px 10px rgba(20,45,35,0.06)' as any }}>
                  {CAT_ICONS[c.name](isE ? T.emerald : T.rose)}
                </LinearGradient>
                <Text style={{ fontFamily: sans(600), fontSize: 11.5, color: T.ink }}>{c.name}</Text>
              </Glass>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* promo destacada (patrón "Featured" de Sephora): la primera promo como banner editorial */}
      {promo && promoSvc && (
        <Pressable onPress={() => openService(promoSvc)} accessibilityRole="button"
          accessibilityLabel={`Promoción: ${promo.title}, ${money(promo.now)}`}>
          <View style={{ marginTop: 24, marginHorizontal: 20, borderRadius: 24, overflow: 'hidden', boxShadow: '0 16px 34px rgba(20,45,35,0.16)' as any }}>
            <Photo tone={promo.tone} tag={promo.title} img={promo.img} h={170} r={18} />
            <LinearGradient colors={['rgba(8,40,30,0.72)', 'rgba(8,40,30,0.12)']}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill} pointerEvents="none" />
            <View style={{ position: 'absolute', left: 20, right: 20, top: 0, bottom: 0, justifyContent: 'center' }}>
              <View style={{ alignSelf: 'flex-start', borderRadius: 999, overflow: 'hidden' }}>
                <LinearGradient colors={['#F3E0A6', '#C9A063']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{ paddingVertical: 5, paddingHorizontal: 12 }}>
                  <Text style={{ fontFamily: sans(800), fontSize: 10, letterSpacing: 1.2, color: '#0A3B2C', textTransform: 'uppercase' }}>
                    {promo.badge} · {promo.kind}
                  </Text>
                </LinearGradient>
              </View>
              <Text style={{ fontFamily: serif(600), fontSize: 24, color: '#fff', marginTop: 10, lineHeight: 26, maxWidth: 250 }}>
                {promo.title}
              </Text>
              <Text style={{ fontFamily: sans(700), fontSize: 14, color: '#fff', marginTop: 8 }}>
                {money(promo.now)}{'  '}
                <Text style={{ fontFamily: sans(600), fontSize: 12, color: 'rgba(255,255,255,0.65)', textDecorationLine: 'line-through' }}>{money(promo.was)}</Text>
              </Text>
            </View>
          </View>
        </Pressable>
      )}

      {/* petal divider */}
      <View style={{ paddingTop: 26, paddingHorizontal: 20, paddingBottom: 2 }}>
        <Petal />
      </View>

      {/* favoritos header */}
      <View style={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: serif(600), fontSize: 24, color: T.ink }}>Favoritos del salón</Text>
        <Pressable onPress={() => go('servicios')} accessibilityRole="button" accessibilityLabel="Ver todos los servicios">
          <Eyebrow style={{ fontSize: 10 }}>Ver todo</Eyebrow>
        </Pressable>
      </View>

      {/* favoritos scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 14, paddingTop: 10, paddingHorizontal: 20, paddingBottom: 4 }}>
        {pop.map((s) => (
          <Pressable key={s.id} onPress={() => openService(s)} accessibilityRole="button" accessibilityLabel={`${s.name}, ${money(s.price)}`}>
            <Glass radius={22} style={{ width: 188, padding: 10, boxShadow: '0 8px 22px rgba(20,45,35,0.08)' as any }}>
              <Photo tone={s.tone} tag={s.tag} img={s.img} pos={s.pos} h={140} r={16} />
              <Text style={{ fontFamily: serif(600), fontSize: 18, color: T.ink, marginTop: 10, lineHeight: 20, paddingHorizontal: 4 }}>{s.name}</Text>
              <Text style={{ fontFamily: sans(700), fontSize: 12.5, color: T.rose, marginTop: 5, paddingHorizontal: 4, paddingBottom: 6 }}>{`${money(s.price)} · ${s.min} min`}</Text>
            </Glass>
          </Pressable>
        ))}
      </ScrollView>

      {/* club teaser — mini tarjeta premium */}
      <Pressable onPress={() => go('club')} accessibilityRole="button" accessibilityLabel={`Belysh Club, ${pts} puntos, nivel ${ti.tier}`}>
        <EmeraldCard radius={18} style={{ marginTop: 22, marginHorizontal: 20, marginBottom: 4, paddingVertical: 18, paddingHorizontal: 20, borderWidth: 1, borderColor: 'rgba(201,160,99,0.26)', boxShadow: '0 18px 36px -12px rgba(6,32,24,0.5)' as any }}>
          {/* glow oro (radial aprox.) */}
          <View pointerEvents="none" style={{ position: 'absolute', right: -40, top: -50, width: 170, height: 170, borderRadius: 85, backgroundColor: 'rgba(201,160,99,0.13)' }} />
          {/* sheen diagonal */}
          <LinearGradient pointerEvents="none"
            colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
            locations={[0.34, 0.47, 0.57]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill} />

          <View style={{ position: 'relative', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexShrink: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 11 }}>
                <Text style={{ fontFamily: sans(700), fontSize: 9.5, letterSpacing: 2.4, textTransform: 'uppercase', color: '#EBD6A0' }}>Belysh Club</Text>
                <Text style={{ fontFamily: sans(700), fontSize: 8.5, letterSpacing: 1.5, color: '#EBD6A0', borderWidth: 1, borderColor: 'rgba(231,207,155,0.45)', borderRadius: 999, paddingVertical: 2, paddingHorizontal: 9 }}>{ti.tier.toUpperCase()}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
                {/* chip dorado */}
                <LinearGradient colors={['#F3E0A6', '#C9A063', '#9C7838']} locations={[0, 0.52, 1]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{ width: 34, height: 26, borderRadius: 5, position: 'relative', flexShrink: 0, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)' as any }}>
                  <View style={{ position: 'absolute', top: 5, bottom: 5, left: 4, right: 4, borderWidth: 1, borderColor: 'rgba(110,82,36,0.5)', borderRadius: 3 }} />
                  <View style={{ position: 'absolute', left: '50%', top: 2, bottom: 2, width: 1, backgroundColor: 'rgba(110,82,36,0.5)' }} />
                </LinearGradient>
                <View>
                  <Text style={{ fontFamily: sans(700), fontSize: 24, color: '#fff', lineHeight: 24, letterSpacing: 1, fontVariant: ['tabular-nums'] }}>
                    {pts}
                    <Text style={{ fontFamily: sans(600), fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: 1 }}>{'  PTS'}</Text>
                  </Text>
                  <Text style={{ fontFamily: sans(500), fontSize: 11.5, color: 'rgba(255,255,255,0.72)', marginTop: 5 }}>Canjéalos por recompensas exclusivas</Text>
                </View>
              </View>
            </View>
            <View style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(231,207,155,0.4)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Svg width={8} height={13} viewBox="0 0 8 13">
                <Path d="M1 1l6 6-6 6" stroke="#EBD6A0" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </View>
        </EmeraldCard>
      </Pressable>
    </Scroll>
  );
}
