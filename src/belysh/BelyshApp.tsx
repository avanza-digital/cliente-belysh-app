import React, { useState, useEffect, useCallback } from 'react';
import { View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground, TopBar, TabBar } from './ui';
import { BELYSH } from './data';
import { useAuth } from './api/auth';
import { createAppointment } from './api/appointments';
import { countUnread, markNotifsSeen } from './api/notifications';
import { traducir } from './lib/errors';

import Welcome from './screens/Welcome';
import Inicio from './screens/Inicio';
import Servicios from './screens/Servicios';
import Detalle from './screens/Detalle';
import Booking from './screens/Booking';
import Summary from './screens/Summary';
import Success from './screens/Success';
import Promos from './screens/Promos';
import Club from './screens/Club';
import Perfil from './screens/Perfil';
import Notifs from './screens/Notifs';

const B = BELYSH as any;

export default function BelyshApp() {
  const insets = useSafeAreaInsets();
  const { session, loading, refreshProfile } = useAuth();
  const [tab, setTab] = useState('inicio');
  const [screen, setScreen] = useState<string | null>(null);
  const [sel, setSel] = useState<any>(null);
  const [st, setSt] = useState<any>({ stylist: null, day: null, time: null });
  const [submitting, setSubmitting] = useState(false);
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(() => { countUnread().then(setUnread).catch(() => {}); }, []);
  useEffect(() => { if (session) refreshUnread(); else setUnread(0); }, [session, refreshUnread]);

  const openNotifs = useCallback(() => { setScreen('notifs'); markNotifsSeen(); setUnread(0); }, []);
  const openService = useCallback((s: any) => { setSel(s); setScreen('detail'); }, []);
  const back = useCallback(() => {
    if (screen === 'summary') setScreen('booking');
    else if (screen === 'booking') setScreen('detail');
    else setScreen(null);
  }, [screen]);
  const goTab = useCallback((t: string) => { setScreen(null); setTab(t); }, []);
  const reset = useCallback(() => { setScreen(null); setSt({ stylist: null, day: null, time: null }); setTab('inicio'); }, []);

  // Confirma la reserva en Supabase (otorga puntos vía trigger), luego va a "éxito".
  const confirmBooking = useCallback(async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const stylist = B.STYLISTS.find((p: any) => p.id === st.stylist);
      await createAppointment({
        service_id: sel?.id,
        service_name: sel?.name,
        stylist_id: st.stylist,
        stylist_name: stylist?.name,
        price: sel?.price ?? 0,
        duration_min: sel?.min,
        day: st.day,
        time: st.time,
      });
      await refreshProfile();
      refreshUnread();
      setScreen('success');
    } catch (e: any) {
      Alert.alert('No se pudo reservar', traducir(e?.message));
    } finally {
      setSubmitting(false);
    }
  }, [submitting, st, sel, refreshProfile, refreshUnread]);

  if (loading) return <View style={{ flex: 1, backgroundColor: '#0A2A20' }} />;
  if (!session) return <View style={{ flex: 1, backgroundColor: '#0A2A20' }}><Welcome /></View>;

  let body: React.ReactNode;
  let showBack = false, hideTabs = false, lightTop = false;
  if (screen === 'detail') { body = <Detalle s={sel} onBook={() => setScreen('booking')} />; showBack = true; hideTabs = true; lightTop = true; }
  else if (screen === 'booking') { body = <Booking s={sel} st={st} setSt={setSt} onNext={() => setScreen('summary')} />; showBack = true; hideTabs = true; }
  else if (screen === 'summary') { body = <Summary s={sel} st={st} onConfirm={confirmBooking} submitting={submitting} />; showBack = true; hideTabs = true; }
  else if (screen === 'success') { body = <Success s={sel} st={st} onHome={reset} />; hideTabs = true; }
  else if (screen === 'notifs') { body = <Notifs />; showBack = true; hideTabs = true; }
  else if (tab === 'inicio') body = <Inicio openService={openService} go={goTab} />;
  else if (tab === 'servicios') body = <Servicios openService={openService} />;
  else if (tab === 'promos') body = <Promos go={goTab} openService={openService} />;
  else if (tab === 'club') body = <Club />;
  else body = <Perfil onReschedule={(svcName: string) => {
    const svc = B.SERVICES.find((x: any) => x.name === svcName) || B.SERVICES[0];
    setSel(svc); setSt({ stylist: null, day: null, time: null }); setScreen('booking');
  }} />;

  return (
    <AppBackground>
      {screen !== 'success' && (
        lightTop ? (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
            <TopBar back={showBack} onBack={back} light onBell={openNotifs} unread={unread > 0} topInset={insets.top} />
          </View>
        ) : (
          <View style={{ zIndex: 2 }}>
            <TopBar back={showBack} onBack={back} onBell={openNotifs} unread={unread > 0} topInset={insets.top} />
          </View>
        )
      )}
      <View style={{ flex: 1, minHeight: 0, zIndex: 1 }}>{body}</View>
      {!hideTabs && <TabBar tab={tab} go={goTab} bottomInset={insets.bottom} />}
    </AppBackground>
  );
}
