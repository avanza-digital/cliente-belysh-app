import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  Scroll, Eyebrow, GradientText, ServiceCard, Glass, EmeraldGradient,
  T, serif, sans,
} from '../ui';
import { BELYSH, Service } from '../data';

const B = BELYSH;

export default function Servicios({ openService }: { openService: (s: Service) => void }) {
  const [cat, setCat] = useState('Todo');
  const [q, setQ] = useState('');
  const [sortP, setSortP] = useState(false);

  let list = B.SERVICES.filter(
    (s) =>
      (cat === 'Todo' || s.cat === cat) &&
      s.name.toLowerCase().includes(q.trim().toLowerCase())
  );
  if (sortP) list = [...list].sort((a, b) => a.price - b.price);

  return (
    <Scroll pb={40}>
      {/* Encabezado */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <Eyebrow>Carta de servicios</Eyebrow>
        <GradientText style={{ fontFamily: serif(500), fontSize: 32, lineHeight: 38, marginTop: 6 }}>
          Cabello & estilo
        </GradientText>
      </View>

      {/* Buscador */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Glass
          radius={999}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 12,
            paddingHorizontal: 16,
            boxShadow: '0 6px 16px rgba(20,45,35,0.06)' as any,
          }}
        >
          <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
            <Circle cx={7} cy={7} r={5} stroke={T.muted} strokeWidth={1.4} />
            <Path d="M11 11l3 3" stroke={T.muted} strokeWidth={1.4} strokeLinecap="round" />
          </Svg>
          <TextInput
            value={q}
            onChangeText={setQ}
            accessibilityLabel="Buscar servicio"
            placeholder="Buscar servicio..."
            placeholderTextColor={T.muted}
            style={{
              flex: 1,
              minWidth: 0,
              padding: 0,
              fontFamily: sans(600),
              fontSize: 14,
              color: T.ink,
            }}
          />
          {q ? (
            <Pressable
              onPress={() => setQ('')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Borrar búsqueda"
            >
              <Text style={{ color: T.muted, fontSize: 18, lineHeight: 18 }}>×</Text>
            </Pressable>
          ) : null}
        </Glass>
      </View>

      {/* Chips de categoría */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 9, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8 }}
      >
        {B.CATEGORIES.map((c: string) => {
          const on = c === cat;
          return (
            <Pressable
              key={c}
              onPress={() => setCat(c)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={{
                borderRadius: 999,
                overflow: 'hidden',
                backgroundColor: on ? undefined : '#fff',
                boxShadow: (on
                  ? '0 8px 18px rgba(15,107,80,0.3)'
                  : '0 4px 12px rgba(20,45,35,0.06)') as any,
              }}
            >
              {on && <EmeraldGradient style={StyleSheet.absoluteFill} />}
              <Text
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  fontFamily: sans(600),
                  fontSize: 12.5,
                  color: on ? '#fff' : T.body,
                }}
              >
                {c}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Contador + orden */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 4,
          paddingBottom: 10,
        }}
      >
        <Text style={{ fontFamily: sans(700), fontSize: 12, color: T.muted }}>
          {list.length} servicio{list.length === 1 ? '' : 's'}
        </Text>
        <Pressable
          onPress={() => setSortP((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={
            sortP
              ? 'Ordenar por relevancia. Orden actual: menor precio'
              : 'Ordenar por menor precio. Orden actual: relevancia'
          }
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
            <Path
              d="M4 2.5v9M4 11.5L2 9.5M4 11.5L6 9.5M10 11.5v-9M10 2.5L8 4.5M10 2.5l2 2"
              stroke={T.rose}
              strokeWidth={1.3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={{ fontFamily: sans(600), fontSize: 12, color: T.rose }}>
            {sortP ? 'Menor precio' : 'Relevancia'}
          </Text>
        </Pressable>
      </View>

      {/* Lista */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 4, gap: 12 }}>
        {list.length ? (
          list.map((s) => (
            <ServiceCard key={s.id} s={s} onSelect={openService} />
          ))
        ) : (
          <Text
            style={{
              textAlign: 'center',
              paddingVertical: 50,
              color: T.muted,
              fontFamily: sans(600),
            }}
          >
            Sin resultados para "{q}"
          </Text>
        )}
      </View>
    </Scroll>
  );
}
