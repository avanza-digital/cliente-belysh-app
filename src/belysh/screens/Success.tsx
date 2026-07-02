import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Linking, Platform, Alert } from "react-native";
import * as Calendar from "expo-calendar";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { T, serif, sans, Eyebrow, Btn } from "../ui";
import { fmtDate, fmtTime } from "../lib/date";
import { Service, BookingState } from "../data";
import { Appointment } from "../types/db";

// TODO(pendientes): dirección/coords reales del salón.
const SALON_QUERY = "Belysh, Lima, Perú";

// Botón "soft" inline para honrar el padding exacto del prototipo ('14px 10px').
function SoftBtn({ label, onPress, disabled }: any) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => ({
        flex: 1,
        borderRadius: 999,
        backgroundColor: T.soft,
        paddingVertical: 14,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.5 : pressed ? 0.92 : 1,
        transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
      })}
    >
      <Text style={{ fontFamily: sans(600), fontSize: 13, letterSpacing: 0.4, color: T.roseDeep }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function Success({ s, st, appt, onHome }: { s: Service; st: BookingState; appt: Appointment | null; onHome: () => void }) {
  const startsAt: string | undefined = appt?.starts_at ?? undefined;
  const isReschedule = !!st?.rescheduleId;
  const fecha = startsAt ? fmtDate(startsAt) : "";
  const hora = startsAt ? fmtTime(startsAt) : st?.time ?? "";
  const [calAdded, setCalAdded] = useState(false);

  // Instante absoluto real de la cita (starts_at ya trae el offset Lima).
  const apptRange = () => {
    const start = startsAt ? new Date(startsAt) : new Date();
    const end = new Date(start.getTime() + (appt?.duration_min || s?.min || 60) * 60000);
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
      setCalAdded(true);
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

        <Eyebrow>{isReschedule ? "¡Cita reagendada!" : "¡Cita confirmada!"}</Eyebrow>

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
            {fecha}
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
          {s?.name} a las {hora}.{"\n"}Prepárate para brillar
        </Text>

        {/* Chip de puntos ganados (solo en reserva nueva) */}
        {!isReschedule && (
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
            <View style={{ flexDirection: "row", alignItems: "baseline", flexShrink: 1 }}>
              <Text style={{ color: T.goldText, fontFamily: sans(600), fontSize: 13 }}>Sumarás tus puntos al pagar tu cita</Text>
            </View>
          </View>
        )}

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
          <SoftBtn label={calAdded ? "Agregado ✓" : "Añadir al calendario"} onPress={addToCalendar} disabled={calAdded} />
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
