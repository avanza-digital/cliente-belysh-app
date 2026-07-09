import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Platform, BackHandler } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { T, G, serif, sans, RES } from '../ui';
import { GUIDES } from '../data';
import { useAuth } from '../api/auth';
import { traducir } from '../lib/errors';

const guides = GUIDES as any[];

/* ── Iconos inline (copiados del prototipo) ────────────────────────── */
const ICON_STROKE = 'rgba(255,255,255,0.85)';

const MailIcon = () => (
  <Svg width={17} height={17} viewBox="0 0 20 20" fill="none">
    <Rect x={2.5} y={4.5} width={15} height={11} rx={2.5} stroke={ICON_STROKE} strokeWidth={1.4} />
    <Path d="M3.5 6l6.5 4.5L16.5 6" stroke={ICON_STROKE} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const LockIcon = () => (
  <Svg width={17} height={17} viewBox="0 0 20 20" fill="none">
    <Rect x={4} y={9} width={12} height={8} rx={2} stroke={ICON_STROKE} strokeWidth={1.4} />
    <Path d="M6.5 9V7a3.5 3.5 0 117 0v2" stroke={ICON_STROKE} strokeWidth={1.4} strokeLinecap="round" />
  </Svg>
);
const EyeIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
    <Path d="M2.5 10S5.5 4.5 10 4.5 17.5 10 17.5 10 14.5 15.5 10 15.5 2.5 10 2.5 10z" stroke="rgba(255,255,255,0.8)" strokeWidth={1.3} />
    <Circle cx={10} cy={10} r={2.4} stroke="rgba(255,255,255,0.8)" strokeWidth={1.3} />
  </Svg>
);
const EyeOffIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
    <Path d="M3 10s3-5.5 7-5.5c1.2 0 2.3.4 3.2 1M16.5 10S14 14.5 10 14.5c-1.2 0-2.3-.4-3.2-1M3 3l14 14" stroke="rgba(255,255,255,0.8)" strokeWidth={1.3} strokeLinecap="round" />
  </Svg>
);
const UserIcon = () => (
  <Svg width={17} height={17} viewBox="0 0 20 20" fill="none">
    <Circle cx={10} cy={7} r={3} stroke={ICON_STROKE} strokeWidth={1.4} />
    <Path d="M4.5 16c1-3 3.2-4.4 5.5-4.4S14.5 13 15.5 16" stroke={ICON_STROKE} strokeWidth={1.4} strokeLinecap="round" />
  </Svg>
);
const ArrowIcon = () => (
  <Svg width={15} height={13} viewBox="0 0 15 13" fill="none">
    <Path d="M1 6.5h12M8.5 2l4.5 4.5L8.5 11" stroke={T.roseDeep} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const GoogleIcon = () => (
  <Svg width={17} height={17} viewBox="0 0 18 18">
    <Path fill="#FFC107" d="M17.6 9.2h-.7V9H9v1.8h4.8A4.8 4.8 0 014.2 9 4.8 4.8 0 019 4.2c1.2 0 2.3.5 3.1 1.2l1.3-1.3A6.6 6.6 0 109 15.6c3.7 0 6.6-2.9 6.6-6.6 0-.3 0-.5-.1-.8z" />
    <Path fill="#FF3D00" d="M2.6 5.3l1.5 1.1A4.8 4.8 0 019 4.2c1.2 0 2.3.5 3.1 1.2l1.3-1.3A6.6 6.6 0 002.6 5.3z" />
    <Path fill="#4CAF50" d="M9 15.6a6.6 6.6 0 004.4-1.7l-2-1.7a3.9 3.9 0 01-5.9-2l-1.6 1.3A6.6 6.6 0 009 15.6z" />
    <Path fill="#1976D2" d="M17.6 9.2h-.7V9H9v1.8h4.8a4.8 4.8 0 01-1.6 2.2l2 1.7c-.1.1 2.4-1.7 2.4-5.1 0-.3 0-.5-.1-.8z" />
  </Svg>
);

/* ── Fondo editorial: foto + velo esmeralda + lavado de marca ──────── */
function PhotoBg({ img, pos }: any) {
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 0 }]} accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants">
      <Image source={RES(img)} style={StyleSheet.absoluteFill} contentFit="cover"
        contentPosition={posOf(pos || 'center 22%')} transition={250} />
      <LinearGradient
        colors={['rgba(9,34,26,0.5)', 'rgba(9,34,26,0.05)', 'rgba(9,34,26,0.1)', 'rgba(9,34,26,0.78)', 'rgba(7,28,21,0.96)']}
        locations={[0, 0.2, 0.48, 0.8, 1]}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(11,60,46,0.14)' }]} />
    </View>
  );
}

