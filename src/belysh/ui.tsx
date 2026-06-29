/* Belysh · "Liquid Glow" — sistema de diseño (RN). Todas las pantallas importan de aquí.
   Traduce las primitivas del prototipo web (glass, gradientes, foto, botón, iconos, chrome). */
import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, RefreshControl, Platform } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { T, G, TONE, EMERALD_CARD, serif, sans } from './theme';
import { RES } from './images';
import { money } from './lib/money';

type Any = any;

/* ───────────────────────── Gradientes ───────────────────────── */
export function EmeraldGradient({ style, radius, children }: Any) {
  return (
    <LinearGradient colors={G.grad.colors} start={G.grad.start} end={G.grad.end}
      style={[radius != null && { borderRadius: radius }, style]}>
      {children}
    </LinearGradient>
  );
}
export function GoldGradient({ style, radius, children }: Any) {
  return (
    <LinearGradient colors={G.goldColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      style={[radius != null && { borderRadius: radius }, style]}>
      {children}
    </LinearGradient>
  );
}
// Tarjeta esmeralda metálica (Club / giftcard / teaser)
export function EmeraldCard({ style, radius = 18, children }: Any) {
  return (
    <LinearGradient colors={EMERALD_CARD.colors} locations={EMERALD_CARD.locations}
      start={EMERALD_CARD.start} end={EMERALD_CARD.end}
      style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
      {children}
    </LinearGradient>
  );
}

/* ───────────────────────── Glass ───────────────────────── */
// Superficie de vidrio: BlurView + tinte marfil + hairline champagne.
export function Glass({ variant = 'card', radius = 22, style, children }: Any) {
  const bg = variant === 'chip' ? G.chipBg : variant === 'tab' ? G.tabBg : G.cardBg;
  const intensity = variant === 'card' ? G.blurIntensity : G.chipBlurIntensity;
  const borderColor = variant === 'tab' ? G.borderLight : G.border;
  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden', borderWidth: 1, borderColor }, style]}>
      {Platform.OS === 'ios' && <BlurView intensity={intensity} tint="light" style={StyleSheet.absoluteFill} />}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: bg }]} />
      {children}
    </View>
  );
}

/* ───────────────────────── Texto con gradiente (.belysh-gt) ───────────────────────── */
export function GradientText({ children, style }: Any) {
  return (
    <MaskedView maskElement={<Text style={[style, { backgroundColor: 'transparent' }]}>{children}</Text>}>
      <LinearGradient colors={['#0A4632', '#0E5E47', '#B5904F']} locations={[0, 0.52, 1]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.4 }}>
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

/* ───────────────────────── Foto ───────────────────────── */
// pos del prototipo ('center 30%') → contentPosition de expo-image.
export function parsePos(pos?: string): Any {
  if (!pos) return { top: '28%', left: '50%' };
  const map = (t: string, axis: 'h' | 'v') =>
    t === 'center' ? '50%' : t === 'left' ? '0%' : t === 'right' ? '100%'
      : t === 'top' ? '0%' : t === 'bottom' ? '100%' : t;
  const [h = 'center', v = '50%'] = pos.split(/\s+/);
  return { left: map(h, 'h'), top: map(v, 'v') };
}
export function Photo({ tone = 'rose', tag, h = 200, r = 22, img, pos = 'center 28%', style }: Any) {
  const [a, b] = TONE[tone] || TONE.rose;
  const src = RES(img);
  return (
    <View style={[{ height: h, borderRadius: r, overflow: 'hidden', backgroundColor: a }, style]}>
      {src ? (
        <Image source={src} style={{ width: '100%', height: '100%' }} contentFit="cover"
          contentPosition={parsePos(pos)} transition={200} />
      ) : (
        <>
          <LinearGradient colors={[a, b]} start={{ x: 0, y: 0 }} end={{ x: 0.7, y: 1 }} style={StyleSheet.absoluteFill} />
          {tag ? (
            <Text style={{ position: 'absolute', left: 14, bottom: 12, fontFamily: sans(700), fontSize: 9.5,
              letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)' }}>foto · {tag}</Text>
          ) : null}
        </>
      )}
    </View>
  );
}

/* ───────────────────────── Átomos ───────────────────────── */
export function Eyebrow({ children, c = T.rose, style }: Any) {
  return (
    <Text style={[{ fontFamily: sans(600), fontSize: 11, letterSpacing: 2.2, textTransform: 'uppercase', color: c }, style]}>
      {children}
    </Text>
  );
}
export function Stars({ n = 5, s = 12 }: Any) {
  return <Text accessibilityRole="image" accessibilityLabel={`${n} de 5 estrellas`} style={{ letterSpacing: 2, color: '#C9A063', fontSize: s }}>{'★'.repeat(n)}</Text>;
}
export function Petal({ c = '#C9A063', w = 54 }: Any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <LinearGradient colors={['transparent', c]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 1, width: w }} />
      <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
        <Path d="M12 3c2.1 2.3 2.1 5.9 0 8.2-2.1-2.3-2.1-5.9 0-8.2zM5 9c2.9.4 4.6 2.9 4.2 5.7C6.3 14.3 4.6 11.8 5 9zM19 9c-2.9.4-4.6 2.9-4.2 5.7 2.9-.4 4.6-2.9 4.2-5.7z" stroke={c} strokeWidth={1.2} strokeLinejoin="round" />
      </Svg>
      <LinearGradient colors={[c, 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 1, width: w }} />
    </View>
  );
}

