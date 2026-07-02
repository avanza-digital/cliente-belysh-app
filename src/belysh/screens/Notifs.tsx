import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { Eyebrow, GradientText, Scroll, T, serif, sans, I } from "../ui";
import { listNotifications, Notif } from "../api/notifications";

export default function Notifs() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(false);
    try {
      const n = await listNotifications();
      if (alive.current) setNotifs(n);
    } catch {
      if (alive.current) setError(true);
    } finally {
      if (!isRefresh && alive.current) setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try { await load(true); } finally { setRefreshing(false); }
  }, [load]);

  // Iconos por tipo
  const ic: any = {
    clock: (c: string) => I.clock(c),
    spark: (c: string) => (
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path d="M12 4l2.2 5.8L20 12l-5.8 2.2L12 20l-2.2-5.8L4 12l5.8-2.2z" stroke={c} strokeWidth={1.7} strokeLinejoin="round" />
      </Svg>
    ),
    gift: (c: string) => (
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path d="M4 11h16v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8zM3 7h18v4H3zM12 7v13M12 7C12 7 10.5 3.5 8.2 4.3 6.4 5 7.5 7 12 7zm0 0s1.5-3.5 3.8-2.7c1.8.7.7 2.7-3.8 2.7z" stroke={c} strokeWidth={1.5} strokeLinejoin="round" />
      </Svg>
    ),
    promo: (c: string) => I.promo(c),
  };

  return (
    <View style={{ flex: 1, minHeight: 0 }}>
      <View style={{ paddingHorizontal: 22, paddingBottom: 4 }}>
        <Eyebrow>Al día</Eyebrow>
        <GradientText style={{ fontFamily: serif(500), fontSize: 30, marginTop: 6 }}>
          Notificaciones
        </GradientText>
      </View>

      <Scroll pb={24} style={{ paddingTop: 18, paddingHorizontal: 20, gap: 12 }} onRefresh={refresh} refreshing={refreshing}>
        {loading ? (
          <ActivityIndicator color={T.rose} style={{ paddingVertical: 28 }} />
        ) : error ? (
          <View style={{ alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 }}>
            <Text style={{ fontFamily: sans(600), fontSize: 13, color: T.muted, textAlign: "center" }}>
              No pudimos cargar tus notificaciones.
            </Text>
            <Pressable onPress={() => load()} style={{ marginTop: 12 }}>
              <Text style={{ fontFamily: sans(700), fontSize: 13, color: T.rose }}>Reintentar</Text>
            </Pressable>
          </View>
        ) : notifs.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 }}>
            <Text style={{ fontFamily: serif(600), fontSize: 19, color: T.ink }}>Todo tranquilo por aquí</Text>
            <Text style={{ fontFamily: sans(600), fontSize: 13, color: T.muted, marginTop: 6, textAlign: "center" }}>
              Cuando reserves o ganes puntos, te avisamos aquí.
            </Text>
          </View>
        ) : (
          notifs.map((n) => {
            const isE = n.tone === "emerald";
            const col = isE ? T.emerald : T.rose;
            return (
              <View
                key={n.id}
                style={{
                  backgroundColor: n.unread ? "#fff" : "transparent",
                  borderWidth: n.unread ? 0 : 1,
                  borderColor: T.line,
                  borderRadius: 18,
                  padding: 16,
                  flexDirection: "row",
                  gap: 13,
                  alignItems: "flex-start",
                  boxShadow: (n.unread ? "0 8px 20px rgba(20,45,35,0.07)" : undefined) as any,
                }}
              >
                <LinearGradient
                  colors={isE ? ["#F4E8D4", "#E7CF9B"] : ["#D9F0E7", "#BFE7DB"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center",
                    overflow: "hidden", flexShrink: 0, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)" as any,
                  }}
                >
                  {ic[n.icon](col)}
                </LinearGradient>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                    <Text style={{ fontFamily: sans(600), fontSize: 14.5, color: T.ink, lineHeight: 19, flex: 1 }}>
                      {n.title}
                    </Text>
                    {n.unread ? (
                      <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: col, flexShrink: 0, marginTop: 6 }} />
                    ) : null}
                  </View>
                  <Text style={{ fontFamily: sans(600), fontSize: 13, color: T.body, lineHeight: 20, marginTop: 4 }}>
                    {n.body}
                  </Text>
                  <Text style={{ fontFamily: sans(700), fontSize: 11, color: T.muted, marginTop: 6 }}>
                    {n.time}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </Scroll>
    </View>
  );
}