// 'center 30%' → contentPosition de expo-image
function posOf(pos: string) {
  const map = (t: string) => (t === 'center' ? '50%' : t === 'left' || t === 'top' ? '0%' : t === 'right' || t === 'bottom' ? '100%' : t);
  const [h = 'center', v = '50%'] = pos.split(/\s+/);
  return { left: map(h), top: map(v) } as any;
}

/* ── Campo de input con icono y extra opcional ──
   Definido a nivel de módulo (NO dentro de Welcome): si se declarara dentro del
   componente, cada pulsación de tecla recrearía el tipo de componente y RN
   desmontaría el TextInput, perdiendo el foco/teclado en cada carácter. */
const Field = ({ icon, value, set, ph, secure, email: isEmail, cap, extra }: any) => (
  <View style={{ position: 'relative', flexDirection: 'row', alignItems: 'center' }}>
    <View pointerEvents="none" style={{ position: 'absolute', left: 20, zIndex: 2 }}>{icon}</View>
    <TextInput
      value={value}
      onChangeText={set}
      placeholder={ph}
      accessibilityLabel={ph}
      placeholderTextColor="rgba(255,255,255,0.55)"
      secureTextEntry={secure}
      keyboardType={isEmail ? 'email-address' : 'default'}
      autoCapitalize={cap || 'none'}
      autoCorrect={false}
      style={{
        flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.26)',
        backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 999,
        paddingTop: 17, paddingBottom: 17, paddingLeft: 50, paddingRight: 48,
        fontFamily: sans(500), fontSize: 14.5, color: '#fff',
      }}
    />
    {extra}
  </View>
);

// Poner en true cuando Google esté configurado en Google Cloud + Supabase (ver PENDIENTES.md).
const GOOGLE_ENABLED = false;