/* ───────────────────────── Botón ───────────────────────── */
export function Btn({ children, onPress, kind = 'solid', full, disabled, style, textStyle }: Any) {
  // Texto del botón: envuelve en <Text> tanto un string/number suelto como un array
  // de textos (p.ej. "Reservar · $" + price), que en RN crashea si va fuera de <Text>.
  const isTextual = (c: Any) => c == null || typeof c === 'string' || typeof c === 'number';
  const allTextual = Array.isArray(children) ? children.every(isTextual) : isTextual(children);
  const label = allTextual
    ? <Text style={[{ fontFamily: sans(600), fontSize: 14, letterSpacing: 0.4, color: kind === 'solid' ? '#fff' : T.roseDeep }, textStyle]}>{children}</Text>
    : children;
  const inner = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 26 }}>
      {label}
    </View>
  );
  return (
    <Pressable accessibilityRole="button" onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [{ width: full ? '100%' : undefined, borderRadius: 999, overflow: 'hidden',
        opacity: disabled ? 0.4 : pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }] }, style]}>
      {kind === 'solid' ? (
        <EmeraldGradient style={{ borderRadius: 999,
          boxShadow: '0 14px 28px rgba(15,107,80,0.4)' as Any }}>{inner}</EmeraldGradient>
      ) : (
        <View style={{ borderRadius: 999, backgroundColor: T.soft }}>{inner}</View>
      )}
    </Pressable>
  );
}

/* ───────────────────────── useCountUp ───────────────────────── */
export function useCountUp(target: number, dur = 1100, run = true) {
  const [v, setV] = React.useState(run ? 0 : target);
  React.useEffect(() => {
    if (!run) { setV(target); return; }
    let raf: number, t0: number | undefined;
    const tick = (t: number) => {
      if (t0 === undefined) t0 = t;
      const p = Math.min(1, (t - t0) / dur);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return v;
}

/* ───────────────────────── Iconos (set compartido `I`) ───────────────────────── */
export const I = {
  inicio: (c: string, f?: boolean) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={f ? c : 'none'}>
      <Path d="M4 11l8-6 8 6v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-8z" stroke={c} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  ),
  serv: (c: string) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={7} cy={7} r={3} stroke={c} strokeWidth={1.6} /><Circle cx={7} cy={17} r={3} stroke={c} strokeWidth={1.6} />
      <Path d="M9.5 8.5L20 18M9.5 15.5L20 6" stroke={c} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  ),
  promo: (c: string) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4l2.4 5 5.4.8-3.9 3.8 1 5.4L12 16.4 7.1 19l1-5.4L4.2 9.8 9.6 9 12 4z" stroke={c} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  ),
  club: (c: string) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4.5c1.7 1.5 1.7 3.9 0 5.4-1.7-1.5-1.7-3.9 0-5.4zM6.5 10c2.3.3 3.6 2.3 3.3 4.4-2.3-.3-3.6-2.3-3.3-4.4zM17.5 10c-2.3.3-3.6 2.3-3.3 4.4 2.3-.3 3.6-2.3 3.3-4.4zM12 14.5V20" stroke={c} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  ),
  perfil: (c: string) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8.5} r={3.4} stroke={c} strokeWidth={1.6} />
      <Path d="M5.5 19.5c.8-3.4 3.3-5.3 6.5-5.3s5.7 1.9 6.5 5.3" stroke={c} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  ),
  back: (c: string) => (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path d="M13 5l-6 6 6 6" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  clock: (c: string) => (
    <Svg width={15} height={15} viewBox="0 0 15 15" fill="none">
      <Circle cx={7.5} cy={7.5} r={6} stroke={c} strokeWidth={1.3} />
      <Path d="M7.5 4v3.5L10 9.5" stroke={c} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  ),
};

