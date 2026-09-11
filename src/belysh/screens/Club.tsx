import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import {
  Scroll, Eyebrow, GradientText, EmeraldCard, EmeraldGradient, Glass, CountUp, CountUpBar,
  T, serif, sans,
} from '../ui';
import { BELYSH } from '../data';
import { useAuth } from '../api/auth';
import { redeemReward, getClientSpend12m } from '../api/club';
import { tierInfo } from '../lib/club';
import { traducir } from '../lib/errors';

const B = BELYSH;

// Gradiente aprox. de los medallones radiales por nivel (Member / VIP / Elite / Black)
const MEDAL: Record<string, [string, string]> = {
  Member: ['#F6F7F8', '#BBC1C7'],
  VIP: ['#F6E6AE', '#C9A063'],
  Elite: ['#EAF6FB', '#BBDDEC'],
  Black: ['#D7DBDF', '#3A3F45'],
};

export default function Club() {
  const { profile, user, refreshProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  // NIVEL = consumo pagado 12 meses (soles), fuente de verdad del servidor. Fetch defensivo:
  // ante cualquier error queda en 0 → Member 0%, que es el estado correcto sin pagos.
  const [spend, setSpend] = useState(0);
  const userId = user?.id;
  const loadSpend = useCallback(async () => {
    if (!userId) return;
    try { setSpend(await getClientSpend12m(userId)); } catch { /* mantiene el último válido */ }
  }, [userId]);
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    getClientSpend12m(userId)
      .then((value) => { if (alive) setSpend(value); })
      .catch(() => {});
    return () => { alive = false; };
  }, [userId]);
  const refresh = async () => {
    setRefreshing(true);
    try { await Promise.all([refreshProfile(), loadSpend()]); } finally { setRefreshing(false); }
  };
  const points = profile?.club_points ?? 0;          // PUNTOS = moneda de canje
  const info = tierInfo(spend);                       // NIVEL = consumo en soles
  // Barra coherente con la etiqueta "S/{spend}/{tierMax}": progreso al umbral del siguiente nivel.
  const pctAbs = info.isMax ? 100 : Math.max(0, Math.min(100, Math.round((spend / info.tierMax) * 100)));
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const holder = (profile?.full_name || 'Socia Belysh').toUpperCase();
  // Solo el año: member_since llega como fecha/timestamp del servidor y la tarjeta
  // no debe mostrarlo en crudo (mismo criterio que "Miembro desde" en Perfil).
  // Se lee del texto ISO, sin `new Date`: una fecha suelta ('2026-01-01') se
  // interpretaría como medianoche UTC y en Lima (UTC−5) daría el año anterior.
  const since = /^(\d{4})/.exec(profile?.member_since ?? '')?.[1] ?? '2026';

  const onRedeem = (w: any) => {
    if (points < w.cost || redeeming) return;
    Alert.alert('Canjear recompensa', `¿Canjear "${w.title}" por ${w.cost} pts?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Canjear',
        onPress: async () => {
          setRedeeming(w.id);
          try {
            const bal = await redeemReward(w.id);
            await refreshProfile();
            Alert.alert('¡Listo! ✦', `Disfruta: ${w.title}. Te quedan ${bal} pts.`);
          } catch (e: any) {
            Alert.alert('Ups', traducir(e?.message));
          } finally {
            setRedeeming(null);
          }
        },
      },
    ]);
  };

  return (
    <Scroll pb={24} onRefresh={refresh} refreshing={refreshing}>
      {/* encabezado */}
      <View style={{ paddingTop: 8, paddingHorizontal: 20 }}>
        <Eyebrow>Belysh Club</Eyebrow>
        <GradientText style={{ fontFamily: serif(500), fontSize: 32, lineHeight: 38, marginTop: 6 }}>
          Tu fidelidad
        </GradientText>
      </View>

      {/* ══ Tarjeta de socia — metálica bancaria ══ */}
      <View style={{ marginTop: 18, marginHorizontal: 20 }}>
        <EmeraldCard
          radius={18}
          style={{
            aspectRatio: 1.6,
            paddingVertical: 19,
            paddingHorizontal: 22,
            justifyContent: 'space-between',
            boxShadow:
              '0 26px 50px -14px rgba(6,32,24,0.6), inset 0 1px 0 rgba(255,255,255,0.16), inset 0 0 0 1px rgba(201,160,99,0.28)' as any,
          }}
        >
          <Svg style={{ position: 'absolute', right: -54, top: -64 }} width={210} height={210}>
            <Defs>
              <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#C9A063" stopOpacity={0.26} />
                <Stop offset="0.68" stopColor="#C9A063" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={105} cy={105} r={105} fill="url(#halo)" />
          </Svg>
          <LinearGradient
            pointerEvents="none"
            colors={['transparent', 'rgba(255,255,255,0.12)', 'transparent']}
            locations={[0.33, 0.47, 0.57]}
            start={{ x: 0, y: 0.1 }}
            end={{ x: 1, y: 0.9 }}
            style={StyleSheet.absoluteFill}
          />

          {/* fila superior: wordmark + nivel */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontFamily: serif(600, true), fontSize: 23, lineHeight: 23, letterSpacing: 0.4, color: '#fff' }}>
                Belysh
              </Text>
              <Text style={{ fontFamily: sans(700), fontSize: 8, letterSpacing: 3, color: 'rgba(255,255,255,0.58)', marginTop: 4 }}>
                CLUB DE SOCIAS
              </Text>
            </View>
            <View style={{ borderWidth: 1, borderColor: 'rgba(231,207,155,0.45)', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 13 }}>
              <Text style={{ fontFamily: sans(700), fontSize: 10, letterSpacing: 2, color: '#EBD6A0' }}>
                {String(info.tier).toUpperCase()}
              </Text>
            </View>
          </View>

          {/* chip dorado + contactless */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
            <LinearGradient
              colors={['#F3E0A6', '#C9A063', '#9C7838']}
              locations={[0, 0.52, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 44, height: 33, borderRadius: 7, flexShrink: 0, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.14)' as any }}
            >
              <View style={{ position: 'absolute', top: 6, bottom: 6, left: 5, right: 5, borderWidth: 1, borderColor: 'rgba(110,82,36,0.5)', borderRadius: 4 }} />
              <View style={{ position: 'absolute', left: '50%', top: 3, bottom: 3, width: 1, backgroundColor: 'rgba(110,82,36,0.5)' }} />
              <View style={{ position: 'absolute', top: '50%', left: 4, right: 4, height: 1, backgroundColor: 'rgba(110,82,36,0.5)' }} />
            </LinearGradient>
            <Svg width={19} height={21} viewBox="0 0 19 21" fill="none">
              <Path
                d="M4 4.5c2.8 2.6 2.8 9.4 0 12M8 1.8c4.7 4 4.7 13.4 0 17.4M12 -0.6c6.6 5.4 6.6 16.8 0 22.2"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={1.4}
                strokeLinecap="round"
              />
            </Svg>
          </View>

          {/* saldo de puntos */}
          <View>
            <Text style={{ fontFamily: sans(700), fontSize: 8.5, letterSpacing: 2.4, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
              Saldo de puntos
            </Text>
            <CountUp value={points} dur={1200}
              style={{ marginTop: 5 }}
              textStyle={{ fontFamily: sans(700), fontSize: 37, letterSpacing: 2, lineHeight: 37, color: '#fff', fontVariant: ['tabular-nums'] }}
              suffix={<Text style={{ fontFamily: sans(600), fontSize: 11.5, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.5 }}>{'  PTS'}</Text>}
            />
          </View>

          {/* fila inferior: titular + número de socia */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text numberOfLines={1} style={{ fontFamily: sans(600), fontSize: 12.5, letterSpacing: 1.4, color: '#fff', textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 }}>
                {holder}
              </Text>
              <Text style={{ fontFamily: sans(600), fontSize: 8, letterSpacing: 1.4, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>
                SOCIA DESDE {since}
              </Text>
            </View>
            <Text style={{ fontFamily: sans(600), fontSize: 11, letterSpacing: 2, color: 'rgba(235,214,160,0.82)', fontVariant: ['tabular-nums'] }}>
              •••• 7720
            </Text>
          </View>
        </EmeraldCard>

        {/* progreso al siguiente nivel — fuera de la tarjeta */}
        <View style={{ marginTop: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
            <Text style={{ fontFamily: sans(600), fontSize: 12.5, color: T.body }}>
              {info.isMax ? (
                <Text style={{ fontFamily: sans(700), color: T.roseDeep }}>Nivel máximo · ¡gracias!</Text>
              ) : (
                <>Te faltan S/ {info.toNext} para <Text style={{ fontFamily: sans(700), color: T.roseDeep }}>{info.nextTier}</Text></>
              )}
            </Text>
            <Text style={{ fontFamily: sans(700), fontSize: 11, color: T.muted }}>
              {info.isMax ? `S/ ${spend}` : `S/ ${spend} / ${info.tierMax}`}
            </Text>
          </View>
          <View style={{ height: 8, backgroundColor: T.soft, borderRadius: 999, overflow: 'hidden' }}>
            <CountUpBar pct={pctAbs} colors={['#E7CF9B', '#C9A063']} />
          </View>
          <Glass
            variant="chip"
            radius={999}
            style={{
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 9,
              marginTop: 14,
              paddingTop: 7,
              paddingBottom: 7,
              paddingLeft: 7,
              paddingRight: 15,
              boxShadow: '0 6px 16px rgba(20,45,35,0.06)' as any,
            }}
          >
            <View style={{ width: 22, height: 22, borderRadius: 11, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <EmeraldGradient style={StyleSheet.absoluteFill} />
              <Svg width={11} height={11} viewBox="0 0 12 12">
                <Path d="M2 6.2L4.8 9 10 3" stroke="#fff" strokeWidth={1.9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <Text style={{ fontFamily: sans(700), fontSize: 12, color: T.ink }}>
              Beneficio {info.tier} · {info.perk}
            </Text>
          </Glass>
        </View>
      </View>

      {/* ══ Canjea tus puntos ══ */}
      <Eyebrow style={{ paddingTop: 24, paddingHorizontal: 20, paddingBottom: 12 }}>Canjea tus puntos</Eyebrow>
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        {(B.CLUB.rewards as any[]).map((w: any) => {
          const ready = points >= w.cost;
          const busy = redeeming === w.id;
          return (
            <Glass
              key={w.id}
              variant="card"
              radius={18}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 15,
                paddingHorizontal: 18,
                boxShadow: '0 6px 16px rgba(20,45,35,0.06)' as any,
              }}
            >
              <View style={{ flexDirection: 'column', gap: 3, flex: 1, minWidth: 0, paddingRight: 14 }}>
                <Text style={{ fontFamily: sans(600), fontSize: 14.5, color: T.ink, lineHeight: 18 }}>{w.title}</Text>
                <Text style={{ fontFamily: sans(700), fontSize: 12, color: T.goldText }}>{w.cost} pts</Text>
              </View>
              <Pressable
                disabled={!ready || busy}
                onPress={() => onRedeem(w)}
                style={{
                  borderRadius: 999,
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  backgroundColor: ready ? T.emerald : T.line,
                  opacity: busy ? 0.6 : 1,
                  flexShrink: 0,
                }}
              >
                <Text style={{ fontFamily: sans(600), fontSize: 12, color: ready ? '#fff' : T.muted }}>
                  {busy ? '…' : ready ? 'Canjear' : 'Falta'}
                </Text>
              </Pressable>
            </Glass>
          );
        })}
      </View>

      {/* ══ Niveles ══ */}
      <Eyebrow style={{ paddingTop: 24, paddingHorizontal: 20, paddingBottom: 12 }}>Niveles</Eyebrow>
      <View style={{ paddingHorizontal: 20, paddingBottom: 8, gap: 10 }}>
        {(B.CLUB.tiers as any[]).map((t: any) => {
          const current = t.name === info.tier;
          const mc = MEDAL[t.name] || [T.line, T.line];
          return (
            <View
              key={t.name}
              style={{
                flexDirection: 'row',
                gap: 14,
                paddingVertical: 16,
                paddingHorizontal: 18,
                alignItems: 'center',
                borderRadius: 18,
                backgroundColor: current ? T.soft : '#fff',
                boxShadow: '0 4px 12px rgba(20,45,35,0.05)' as any,
              }}
            >
              <LinearGradient
                colors={mc}
                start={{ x: 0.3, y: 0.25 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: (current
                    ? '0 0 0 2px #fff, 0 0 0 3.5px #C9A063'
                    : 'inset 0 1px 2px rgba(0,0,0,0.15)') as any,
                }}
              >
                <View style={{ width: 11, height: 11, borderRadius: 5.5, backgroundColor: 'rgba(255,255,255,0.55)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)' as any }} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: serif(600), fontSize: 18, color: T.ink }}>
                  {t.name}
                  {current && <Text style={{ fontFamily: sans(600), fontSize: 10, color: T.goldText }}> · ACTUAL</Text>}
                </Text>
                <Text style={{ fontFamily: sans(600), fontSize: 12.5, color: T.body, marginTop: 2 }}>{t.perk}</Text>
              </View>
              <Text style={{ fontFamily: sans(700), fontSize: 11, color: T.muted }}>{t.min === 0 ? 'Bienvenida' : `S/ ${t.min}+`}</Text>
            </View>
          );
        })}
      </View>
    </Scroll>
  );
}