export default function Welcome() {
  const { signIn, signUp, signInGuest, signInWithGoogle, resetPassword } = useAuth();
  const [phase, setPhase] = useState<'splash' | 'welcome' | 'guide' | 'auth'>('splash');
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleGoogle = async () => {
    if (busy) return;
    if (!GOOGLE_ENABLED) {
      Alert.alert('Pronto disponible', 'El acceso con Google se activa al configurar las credenciales. Por ahora entra con tu correo.');
      return;
    }
    setBusy(true);
    try {
      await signInWithGoogle(); // al haber sesión, onAuthStateChange entra solo
    } catch {
      Alert.alert('No se pudo entrar con Google', 'Si lo acabas de configurar, revisa las credenciales de Google en Supabase. Mientras tanto, entra con tu correo.');
    } finally {
      setBusy(false);
    }
  };

  // Iniciar sesión o crear cuenta. Al haber sesión, onAuthStateChange entra solo.
  const submit = async () => {
    if (busy) return;
    if (mode === 'signup' && !name.trim()) { Alert.alert('Tu nombre', 'Dinos cómo te llamas para personalizar tu experiencia.'); return; }
    if (!email.trim() || !pwd) { Alert.alert('Faltan datos', 'Escribe tu correo y tu contraseña.'); return; }
    if (mode === 'signup' && pwd.length < 6) { Alert.alert('Contraseña', 'Usa al menos 6 caracteres.'); return; }
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await signUp(email, pwd, name.trim() || undefined);
        if (error) throw error;
        if (!data?.session) {
          Alert.alert('Confirma tu correo', 'Te enviamos un enlace para activar tu cuenta. Luego inicia sesión.');
          setMode('signin');
        }
      } else {
        const { error } = await signIn(email, pwd);
        if (error) throw error;
      }
    } catch (e: any) {
      Alert.alert('Ups', traducir(e?.message));
    } finally {
      setBusy(false);
    }
  };

  const guest = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { error } = await signInGuest();
      if (error) throw error;
    } catch {
      Alert.alert('Modo invitada no disponible', 'Crea una cuenta con tu correo para reservar y ganar puntos.');
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!email.trim()) { Alert.alert('Tu correo', 'Escribe tu correo arriba y vuelve a tocar aquí para enviarte el enlace.'); return; }
    if (busy) return;
    setBusy(true);
    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      Alert.alert('Revisa tu correo', `Te enviamos un enlace a ${email.trim()} para restablecer tu contraseña.`);
    } catch (e: any) {
      Alert.alert('Ups', traducir(e?.message));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (phase === 'splash') {
      const t = setTimeout(() => setPhase('welcome'), 2600);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Botón atrás de hardware (Android): retrocede entre fases en vez de cerrar la app.
  useEffect(() => {
    const onBack = () => {
      if (phase === 'auth') { setPhase('welcome'); return true; }
      if (phase === 'guide') {
        if (step > 0) { setStep(step - 1); return true; }
        setPhase('welcome'); return true;
      }
      return false; // splash/welcome: dejar que el SO cierre la app
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [phase, step]);

  const isSignup = mode === 'signup';

  let content: React.ReactNode = null;

  /* ───────────────────────── SPLASH ───────────────────────── */
  if (phase === 'splash') {
    content = (
      <Pressable onPress={() => setPhase('guide')} style={{ flex: 1, overflow: 'hidden', backgroundColor: '#06231A' }}>
        <Image source={RES('assets/hair-1.png')} style={StyleSheet.absoluteFill} contentFit="cover"
          contentPosition={{ top: '30%', left: '50%' }} transition={250}
          accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants" />
        <LinearGradient
          colors={['rgba(6,32,23,0.9)', 'rgba(8,46,34,0.52)', 'rgba(7,34,25,0.64)', 'rgba(4,19,13,0.95)']}
          locations={[0, 0.36, 0.68, 1]}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
          accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants" />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(9,52,38,0.36)' }]}
          accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants" />

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 46 }}>
          <Image source={RES('assets/belysh-mark-gold.png')} style={{ width: 90, height: 65 }} contentFit="contain" />
          <View style={{ marginTop: 20, paddingVertical: 2, paddingHorizontal: 6 }}>
            <Image source={RES('assets/belysh-wordmark-gold.png')} style={{ width: 178, height: 34 }} contentFit="contain" />
          </View>
          <Text style={{
            marginTop: 22, fontFamily: sans(600), fontSize: 10, letterSpacing: 3.6,
            color: 'rgba(235,224,200,0.86)', textTransform: 'uppercase', textAlign: 'center',
          }}>Tu belleza es nuestra prioridad</Text>
        </View>

        <Text style={{
          position: 'absolute', bottom: 44, left: 0, right: 0, textAlign: 'center',
          fontFamily: sans(700), fontSize: 9, letterSpacing: 5, color: 'rgba(216,196,160,0.62)',
        }}>LIMA · PERÚ</Text>
      </Pressable>
    );

  /* ───────────────────────── WELCOME (hub pre-login) ─────────────────────────
     Patrón Tesla Robotaxi / Turo: foto editorial full-bleed, marca centrada y
     CTAs claros abajo — el formulario vive en su propia pantalla, no aquí. */
  } else if (phase === 'welcome') {
    content = (
      <View style={{ flex: 1 }}>
        <View style={[StyleSheet.absoluteFill, { zIndex: 0 }]} accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants">
          <Image source={RES('assets/hair-2.png')} style={StyleSheet.absoluteFill} contentFit="cover"
            contentPosition={{ top: '18%', left: '50%' }} transition={350} />
          <LinearGradient
            colors={['rgba(6,32,23,0.62)', 'rgba(9,34,26,0.1)', 'rgba(9,34,26,0.28)', 'rgba(5,22,16,0.94)']}
            locations={[0, 0.3, 0.58, 1]}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(11,60,46,0.14)' }]} />
        </View>

        <View style={{ flex: 1, zIndex: 1, paddingHorizontal: 28 }}>
          {/* marca arriba */}
          <View style={{ alignItems: 'center', paddingTop: 84 }}>
            <Image source={RES('assets/belysh-mark-gold.png')} style={{ width: 64, height: 46 }} contentFit="contain" />
            <Image source={RES('assets/belysh-wordmark-gold.png')} style={{ width: 148, height: 28, marginTop: 12 }} contentFit="contain" />
          </View>

          <View style={{ flex: 1 }} />

          {/* claim + CTAs */}
          <View style={{ paddingBottom: 54 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <View style={{ width: 22, height: 1, backgroundColor: '#D9C18C' }} />
              <Text style={{ fontFamily: sans(700), fontSize: 10.5, letterSpacing: 2.6, textTransform: 'uppercase', color: '#D9C18C' }}>
                Salón de belleza · Lima
              </Text>
            </View>
            <Text style={{ fontFamily: serif(500), fontSize: 38, color: '#fff', lineHeight: 40 }}>
              Tu momento de{'\n'}<Text style={{ fontFamily: serif(500, true) }}>consentirte</Text> empieza aquí
            </Text>

            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); setMode('signup'); setPhase('auth'); }} disabled={busy}
              accessibilityRole="button" accessibilityState={{ disabled: busy }}
              style={({ pressed }) => ({ marginTop: 28, borderRadius: 999, overflow: 'hidden', opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.98 : 1 }], boxShadow: '0 18px 36px rgba(0,0,0,0.35)' as any })}>
              <LinearGradient colors={G.goldColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ paddingVertical: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)' as any }}>
                <Text style={{ fontFamily: sans(700), fontSize: 15, letterSpacing: 0.4, color: '#0A3B2C' }}>Crear cuenta</Text>
                <Svg width={15} height={13} viewBox="0 0 15 13" fill="none">
                  <Path d="M1 6.5h12M8.5 2l4.5 4.5L8.5 11" stroke="#0A3B2C" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={() => { setMode('signin'); setPhase('auth'); }} disabled={busy}
              accessibilityRole="button" accessibilityState={{ disabled: busy }}
              style={({ pressed }) => ({
                marginTop: 12, borderRadius: 999, paddingVertical: 16, alignItems: 'center',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', backgroundColor: 'rgba(255,255,255,0.12)',
                opacity: pressed ? 0.9 : 1,
              })}>
              <Text style={{ fontFamily: sans(600), fontSize: 14.5, color: '#fff' }}>Iniciar sesión</Text>
            </Pressable>

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 18, marginTop: 20 }}>
              <Pressable onPress={guest} disabled={busy} accessibilityRole="button" accessibilityState={{ disabled: busy }} hitSlop={8}>
                <Text style={{ fontFamily: sans(600), fontSize: 12.5, color: 'rgba(255,255,255,0.75)' }}>Explorar como invitada</Text>
              </Pressable>
              <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' }} />
              <Pressable onPress={() => { setStep(0); setPhase('guide'); }} disabled={busy} accessibilityRole="button" hitSlop={8}>
                <Text style={{ fontFamily: sans(600), fontSize: 12.5, color: 'rgba(255,255,255,0.75)' }}>Conoce Belysh</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );

  /* ───────────────────────── GUIDE ───────────────────────── */
  } else if (phase === 'guide') {
    const g = guides[step];
    content = (
      <View style={{ flex: 1 }}>
        <PhotoBg img={g.img} pos={g.pos} />
        <View style={{ flex: 1, zIndex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 60, paddingHorizontal: 24 }}>
            <Pressable onPress={() => setPhase('welcome')}
              accessibilityRole="button" accessibilityLabel="Saltar introducción"
              style={{ backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16 }}>
              <Text style={{ fontFamily: sans(600), fontSize: 12.5, letterSpacing: 0.4, color: 'rgba(255,255,255,0.92)' }}>Saltar</Text>
            </Pressable>
          </View>

          <View style={{ flex: 1 }} />

          <View style={{ paddingHorizontal: 30, paddingBottom: 40 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <View style={{ width: 22, height: 1, backgroundColor: '#D9C18C' }} />
              <Text style={{ fontFamily: sans(700), fontSize: 11, letterSpacing: 2.6, textTransform: 'uppercase', color: '#D9C18C' }}>
                {g.num} — Belysh
              </Text>
            </View>

            <Text style={{ fontFamily: serif(500), fontSize: 39, color: '#fff', lineHeight: Math.round(39 * 1.04) }}>
              {g.a}<Text style={{ fontFamily: serif(500, true) }}>{g.b}</Text>
            </Text>

            <Text style={{
              fontFamily: sans(400), fontSize: 14.5, color: 'rgba(255,255,255,0.82)',
              lineHeight: Math.round(14.5 * 1.6), marginTop: 14, maxWidth: 300,
            }}>{g.text}</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 30 }}>
              <View style={{ flexDirection: 'row', gap: 7, flex: 1, alignItems: 'center' }}>
                {guides.map((_, i) => (
                  <Pressable key={i} onPress={() => setStep(i)}
                    accessibilityRole="button" accessibilityLabel={`Ir al paso ${i + 1}`}
                    style={{ height: 3, flexGrow: i === step ? 2.4 : 1, borderRadius: 999, backgroundColor: i === step ? '#FBF8F1' : 'rgba(255,255,255,0.34)' }} />
                ))}
              </View>
              <Pressable
                onPress={() => (step < guides.length - 1 ? setStep(step + 1) : (setMode('signup'), setPhase('auth')))}
                style={{
                  height: 56, paddingHorizontal: 26, borderRadius: 999, backgroundColor: '#FBF8F1',
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  boxShadow: '0 14px 30px rgba(0,0,0,0.3)' as any,
                }}>
                <Text style={{ fontFamily: sans(600), fontSize: 14.5, letterSpacing: 0.3, color: T.roseDeep }}>
                  {step < guides.length - 1 ? 'Siguiente' : 'Empezar'}
                </Text>
                <ArrowIcon />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );

  /* ───────────────────────── AUTH ───────────────────────── */
  } else {
    content = (
      <View style={{ flex: 1 }}>
        {/* Fondo editorial con velo suave */}
        <View style={[StyleSheet.absoluteFill, { zIndex: 0 }]} accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants">
          <Image source={RES('assets/hair-1.png')} style={StyleSheet.absoluteFill} contentFit="cover"
            contentPosition={{ top: '22%', left: '50%' }} transition={250} />
          <LinearGradient
            colors={['rgba(9,34,26,0.42)', 'rgba(9,34,26,0.3)', 'rgba(7,28,21,0.62)']}
            locations={[0, 0.42, 1]}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(11,60,46,0.16)' }]} />
        </View>

        {/* volver al hub de bienvenida */}
        <Pressable onPress={() => setPhase('welcome')}
          accessibilityRole="button" accessibilityLabel="Volver"
          style={{ position: 'absolute', top: 62, left: 22, zIndex: 2, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
          <Svg width={9} height={15} viewBox="0 0 9 14"><Path d="M8 1L2 7l6 6" stroke="#fff" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></Svg>
        </Pressable>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, zIndex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 22, paddingTop: 40, paddingBottom: 30 }}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Tarjeta de vidrio */}
          <View style={{
            borderRadius: 30, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)',
            boxShadow: '0 30px 60px -22px rgba(6,28,21,0.65)' as any,
          }}>
            <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />

            <View style={{ paddingTop: 34, paddingHorizontal: 26, paddingBottom: 30 }}>
              {/* marca */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 18 }}>
                <View style={{ width: 20, height: 1, backgroundColor: 'rgba(217,193,140,0.85)' }} />
                <Text style={{ fontFamily: serif(500, true), fontSize: 22, color: '#fff', letterSpacing: 0.4 }}>Belysh</Text>
                <View style={{ width: 20, height: 1, backgroundColor: 'rgba(217,193,140,0.85)' }} />
              </View>

              <View style={{ alignItems: 'center', marginBottom: 22 }}>
                <Text style={{ fontFamily: serif(500), fontSize: 32, color: '#fff', lineHeight: Math.round(32 * 1.04) }}>
                  {isSignup ? 'Crea tu cuenta' : 'Inicia sesión'}
                </Text>
                <Text style={{ fontFamily: sans(500), fontSize: 12.5, color: 'rgba(255,255,255,0.78)', marginTop: 7, lineHeight: Math.round(12.5 * 1.5), textAlign: 'center' }}>
                  {isSignup ? 'Reserva, gana puntos y consiéntete' : 'Nos alegra verte de nuevo'}
                </Text>
              </View>

              {/* campos */}
              <View style={{ gap: 13 }}>
                {isSignup && <Field icon={<UserIcon />} value={name} set={setName} ph="Tu nombre" cap="words" />}
                <Field icon={<MailIcon />} value={email} set={setEmail} ph="Correo electrónico" email />
                <Field
                  icon={<LockIcon />}
                  value={pwd}
                  set={setPwd}
                  ph="Contraseña"
                  secure={!showPwd}
                  extra={
                    <Pressable onPress={() => setShowPwd((v) => !v)}
                      accessibilityRole="button"
                      accessibilityLabel={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      style={{ position: 'absolute', right: 18, padding: 4, zIndex: 2 }}>
                      {showPwd ? <EyeIcon /> : <EyeOffIcon />}
                    </Pressable>
                  }
                />
              </View>

              {!isSignup && (
                <View style={{ alignItems: 'flex-end', marginTop: 11 }}>
                  <Pressable onPress={forgot} hitSlop={10}>
                    <Text style={{ fontFamily: sans(600), fontSize: 12, color: 'rgba(255,255,255,0.85)', textDecorationLine: 'underline' }}>
                      ¿Olvidaste tu contraseña?
                    </Text>
                  </Pressable>
                </View>
              )}

              <Pressable onPress={submit} disabled={busy}
                accessibilityRole="button"
                accessibilityState={{ disabled: busy }}
                style={({ pressed }) => ({
                  borderRadius: 999, overflow: 'hidden', marginTop: 20,
                  opacity: busy ? 0.6 : pressed ? 0.92 : 1, boxShadow: '0 16px 30px rgba(0,0,0,0.28)' as any,
                })}>
                <LinearGradient colors={G.goldColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{ paddingVertical: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)' as any }}>
                  <Text style={{ fontFamily: sans(700), fontSize: 15, letterSpacing: 0.3, color: '#0A3B2C' }}>
                    {busy ? 'Un momento…' : isSignup ? 'Crear cuenta' : 'Entrar'}
                  </Text>
                  {!busy && (
                    <Svg width={15} height={13} viewBox="0 0 15 13" fill="none">
                      <Path d="M1 6.5h12M8.5 2l4.5 4.5L8.5 11" stroke="#0A3B2C" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  )}
                </LinearGradient>
              </Pressable>

              {/* social — Google se muestra solo al configurar credenciales (GOOGLE_ENABLED) */}
              {GOOGLE_ENABLED && (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20, marginBottom: 14 }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.24)' }} />
                    <Text style={{ fontFamily: sans(600), fontSize: 10.5, letterSpacing: 1.5, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
                      o continúa con
                    </Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.24)' }} />
                  </View>
                  <Pressable disabled={busy} onPress={handleGoogle}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: busy }}
                    style={{
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                      borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 999, paddingVertical: 14,
                      backgroundColor: 'rgba(255,255,255,0.12)',
                    }}>
                    <GoogleIcon />
                    <Text style={{ fontFamily: sans(600), fontSize: 13.5, color: '#fff' }}>Continuar con Google</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>

          {/* cambiar de modo */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            <Text style={{ fontFamily: sans(500), fontSize: 13, color: 'rgba(255,255,255,0.82)' }}>
              {isSignup ? '¿Ya tienes cuenta? ' : '¿Aún no tienes cuenta? '}
            </Text>
            <Pressable onPress={() => setMode(isSignup ? 'signin' : 'signup')}>
              <Text style={{ fontFamily: sans(700), fontSize: 13, color: '#fff', textDecorationLine: 'underline' }}>
                {isSignup ? 'Inicia sesión' : 'Regístrate'}
              </Text>
            </Pressable>
          </View>

          <Pressable onPress={guest} disabled={busy} accessibilityRole="button" accessibilityState={{ disabled: busy }} style={{ alignSelf: 'center', marginTop: 12 }}>
            <Text style={{ fontFamily: sans(600), fontSize: 12.5, color: 'rgba(255,255,255,0.7)' }}>Explorar como invitada</Text>
          </Pressable>
        </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#0A2A20' }}>
      <StatusBar style="light" />
      {content}
    </View>
  );
}