/* ───────────────────────── Fondo de la app (mesh) ───────────────────────── */
export function Mesh() {
  // Lujo quieto: dos lavados muy suaves + degradado superior. (radial → aprox. con círculos)
  return (
    <View pointerEvents="none" accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <View style={{ position: 'absolute', left: '-22%', top: '-10%', width: 360, height: 360, borderRadius: 180, backgroundColor: 'rgba(11,84,64,0.05)' }} />
      <View style={{ position: 'absolute', left: '58%', top: '52%', width: 340, height: 340, borderRadius: 170, backgroundColor: 'rgba(169,136,90,0.045)' }} />
    </View>
  );
}
export function AppBackground({ children, style }: Any) {
  return (
    <LinearGradient colors={['#F6F3EB', '#F3EFE5']} start={{ x: 0.1, y: 0 }} end={{ x: 0.6, y: 1 }}
      style={[{ flex: 1 }, style]}>
      <Mesh />
      {children}
    </LinearGradient>
  );
}

/* ───────────────────────── ServiceCard ───────────────────────── */
export const ServiceCard = React.memo(function ServiceCard({ s, onPress }: Any) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${s.name}, ${s.min} minutos`} onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}>
      <Glass radius={22} style={{ padding: 12, flexDirection: 'row', gap: 14, alignItems: 'center',
        boxShadow: '0 8px 22px rgba(20,45,35,0.07)' as Any }}>
        <Photo tone={s.tone} tag={s.tag} img={s.img} pos={s.pos} h={86} r={18} style={{ width: 86 }} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Eyebrow style={{ fontSize: 9.5, marginBottom: 5 }}>{s.cat}</Eyebrow>
          <Text style={{ fontFamily: serif(600), fontSize: 19, color: T.ink, lineHeight: 21 }}>{s.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
            {I.clock(T.muted)}
            <Text style={{ color: T.muted, fontFamily: sans(600), fontSize: 12.5 }}>{s.min} min</Text>
            <Text style={{ color: T.line }}>•</Text>
            <Text style={{ color: T.roseDeep, fontFamily: sans(600), fontSize: 12.5 }}>{money(s.price)}</Text>
          </View>
        </View>
        <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: T.soft, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={8} height={13} viewBox="0 0 8 13"><Path d="M1 1l6 6-6 6" stroke={T.roseDeep} strokeWidth={2} fill="none" strokeLinecap="round" /></Svg>
        </View>
      </Glass>
    </Pressable>
  );
});

/* ───────────────────────── TopBar ───────────────────────── */
export function TopBar({ back, onBack, light, onBell, unread = false, topInset = 0 }: Any) {
  return (
    <View style={{ paddingTop: 12 + topInset, paddingHorizontal: 20, paddingBottom: 10,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      {back ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={onBack} style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
          backgroundColor: light ? 'rgba(255,255,255,0.85)' : '#fff', boxShadow: '0 6px 16px rgba(20,45,35,0.18)' as Any }}>
          {I.back(T.ink)}
        </Pressable>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          <Image source={RES('assets/belysh-logo.png')} style={{ width: 34, height: 34 }} contentFit="contain" />
          <Text style={{ fontFamily: serif(600, true), fontSize: 24, color: T.roseDeep }}>Belysh</Text>
        </View>
      )}
      {!back ? (
        <Pressable accessibilityRole="button" accessibilityLabel={unread ? 'Notificaciones, tienes nuevas' : 'Notificaciones'} onPress={onBell}>
          <Glass variant="chip" radius={22} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(20,45,35,0.12)' as Any }}>
            <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <Path d="M10 3a4 4 0 00-4 4v3l-2 3h12l-2-3V7a4 4 0 00-4-4zM8 16a2 2 0 004 0" stroke={T.rose} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            {unread && <View style={{ position: 'absolute', top: 8, right: 9, width: 9, height: 9, borderRadius: 4.5, backgroundColor: T.emerald, borderWidth: 2, borderColor: '#fff' }} />}
          </Glass>
        </Pressable>
      ) : <View style={{ width: 44 }} />}
    </View>
  );
}

/* ───────────────────────── TabBar ───────────────────────── */
const TABS: [string, (c: string, f?: boolean) => React.ReactNode][] = [
  ['inicio', I.inicio], ['servicios', I.serv], ['promos', I.promo], ['club', I.club], ['perfil', I.perfil],
];
export function TabBar({ tab, go, bottomInset = 0 }: Any) {
  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 12 + bottomInset, paddingTop: 4 }}>
      <Glass variant="tab" radius={999} style={{ paddingVertical: 10, paddingHorizontal: 8,
        flexDirection: 'row', justifyContent: 'space-around',
        boxShadow: '0 10px 30px rgba(20,45,35,0.12)' as Any }}>
        {TABS.map(([k, icon]) => {
          const on = tab === k;
          return (
            <Pressable key={k} onPress={() => go(k)}
              accessibilityRole="button" accessibilityLabel={k.charAt(0).toUpperCase() + k.slice(1)} accessibilityState={{ selected: on }}
              style={{ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {on && <EmeraldGradient style={[StyleSheet.absoluteFill, { borderRadius: 26 }]} />}
              {icon(on ? '#fff' : T.muted, on)}
            </Pressable>
          );
        })}
      </Glass>
    </View>
  );
}

/* ───────────────────────── MonthCal ───────────────────────── */
const CALDEF = { days: 30, firstDow: 0, today: 7, full: [8, 14, 22] };
export const MonthCal = React.memo(function MonthCal({ sel, onPick }: Any) {
  const cells: (number | null)[] = [];
  for (let i = 0; i < CALDEF.firstDow; i++) cells.push(null);
  for (let n = 1; n <= CALDEF.days; n++) cells.push(n);
  return (
    <Glass radius={22} style={{ padding: 14, boxShadow: '0 8px 20px rgba(20,45,35,0.06)' as Any }}>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <Text key={i} style={{ flex: 1, textAlign: 'center', fontFamily: sans(600), fontSize: 10.5, color: T.muted }}>{d}</Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((n, i) => {
          if (!n) return <View key={i} style={{ width: `${100 / 7}%`, height: 42 }} />;
          const past = n < CALDEF.today;
          const full = CALDEF.full.includes(n);
          const dis = past || full;
          const on = sel === n;
          const today = n === CALDEF.today;
          return (
            <View key={i} style={{ width: `${100 / 7}%`, height: 42, padding: 2 }}>
              <Pressable disabled={dis} onPress={() => onPick(n)}
                accessibilityLabel={`Día ${n}`} accessibilityState={{ disabled: dis, selected: on }}
                style={{ flex: 1, borderRadius: 13, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  borderWidth: today && !on ? 1.5 : 0, borderColor: T.rose,
                  backgroundColor: on ? 'transparent' : dis ? 'transparent' : 'rgba(255,255,255,0.5)',
                  opacity: past ? 0.32 : 1 }}>
                {on && <EmeraldGradient style={StyleSheet.absoluteFill} />}
                <Text style={{ fontFamily: sans(on ? 800 : 700), fontSize: 13.5,
                  color: on ? '#fff' : dis ? T.muted : T.ink,
                  textDecorationLine: full ? 'line-through' : 'none' }}>{n}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 14, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: T.line, justifyContent: 'center' }}>
        <Legend c={T.rose} t="Hoy" ring />
        <Legend c={T.muted} t="No disponible" />
      </View>
    </Glass>
  );
});
function Legend({ c, t, ring }: Any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 4, borderWidth: ring ? 1.5 : 0, borderColor: c,
        backgroundColor: ring ? 'transparent' : c, opacity: ring ? 1 : 0.45 }} />
      <Text style={{ fontFamily: sans(700), fontSize: 10.5, color: T.muted }}>{t}</Text>
    </View>
  );
}

/* ───────────────────────── Scroll helper ───────────────────────── */
export function Scroll({ children, pb = 16, style, onRefresh, refreshing }: Any) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[{ paddingBottom: pb }, style]}
      showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={T.rose} colors={[T.rose]} /> : undefined}>
      {children}
    </ScrollView>
  );
}

/* ───────────────────────── FixedBar (CTA inferior) ───────────────────────── */
export function FixedBar({ children }: Any) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 + insets.bottom }}>
      <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.82)']} locations={[0, 0.55]}
        style={StyleSheet.absoluteFill} pointerEvents="none" />
      {children}
    </View>
  );
}

export { T, G, TONE, serif, sans, RES };
