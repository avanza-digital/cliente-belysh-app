import React from "react";
import { View, Text, Pressable, StyleSheet, Linking, Platform, Alert } from "react-native";
import * as Calendar from "expo-calendar";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { T, serif, sans, Eyebrow, Btn, useCountUp } from "../ui";
import { dow } from "../data";

// TODO(pendientes): dirección/coords reales del salón.
const SALON_QUERY = "Belysh, Lima, Perú";

// Botón "soft" inline para honrar el padding exacto del prototipo ('14px 10px',
// que el <Btn> del kit no expone). Mismo estilo visual que Btn kind="soft".
function SoftBtn({ label, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        borderRadius: 999,
        backgroundColor: T.soft,
        paddingVertical: 14,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text style={{ fontFamily: sans(600), fontSize: 13, letterSpacing: 0.4, color: T.roseDeep }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function Success({ s, st, onHome }: any) {
  const day = { d: dow(st?.day), n: st?.day };
  const gained = useCountUp(s?.price ?? 0, 1000);

  // Fecha/hora reales de la cita (Junio 2026 del prototipo).
  const apptRange = () => {
    const [hh, mm] = String(st?.time || "9:00").split(":").map(Number);
    const start = new Date(2026, 5, st?.day || 1, hh || 9, mm || 0, 0);
    const end = new Date(start.getTime() + (s?.min || 60) * 60000);
    return { start, end };
  };

  const addToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso necesario", "Activa el acceso al calendario para guardar tu cita.");
        return;
      }
      const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      let cal: any = null;
      if (Platform.OS === "ios") {
        try { cal = await Calendar.getDefaultCalendarAsync(); } catch {}
      }
      if (!cal) cal = cals.find((c: any) => c.allowsModifications) || cals[0];
      if (!cal) {
        Alert.alert("Sin calendario", "No encontramos un calendario para guardar la cita.");
        return;
      }
      const { start, end } = apptRange();
      await Calendar.createEventAsync(cal.id, {
        title: `Belysh · ${s?.name}`,
        startDate: start,
        endDate: end,
        location: SALON_QUERY,
        notes: "Tu cita en Belysh. ¡Prepárate para brillar! ✦",
        timeZone: "America/Lima",
        alarms: [{ relativeOffset: -120 }],
      });
      Alert.alert("Agendado ✦", "Tu cita quedó en el calendario.");
    } catch {
      Alert.alert("Ups", "No se pudo agregar al calendario.");
    }
  };

  const howToGet = async () => {
    const q = encodeURIComponent(SALON_QUERY);
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${q}`,
      android: `geo:0,0?q=${q}`,
      default: `https://www.google.com/maps/search/?api=1&query=${q}`,
    }) as string;
    try { await Linking.openURL(url); } catch { Alert.alert("Ups", "No se pudo abrir el mapa."); }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Fondo claro propio: base marfil + lavado verde (arriba-izq) + lavado arena
          (arriba-der), aproximación de los 3 radiales del prototipo. */}
      <LinearGradient
        colors={["#F6F3EB", "#F2F0E6"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(232,240,233,0.9)", "rgba(232,240,233,0)"]}
        start={{ x: 0.18, y: 0.06 }}
        end={{ x: 0.62, y: 0.58 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(242,235,220,0.95)", "rgba(242,235,220,0)"]}
        start={{ x: 0.92, y: 0.26 }}
        end={{ x: 0.4, y: 0.72 }}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 40,
          paddingHorizontal: 32,
        }}
      >
        {/* Disco con check */}
        <View
          style={{
            width: 110,
            height: 110,
            borderRadius: 55,
            backgroundColor: T.soft,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          <Svg width={46} height={46} viewBox="0 0 24 24" fill="none">
            <Path
              d="M5 12.5l4.2 4.2L19 7"
              stroke="#0F6B50"
              strokeWidth={1.6}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        <Eyebrow>¡Cita confirmada!</Eyebrow>

        <Text
          style={{
            fontFamily: serif(500),
            fontSize: 34,
            color: T.ink,
            marginTop: 12,
            lineHeight: 37,
            textAlign: "center",
          }}
        >
          Nos vemos el{" "}
          <Text style={{ fontFamily: serif(500, true), color: T.rose }}>
            {day.d} {day.n}
          </Text>
        </Text>

        <Text
          style={{
            fontFamily: sans(600),
            fontSize: 14.5,
            color: T.body,
            marginTop: 14,
            lineHeight: 22,
            textAlign: "center",
          }}
        >
          {s?.name} a las {st?.time}.{"\n"}Prepárate para brillar
        </Text>

        {/* Chip de puntos ganados */}
        <View
          style={{
            marginTop: 20,
            alignSelf: "center",
            flexDirection: "row",
            alignItems: "center",
            gap: 9,
            backgroundColor: "#EFE7DF",
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 999,
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: T.emerald,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12 }}>✦</Text>
          </View>
          <Text style={{ color: T.emerald, fontFamily: sans(600), fontSize: 13 }}>
            Ganaste +{gained} puntos Belysh Club
          </Text>
        </View>

        {/* Acciones secundarias */}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginTop: 26,
            width: "100%",
            maxWidth: 330,
            alignSelf: "center",
          }}
        >
          <SoftBtn label="Añadir al calendario" onPress={addToCalendar} />
          <SoftBtn label="Cómo llegar" onPress={howToGet} />
        </View>

        {/* CTA principal */}
        <View style={{ marginTop: 12, width: "100%", maxWidth: 330, alignSelf: "center" }}>
          <Btn full onPress={onHome}>
            Volver al inicio
          </Btn>
        </View>
      </View>
    </View>
  );
}
