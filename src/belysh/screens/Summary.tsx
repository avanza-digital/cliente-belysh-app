import React from 'react';
import { View, Text } from 'react-native';
import { Scroll, FixedBar, Glass, Photo, Eyebrow, Btn, T, serif, sans } from '../ui';
import { BELYSH, dow } from '../data';
import { money } from '../lib/money';

const B = BELYSH as any;

function Row({ k, v }: any) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: T.line }}>
      <Text style={{ fontFamily: sans(700), fontSize: 13, color: T.muted }}>{k}</Text>
      <Text style={{ fontFamily: sans(600), fontSize: 14, color: T.ink }}>{v}</Text>
    </View>
  );
}

export default function Summary({ s, st, onConfirm, submitting }: any) {
  const stylist = B.STYLISTS.find((p: any) => p.id === st.stylist) || { name: '—' };
  const day = { d: dow(st.day), n: st.day };

  return (
    <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <Scroll pb={120}>
        <View style={{ paddingHorizontal: 22 }}>
          <Eyebrow>Casi listo</Eyebrow>
          <Text style={{ fontFamily: serif(500), fontSize: 28, color: T.ink, marginTop: 6, marginBottom: 16, lineHeight: 31 }}>Confirma tu cita</Text>

          <Glass radius={22} style={{ paddingTop: 8, paddingHorizontal: 20, paddingBottom: 16, boxShadow: '0 8px 22px rgba(20,45,35,0.07)' as any }}>
            <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: T.line }}>
              <Photo tone={s.tone} tag={s.tag} img={s.img} pos={s.pos} h={56} r={16} style={{ width: 56 }} />
              <Text style={{ flex: 1, fontFamily: serif(600), fontSize: 18, color: T.ink, lineHeight: 20 }}>{s.name}</Text>
            </View>
            <Row k="Estilista" v={stylist.name} />
            <Row k="Fecha" v={`${day.d} ${day.n} jun`} />
            <Row k="Hora" v={st.time} />
            <Row k="Duración" v={`${s.min} min`} />
          </Glass>

          <View style={{ backgroundColor: T.soft, borderRadius: 22, paddingVertical: 18, paddingHorizontal: 20, marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Eyebrow c={T.roseDeep} style={{ fontSize: 9.5 }}>Total</Eyebrow>
              <Text style={{ fontFamily: serif(500), fontSize: 30, color: T.roseDeep, marginTop: 2 }}>{money(s.price)}</Text>
            </View>
            <Text style={{ fontFamily: sans(600), fontSize: 11.5, color: T.body, textAlign: 'right', maxWidth: 150 }}>
              Pago en el salón · ganas <Text style={{ fontFamily: sans(700), color: T.emerald }}>+{s.price} pts</Text>
            </Text>
          </View>

          <Text style={{ fontFamily: sans(600), fontSize: 11.5, color: T.muted, marginTop: 14, lineHeight: 17 }}>Cancelación gratuita hasta 24 h antes. Te enviaremos un recordatorio</Text>
        </View>
      </Scroll>
      <FixedBar><Btn full onPress={onConfirm} disabled={submitting}>{submitting ? 'Reservando…' : 'Confirmar mi cita'}</Btn></FixedBar>
    </View>
  );
}
