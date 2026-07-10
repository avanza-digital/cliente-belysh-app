import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Alert, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground, TopBar, TabBar } from './ui';
import { BELYSH, BookingState } from './data';
import { PageCarousel, PageDirection } from './motion';
import { useAuth } from './api/auth';
import { createAppointment, reschedule } from './api/appointments';
import { Appointment } from './types/db';
import { countUnread, markNotifsSeen } from './api/notifications';
import { scheduleReminder } from './lib/reminders';
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

const B = BELYSH;
const EMPTY_ST: BookingState = { stylist: null, date: null, time: null, rescheduleId: null };
const TAB_ORDER = ['inicio', 'servicios', 'promos', 'club', 'perfil'];

export default function BelyshApp() {
  const insets = useSafeAreaInsets();
  const { session, loading, refreshProfile } = useAuth();
  const [tab, setTab] = useState('inicio');
  const [screen, setScreen] = useState<string | null>(null);
  const [sel, setSel] = useState<any>(null); // servicio seleccionado (any: fluye a props tipadas s: Service)
  const [st, setSt] = useState<BookingState>(EMPTY_ST);
  const [lastAppt, setLastAppt] = useState<Appointment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [unread, setUnread] = useState(0);
  const navigationLocked = useRef(false);

  const refreshUnread = useCallback(() => { countUnread().then(setUnread).catch(() => {}); }, []);
  // Al cerrar sesión esta pantalla deja de renderizarse; la siguiente sesión
  // vuelve a consultar el contador, así que no hace falta un setState síncrono.
  useEffect(() => { if (session) refreshUnread(); }, [session, refreshUnread]);

  const [navDir, setNavDir] = useState<PageDirection>('forward');
  const push = useCallback((s: string) => {
    if (navigationLocked.current) return;
    navigationLocked.current = true;
    setNavDir('forward');
    setScreen(s);
  }, []);
  const finishNavigation = useCallback(() => { navigationLocked.current = false; }, []);

  const openNotifs = useCallback(() => {
    if (navigationLocked.current) return;
    push('notifs');
    markNotifsSeen();
    setUnread(0);
  }, [push]);
  // Abrir un servicio limpia el estado de reserva (no arrastra estilista/día/hora de una reserva abandonada).
  const openService = useCallback((s: any) => {
    if (navigationLocked.current) return;
    setSel(s);
    setSt(EMPTY_ST);
    push('detail');
  }, [push]);
  const back = useCallback(() => {
    if (navigationLocked.current) return;
    navigationLocked.current = true;
    setNavDir('backward');
    if (screen === 'summary') setScreen('booking');
    else if (screen === 'booking') setScreen('detail');
    else setScreen(null);
  }, [screen]);
  const goTab = useCallback((t: string) => {
    if (navigationLocked.current || (!screen && t === tab)) return;
    navigationLocked.current = true;
    const from = TAB_ORDER.indexOf(tab);
    const to = TAB_ORDER.indexOf(t);
    setNavDir(to < from ? 'backward' : 'forward');
    setScreen(null);
    setTab(t);
  }, [screen, tab]);
  const reset = useCallback(() => {
    if (navigationLocked.current) return;
    navigationLocked.current = true;
    setNavDir('backward');
    setScreen(null);
    setSt(EMPTY_ST);
    setTab('inicio');
  }, []);

  // Botón atrás de hardware (Android): retrocede dentro del flujo en vez de cerrar la app.
  useEffect(() => {
    const onBack = () => {
      if (screen) { back(); return true; }
      if (tab !== 'inicio') { goTab('inicio'); return true; }
      return false; // en inicio sin sub-pantalla: dejar que el SO cierre la app
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [screen, tab, back, goTab]);

  // Confirma la reserva (o el reagendado) en Supabase, luego va a "éxito".
  const confirmBooking = useCallback(async () => {
    if (submitting) return;
    if (!st.date || !st.time || !st.stylist) return; // guard: el flujo no debería llegar aquí sin estos
    try {
      setSubmitting(true);
      const stylist = B.STYLISTS.find((p) => p.id === st.stylist);
      let appt;
      if (st.rescheduleId) {
        // Reagendado: mueve la MISMA cita (no duplica, no toca puntos).
        appt = await reschedule({
          id: st.rescheduleId, date: st.date, time: st.time,
          stylistId: st.stylist, stylistName: stylist?.name ?? '',
        });
      } else {
        appt = await createAppointment({
          service_id: sel?.id, service_name: sel?.name,
          stylist_id: st.stylist, stylist_name: stylist?.name,
          price: sel?.price ?? 0, duration_min: sel?.min,
          date: st.date, time: st.time,
        });
      }
      setLastAppt(appt);
      scheduleReminder(appt); // recordatorio local 24 h antes (best-effort, no bloquea)
      await refreshProfile();
      refreshUnread();
      push('success');
    } catch (e: any) {
      Alert.alert(st.rescheduleId ? 'No se pudo reagendar' : 'No se pudo reservar', traducir(e?.message));
    } finally {
      setSubmitting(false);
    }
  }, [submitting, st, sel, refreshProfile, refreshUnread, push]);

  if (loading) return <View style={{ flex: 1, backgroundColor: '#0A2A20' }} />;
  if (!session) return <View style={{ flex: 1, backgroundColor: '#0A2A20' }}><Welcome /></View>;

  let body: React.ReactNode;
  let showBack = false, hideTabs = false, lightTop = false;
  if (screen === 'detail') { body = <Detalle s={sel} onBook={() => push('booking')} />; showBack = true; hideTabs = true; lightTop = true; }
  else if (screen === 'booking') { body = <Booking s={sel} st={st} setSt={setSt} onNext={() => push('summary')} />; showBack = true; hideTabs = true; }
  else if (screen === 'summary') { body = <Summary s={sel} st={st} onConfirm={confirmBooking} submitting={submitting} />; showBack = true; hideTabs = true; }
  else if (screen === 'success') { body = <Success s={sel} st={st} appt={lastAppt} onHome={reset} />; hideTabs = true; }
  else if (screen === 'notifs') { body = <Notifs />; showBack = true; hideTabs = true; }
  else if (tab === 'inicio') body = <Inicio openService={openService} go={goTab} />;
  else if (tab === 'servicios') body = <Servicios openService={openService} />;
  else if (tab === 'promos') body = <Promos go={goTab} openService={openService} />;
  else if (tab === 'club') body = <Club />;
  else body = <Perfil
    onReschedule={(a) => {
      const svc = B.SERVICES.find((x) => x.id === a.service_id) || B.SERVICES.find((x) => x.name === a.service_name);
      if (!svc) { Alert.alert('No disponible', 'Este servicio ya no está en el catálogo. Reserva uno nuevo.'); return; }
      setSel(svc);
      setSt({ stylist: a.stylist_id ?? null, date: null, time: null, rescheduleId: a.id });
      push('booking');
    }}
    onRebook={(a) => {
      // "Reservar de nuevo": cita NUEVA con el mismo servicio/estilista (no mueve la anterior).
      const svc = B.SERVICES.find((x) => x.id === a.service_id) || B.SERVICES.find((x) => x.name === a.service_name);
      if (!svc) { Alert.alert('No disponible', 'Este servicio ya no está en el catálogo. Reserva uno nuevo.'); return; }
      setSel(svc);
      setSt({ stylist: a.stylist_id ?? null, date: null, time: null, rescheduleId: null });
      push('booking');
    }}
  />;

  // El encabezado pertenece a cada página del carrusel. Así una pantalla con
  // logo y otra con botón de regreso viajan juntas, sin que el contenido salte
  // al cambiar entre un header en flujo y uno superpuesto sobre el hero.
  const page = (
    <View style={{ flex: 1, minHeight: 0 }}>
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
    </View>
  );

  return (
    <AppBackground>
      <View style={{ flex: 1, minHeight: 0, zIndex: 1 }}>
        <PageCarousel sceneKey={screen ?? `tab:${tab}`} direction={navDir} onTransitionEnd={finishNavigation}>
          {page}
        </PageCarousel>
      </View>
      {!hideTabs && <TabBar tab={tab} go={goTab} bottomInset={insets.bottom} />}
    </AppBackground>
  );
}
