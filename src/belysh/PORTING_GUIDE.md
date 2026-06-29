# Belysh — Guía de port Web (prototipo) → React Native (Expo SDK 56)

Estás portando UNA pantalla del prototipo web `reference-web/src/DirectionGlass.jsx`
a un archivo `.tsx` de React Native. **Replica el diseño EXACTO** (colores, tamaños,
espaciados, tipografías, radios, sombras). No rediseñes nada. No simplifiques el layout.

## Reglas de traducción (web → RN) — OBLIGATORIAS

| Web (prototipo) | React Native |
|---|---|
| `<div style={{...}}>` | `<View style={{...}}>` |
| Texto suelto / `<span>` / `<p>` con texto | SIEMPRE dentro de `<Text>`. RN crashea si hay texto fuera de `<Text>`. |
| `<button onClick={fn}>` | `<Pressable onPress={fn}>` (o `Btn` del UI kit) |
| `<input value onChange>` | `<TextInput value onChangeText placeholder placeholderTextColor>` |
| `<img src={RES(x)} style=.../>` | `<Image source={RES(x)} ... />` de `expo-image` (`contentFit="cover"`, `contentPosition={parsePos(pos)}`) |
| `onClick` | `onPress` |
| `background: 'linear-gradient(...)'` | componente `<LinearGradient>` o los helpers `EmeraldGradient` / `EmeraldCard` / `GoldGradient` (NO existe gradiente en `style`) |
| `backdropFilter` / vidrio | componente `<Glass variant="card|chip|tab">` (NO existe en `style`) |
| `.belysh-gt` (texto con gradiente esmeralda→oro) | `<GradientText style={...}>...</GradientText>` |
| `fontFamily: T.serif, fontWeight: 600, fontStyle:'italic'` | `fontFamily: serif(600, true)` (helper). Para sans: `fontFamily: sans(700)` |
| `lineHeight: 1.1` (unitless) | número en px → `lineHeight: Math.round(fontSize*1.1)` |
| `letterSpacing`, `gap`, `aspectRatio`, `flexWrap`, `textTransform`, `boxShadow` | ✅ soportados en RN 0.85 — déjalos igual (boxShadow como string `'0 8px 22px rgba(...)'` funciona) |
| `position:'absolute', inset:0` | `...StyleSheet.absoluteFillObject` o `position:'absolute', top:0,left:0,right:0,bottom:0` |
| `borderRadius: '50%'` (círculo) | `borderRadius: <mitad del width>` (número) |
| `display:'grid'`, `placeItems:'center'` | `alignItems:'center', justifyContent:'center'` (Views con flex) |
| `overflowX:'auto'` (scroll horizontal) | `<ScrollView horizontal showsHorizontalScrollIndicator={false}>` |
| `overflowY:'auto'` (scroll vertical) | usa el helper `<Scroll>` del UI kit, o `<ScrollView>` |
| `cursor`, `:hover`, `:active`, `:focus`, `::placeholder`, `transition`, `whiteSpace`, `textWrap`, `pointerEvents:'none'` en style | omitir (no existen). Para `pointerEvents` usar la prop `pointerEvents="none"` en el componente. |
| `padding: '16px 20px'` (string CSS) | `paddingVertical:16, paddingHorizontal:20` (números) |
| `<br/>` | usa `\n` dentro del `<Text>` o dos `<Text>` |
| `text-decoration: line-through` | `textDecorationLine:'line-through'` |
| SVG: `<svg><path/><circle/><rect/>` | `<Svg><Path/><Circle/><Rect/>` de `react-native-svg`. Los atributos ya son camelCase (strokeWidth, strokeLinecap…) → casi 1:1. width/height/r/cx como números. |
| `fontVariantNumeric:'tabular-nums lining-nums'` | `fontVariant:['tabular-nums']` o omitir |

## Primitivas disponibles (importar de `'../ui'`)

```ts
import {
  T, G, TONE, serif, sans, RES, parsePos,
  Glass, EmeraldGradient, GoldGradient, EmeraldCard, GradientText,
  Photo, Eyebrow, Stars, Petal, Btn, ServiceCard, MonthCal,
  Scroll, FixedBar, TopBar, TabBar, Mesh, AppBackground, useCountUp, I,
} from '../ui';
```

- `T` = tokens de color. OJO con los nombres (heredados del prototipo, NO son rosados):
  `T.rose`=#0E5E47 (esmeralda), `T.roseDeep`=#0A4632, `T.emerald`=#A9885A (¡oro!),
  `T.ink`, `T.body`, `T.muted`, `T.line`, `T.soft`, `T.card`, `T.bg`, `T.blush`, `T.roseSoft`.
- `Glass` props: `variant` `'card'|'chip'|'tab'`, `radius`, `style`, children. Reemplaza CUALQUIER superficie con `background:G.card/G.chip + backdropFilter + border:G.bd`.
- `Photo` props: `tone` (`'emerald'|'rose'|'sand'`), `tag`, `img` (string p.ej. `'assets/hair-1.png'`), `pos`, `h`, `r`, `style`. (El parallax del prototipo se omite en v1; el resto idéntico.)
- `Btn` props: `kind` `'solid'|'soft'`, `full`, `onPress`, `disabled`, `style`, `textStyle`, children (string u elementos). solid = gradiente esmeralda + texto blanco; soft = T.soft + texto roseDeep.
- `EmeraldGradient` = el gradiente esmeralda (botones/chips activos). `EmeraldCard` = la tarjeta metálica esmeralda (Club/giftcard). `GoldGradient` = oro.
- `Eyebrow` props: `c`, `style`, children → texto uppercase tracking.
- `useCountUp(target, dur)` → número animado (igual que el prototipo).
- `I` = set de iconos compartido: `I.inicio(c,f) I.serv(c) I.promo(c) I.club(c) I.perfil(c) I.back(c) I.clock(c)`. Devuelven JSX (úsalo como `{I.clock(T.muted)}`).
- Iconos NO incluidos en `I` (los inline de tu pantalla): re-créalos con `<Svg>` de `react-native-svg` copiando el path del prototipo.

## Datos (importar de `'../data'`)

```ts
import { BELYSH, NOTIFS, CAL, DOW, dow, GUIDES } from '../data';
const B = BELYSH;
```
Shapes: `B.SERVICES[]` (id,name,cat,min,price,popular,desc,tone,tag,img,pos),
`B.CATEGORIES[]`, `B.STYLISTS[]` (id,name,role,initials,rating), `B.DAYS`, `B.TIMES`,
`B.TIMES_TAKEN`, `B.PROMOS[]` (id,title,kind,desc,now,was,badge,tone,img), `B.REVIEWS[]`
(id,name,stars,service,text), `B.CLUB` (member,points,tier,nextTier,toNext,tierMin,
tierMax,tiers[],rewards[]), `B.APPOINTMENTS[]`, `B.PROFILE`.

## Estructura del archivo

```tsx
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { /* primitivas que uses */ } from '../ui';
import { BELYSH } from '../data';
const B = BELYSH as any;

export default function NombrePantalla(props: any) {
  // ...estado y helpers locales igual que el prototipo...
  return ( /* ...JSX RN... */ );
}
```

Tipa props como `any` (o destructura libremente). No te pelees con TypeScript; usa `as any` cuando ayude. Lo importante es la fidelidad visual y que compile.

## Contrato de props por pantalla
- Inicio: `{ openService, go }` · Servicios: `{ openService }` · Detalle: `{ s, onBook }`
- Booking: `{ s, st, setSt, onNext }` · Summary: `{ s, st, onConfirm }` · Success: `{ s, st, onHome }`
- Promos: `{}` · Club: `{}` · Perfil: `{ onReschedule }` · Notifs: `{}`
- Welcome: `{ onEnter }`

## Checklist antes de terminar
- [ ] Todo texto está dentro de `<Text>`.
- [ ] Ningún gradiente/blur en `style` (usar componentes).
- [ ] Ningún `fontWeight`/`fontStyle` suelto: usar `serif()`/`sans()`.
- [ ] `onClick`→`onPress`, `<img>`→`<Image>`, `<input>`→`<TextInput>`.
- [ ] `borderRadius:'50%'`→número; `lineHeight` unitless→px; paddings string→numéricos.
- [ ] Scroll horizontal con `<ScrollView horizontal>`.
- [ ] Sin props CSS-only (cursor, transition, whiteSpace, etc.).
- [ ] Colores/tamaños/espaciados IDÉNTICOS al prototipo.
