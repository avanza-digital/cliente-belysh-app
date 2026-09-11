// Backend falso en memoria para el MODO DEMO (ver api/demoFlag).
//
// Imita la parte de la API de supabase-js que usa la app (auth, from().select/update
// y los RPC) para que las pantallas funcionen sin red y sin cambiar una sola línea
// de las pantallas ni de los módulos de api/. El estado vive en AsyncStorage, así
// que una reserva hecha en la demo sigue ahí al reabrir la app.
//
// Reglas que imita del servidor real: el precio, la duración y los nombres los
// deriva "el servidor" (aquí, del catálogo local) y nunca se confían al cliente.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BELYSH } from '../data';
import { limaISO, ymd } from '../lib/date';
import type { Appointment, PointTransaction, Profile } from '../types/db';

const STORE_KEY = 'belysh:demo_state_v1';

type DemoUser = { id: string; email?: string; is_anonymous: boolean; user_metadata: Record<string, any> };
type DemoSession = { access_token: string; token_type: 'bearer'; user: DemoUser };

type DemoState = {
  session: DemoSession | null;
  profiles: Record<string, Profile>;
  appointments: Appointment[];
  transactions: PointTransaction[];
  seeded: Record<string, boolean>;
  // correo (en minúsculas) → id de usuario, para que volver a entrar con el mismo
  // correo recupere LA MISMA cuenta (con sus citas y puntos) y no cree otra.
  usersByEmail: Record<string, DemoUser>;
};

const emptyState = (): DemoState => ({
  session: null, profiles: {}, appointments: [], transactions: [], seeded: {}, usersByEmail: {},
});

let state: DemoState = emptyState();
let hydrated: Promise<void> | null = null;

function hydrate(): Promise<void> {
  if (!hydrated) {
    hydrated = AsyncStorage.getItem(STORE_KEY)
      .then((raw) => { if (raw) state = { ...emptyState(), ...JSON.parse(raw) }; })
      .catch(() => {});
  }
  return hydrated;
}

function persist() {
  AsyncStorage.setItem(STORE_KEY, JSON.stringify(state)).catch(() => {});
}

const uid = () => 'demo-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const nowISO = () => new Date().toISOString();
// 'YYYY-MM-DD', la forma que tiene member_since en el esquema real.
const dayOf = (d: Date) => ymd(d.getFullYear(), d.getMonth() + 1, d.getDate());

// ── Errores con la forma que espera lib/errors.traducir ──────────────────────
const err = (message: string) => ({ data: null, error: { message, code: message } });
// supabase-js devuelve user/session nulos junto al error en las llamadas de auth.
const authErr = (message: string) =>
  ({ data: { user: null, session: null }, error: { message, code: message } });

// ── Auth ────────────────────────────────────────────────────────────────────
type AuthListener = (event: string, session: DemoSession | null) => void;
const listeners = new Set<AuthListener>();

function emit(event: string) {
  listeners.forEach((cb) => { try { cb(event, state.session); } catch {} });
}

function makeUser(opts: { email?: string; anonymous: boolean; fullName?: string }): DemoUser {
  return {
    id: uid(),
    email: opts.email,
    is_anonymous: opts.anonymous,
    user_metadata: opts.fullName ? { full_name: opts.fullName } : {},
  };
}

function profileFor(user: DemoUser): Profile {
  return {
    id: user.id,
    full_name: user.user_metadata.full_name ?? null,
    club_points: 0,
    created_at: nowISO(),
    member_since: dayOf(new Date()),
    birthdate: null,
    phone: null,
    role: 'client',
  };
}

// Devuelve la cuenta ya existente para ese correo, o crea una nueva.
function userForEmail(email: string, fullName?: string): DemoUser {
  const key = email.trim().toLowerCase();
  const existing = state.usersByEmail[key];
  if (existing) {
    if (fullName) existing.user_metadata = { ...existing.user_metadata, full_name: fullName };
    return existing;
  }
  const user = makeUser({ email: key, anonymous: false, fullName });
  state.usersByEmail[key] = user;
  return user;
}

function startSession(user: DemoUser, seedHistory: boolean) {
  state.session = { access_token: 'demo-token', token_type: 'bearer', user };
  if (!state.profiles[user.id]) state.profiles[user.id] = profileFor(user);
  else if (user.user_metadata.full_name) state.profiles[user.id].full_name = user.user_metadata.full_name;
  if (seedHistory && !state.seeded[user.id]) { seed(user.id); state.seeded[user.id] = true; }
  persist();
  emit('SIGNED_IN');
}

// Historial de ejemplo para una cuenta con correo: sin esto el Inicio y el Club
// se ven vacíos en una demo. La invitada arranca limpia a propósito, para poder
// enseñar la diferencia entre explorar como invitada y tener cuenta.
function seed(userId: string) {
  const visits: { daysAgo: number; service: string; stylist: string; time: string }[] = [
    { daysAgo: 22,  service: 'balayage',    stylist: 'valentina', time: '11:30' },
    { daysAgo: 51,  service: 'corte',       stylist: 'camila',    time: '16:30' },
    { daysAgo: 84,  service: 'keratina',    stylist: 'daniela',   time: '10:30' },
    { daysAgo: 120, service: 'brushing',    stylist: 'sofia',     time: '13:00' },
    { daysAgo: 163, service: 'color',       stylist: 'valentina', time: '15:00' },
    { daysAgo: 205, service: 'extensiones', stylist: 'valentina', time: '9:30' },
    { daysAgo: 236, service: 'balayage',    stylist: 'valentina', time: '11:30' },
    { daysAgo: 268, service: 'keratina',    stylist: 'daniela',   time: '15:00' },
    { daysAgo: 291, service: 'evento',      stylist: 'sofia',     time: '16:30' },
    { daysAgo: 318, service: 'extensiones', stylist: 'camila',    time: '10:30' },
    { daysAgo: 344, service: 'color',       stylist: 'valentina', time: '13:00' },
  ];
  visits.forEach((v) => {
    const when = new Date(Date.now() - v.daysAgo * 86400000);
    const day = ymd(when.getFullYear(), when.getMonth() + 1, when.getDate());
    const appt = buildAppointment(userId, { serviceId: v.service, stylistId: v.stylist, day, time: v.time });
    appt.status = 'completada';
    appt.created_at = new Date(when.getTime() - 3 * 86400000).toISOString();
    state.appointments.push(appt);
    state.transactions.push(earnFor(userId, appt));
  });
  const prof = state.profiles[userId];
  if (prof) prof.member_since = dayOf(new Date(Date.now() - visits[visits.length - 1].daysAgo * 86400000));
  if (prof) prof.club_points = state.transactions
    .filter((t) => t.user_id === userId)
    .reduce((n, t) => n + (t.kind === 'earn' ? t.points : -t.points), 0);
}

const auth = {
  async getSession() { await hydrate(); return { data: { session: state.session }, error: null }; },
  async getUser() { await hydrate(); return { data: { user: state.session?.user ?? null }, error: null }; },

  onAuthStateChange(cb: AuthListener) {
    listeners.add(cb);
    return { data: { subscription: { unsubscribe: () => { listeners.delete(cb); } } } };
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    await hydrate();
    if (!email.includes('@')) return authErr('email inválido');
    if ((password || '').length < 6) return authErr('password muy corta');
    const user = userForEmail(email);
    startSession(user, true);
    return { data: { user, session: state.session }, error: null };
  },

  async signUp({ email, password, options }: { email: string; password: string; options?: { data?: any } }) {
    await hydrate();
    if (!email.includes('@')) return authErr('email inválido');
    if ((password || '').length < 6) return authErr('password muy corta');
    const user = userForEmail(email, options?.data?.full_name);
    startSession(user, true);
    return { data: { user, session: state.session }, error: null };
  },

  async signInAnonymously() {
    await hydrate();
    const user = makeUser({ anonymous: true });
    // la invitada no tiene correo: su identidad vive solo en la sesión
    startSession(user, false);
    return { data: { user, session: state.session }, error: null };
  },

  // Conversión invitada → cuenta: conserva id, citas y puntos (como el servidor real).
  async updateUser({ email, password, data }: { email?: string; password?: string; data?: any }) {
    await hydrate();
    const user = state.session?.user;
    if (!user) return authErr('not authenticated');
    if (email && !email.includes('@')) return authErr('email inválido');
    if (password !== undefined && password.length < 6) return authErr('password muy corta');
    if (email) {
      const key = email.trim().toLowerCase();
      user.email = key;
      user.is_anonymous = false;
      // conserva id, citas y puntos: volver a entrar con ese correo cae en esta misma cuenta
      state.usersByEmail[key] = user;
    }
    if (data?.full_name) user.user_metadata = { ...user.user_metadata, full_name: data.full_name };
    persist();
    emit('USER_UPDATED');
    return { data: { user }, error: null };
  },

  async resetPasswordForEmail(_email: string, _opts?: any) { return { data: {}, error: null }; },

  async signInWithOAuth() { return err('Google no está disponible en el modo demo.'); },
  async exchangeCodeForSession() { return err('Google no está disponible en el modo demo.'); },

  async signOut() {
    await hydrate();
    state.session = null;
    persist();
    emit('SIGNED_OUT');
    return { error: null };
  },

  startAutoRefresh() {},
  stopAutoRefresh() {},
};

// ── Catálogo (hace de "tablas del servidor") ────────────────────────────────
const serviceById = (id: string) => BELYSH.SERVICES.find((s) => s.id === id);
const promoById = (id: string) => BELYSH.PROMOS.find((p) => p.id === id);
const stylistById = (id: string) => BELYSH.STYLISTS.find((s) => s.id === id);

function buildAppointment(
  userId: string,
  input: { serviceId: string; stylistId: string; day: string; time: string; promoId?: string | null },
): Appointment {
  const svc = serviceById(input.serviceId);
  const stylist = stylistById(input.stylistId);
  const promo = input.promoId ? promoById(input.promoId) : null;
  return {
    id: uid(),
    user_id: userId,
    service_id: input.serviceId,
    service_name: promo?.title ?? svc?.name ?? 'Servicio',
    stylist_id: input.stylistId,
    stylist_name: stylist?.name ?? null,
    promo_id: input.promoId ?? null,
    price: promo?.now ?? svc?.price ?? 0,
    duration_min: svc?.min ?? null,
    starts_at: limaISO(input.day, input.time),
    appt_date: input.day,
    appt_time: input.time,
    status: 'confirmada',
    created_at: nowISO(),
  } as Appointment;
}

// 1 punto por cada S/ 10 de consumo, como premio por reservar.
function earnFor(userId: string, appt: Appointment): PointTransaction {
  return {
    id: uid(),
    user_id: userId,
    kind: 'earn',
    points: Math.max(1, Math.round(appt.price / 10)),
    note: appt.service_name,
    ref_id: appt.id,
    ref_type: 'appointment',
    created_at: appt.created_at,
  } as PointTransaction;
}

function balance(userId: string): number {
  return state.transactions
    .filter((t) => t.user_id === userId)
    .reduce((n, t) => n + (t.kind === 'earn' ? t.points : -t.points), 0);
}

function syncPoints(userId: string) {
  const prof = state.profiles[userId];
  if (prof) prof.club_points = balance(userId);
}

// Cupos ocupados "por otras clientas": deterministas a partir del día y la
// estilista, para que el calendario de la demo no se vea siempre vacío.
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function syntheticTaken(day: string, stylistId: string): string[] {
  const h = hash(day + '|' + stylistId);
  if (h % 13 === 0) return [...BELYSH.TIMES]; // algún día completamente lleno
  const count = h % 3; // 0, 1 o 2 cupos ocupados
  const taken: string[] = [];
  for (let i = 0; i < count; i++) taken.push(BELYSH.TIMES[(h >> (i * 3)) % BELYSH.TIMES.length]);
  return [...new Set(taken)];
}

// 'YYYY-MM-DDTHH:MM:...' → { day, time 'H:MM' }. null si no tiene esa forma o
// la fecha no es real: el falso debe rechazar entradas basura como el servidor.
function parseStartsAt(raw: unknown): { day: string; time: string } | null {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/.exec(String(raw ?? ''));
  if (!m) return null;
  if (Number.isNaN(new Date(String(raw)).getTime())) return null;
  return { day: m[1], time: `${Number(m[2])}:${m[3]}` };
}

// ── RPC ─────────────────────────────────────────────────────────────────────
async function rpc(name: string, args: any = {}) {
  await hydrate();
  const user = state.session?.user;
  if (!user) return err('not authenticated');
  const userId = user.id;

  switch (name) {
    case 'create_appointment': {
      const svc = serviceById(args.p_service_id);
      if (!svc) return err('service_not_found');
      if (!stylistById(args.p_stylist_id)) return err('stylist_not_found');
      const parsed = parseStartsAt(args.p_starts_at);
      if (!parsed) return err('invalid_slot');
      const { day, time } = parsed;
      if (new Date(args.p_starts_at).getTime() < Date.now()) return err('past_slot');
      const clash = state.appointments.some(
        (a) => a.status !== 'cancelada' && a.stylist_id === args.p_stylist_id && a.starts_at === args.p_starts_at,
      );
      if (clash || syntheticTaken(day, args.p_stylist_id).includes(time)) return err('slot_taken');

      const appt = buildAppointment(userId, {
        serviceId: args.p_service_id, stylistId: args.p_stylist_id, day, time, promoId: args.p_promo_id ?? null,
      });
      state.appointments.push(appt);
      state.transactions.push(earnFor(userId, appt));
      syncPoints(userId);
      persist();
      return { data: appt, error: null };
    }

    case 'reschedule_appointment': {
      const appt = state.appointments.find((a) => a.id === args.p_appointment_id && a.user_id === userId);
      if (!appt) return err('appointment_not_found');
      if (appt.status === 'cancelada') return err('already_cancelled');
      if (!stylistById(args.p_stylist_id)) return err('stylist_not_found');
      const parsed = parseStartsAt(args.p_starts_at);
      if (!parsed) return err('invalid_slot');
      const { day, time } = parsed;
      if (new Date(args.p_starts_at).getTime() < Date.now()) return err('past_slot');
      const clash = state.appointments.some(
        (a) => a.id !== appt.id && a.status !== 'cancelada'
          && a.stylist_id === args.p_stylist_id && a.starts_at === args.p_starts_at,
      );
      if (clash || syntheticTaken(day, args.p_stylist_id).includes(time)) return err('slot_taken');
      appt.starts_at = args.p_starts_at;
      appt.appt_date = day;
      appt.appt_time = time;
      appt.stylist_id = args.p_stylist_id;
      appt.stylist_name = stylistById(args.p_stylist_id)?.name ?? null;
      persist();
      return { data: appt, error: null };
    }

    case 'taken_times': {
      const mine = state.appointments
        .filter((a) => a.status !== 'cancelada' && a.appt_date === args.p_appt_date && a.stylist_id === args.p_stylist)
        .map((a) => a.appt_time as string);
      return { data: [...new Set([...mine, ...syntheticTaken(args.p_appt_date, args.p_stylist)])], error: null };
    }

    case 'full_days': {
      const days: string[] = [];
      const from = new Date(args.p_from + 'T12:00:00Z');
      const to = new Date(args.p_to + 'T12:00:00Z');
      for (let d = new Date(from); d <= to; d.setUTCDate(d.getUTCDate() + 1)) {
        const day = ymd(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
        const taken = new Set([
          ...syntheticTaken(day, args.p_stylist),
          ...state.appointments
            .filter((a) => a.status !== 'cancelada' && a.appt_date === day && a.stylist_id === args.p_stylist)
            .map((a) => a.appt_time as string),
        ]);
        if (BELYSH.TIMES.every((t) => taken.has(t))) days.push(day);
      }
      return { data: days, error: null };
    }

    case 'redeem_reward': {
      const reward = BELYSH.CLUB.rewards.find((r) => r.id === args.p_reward_id);
      if (!reward) return err('reward_not_found');
      if (balance(userId) < reward.cost) return err('insufficient points');
      state.transactions.push({
        id: uid(), user_id: userId, kind: 'redeem', points: reward.cost, note: reward.title,
        ref_id: reward.id, ref_type: 'reward', created_at: nowISO(),
      } as PointTransaction);
      syncPoints(userId);
      persist();
      return { data: balance(userId), error: null };
    }

    case 'client_spend_12m': {
      const cutoff = Date.now() - 365 * 86400000;
      const total = state.appointments
        .filter((a) => a.user_id === (args.p_user ?? userId) && a.status === 'completada')
        .filter((a) => new Date(a.starts_at ?? a.created_at).getTime() >= cutoff)
        .reduce((n, a) => n + a.price, 0);
      return { data: total, error: null };
    }

    case 'delete_account': {
      state.appointments = state.appointments.filter((a) => a.user_id !== userId);
      state.transactions = state.transactions.filter((t) => t.user_id !== userId);
      delete state.profiles[userId];
      delete state.seeded[userId];
      state.session = null;
      persist();
      emit('SIGNED_OUT');
      return { data: null, error: null };
    }

    default:
      return err('rpc "' + name + '" no existe en el modo demo');
  }
}

// ── from(): mini constructor de consultas ───────────────────────────────────
type Row = Record<string, any>;

function rowsOf(table: string): Row[] {
  const me = state.session?.user?.id;
  switch (table) {
    // La RLS real solo deja ver lo propio: aquí se imita filtrando por usuario.
    case 'profiles': return me && state.profiles[me] ? [state.profiles[me]] : [];
    case 'appointments': return state.appointments.filter((a) => a.user_id === me);
    case 'point_transactions': return state.transactions.filter((t) => t.user_id === me);
    default: return [];
  }
}

function compare(a: Row, b: Row, keys: { col: string; asc: boolean }[]): number {
  for (const k of keys) {
    const av = a[k.col], bv = b[k.col];
    if (av === bv) continue;
    if (av == null) return 1;
    if (bv == null) return -1;
    return (av < bv ? -1 : 1) * (k.asc ? 1 : -1);
  }
  return 0;
}

function query(table: string, patch?: Row) {
  const filters: ((r: Row) => boolean)[] = [];
  const order: { col: string; asc: boolean }[] = [];
  let single = false;

  const run = async () => {
    await hydrate();
    let rows = rowsOf(table).filter((r) => filters.every((f) => f(r)));
    if (patch) {
      rows.forEach((r) => Object.assign(r, patch));
      if (table === 'appointments') {
        // Cancelar devuelve los puntos ganados por esa cita (clawback del servidor real).
        rows.filter((r) => r.status === 'cancelada').forEach((r) => {
          const already = state.transactions.some((t) => t.ref_id === r.id && t.ref_type === 'appointment_reversal');
          const earn = state.transactions.find((t) => t.ref_id === r.id && t.kind === 'earn');
          // Se devuelve como mucho el saldo que queda: si ya canjeó esos puntos,
          // el club no se queda en negativo (el saldo siempre = suma de movimientos).
          const back = earn ? Math.min(earn.points, balance(r.user_id)) : 0;
          if (!already && back > 0) {
            state.transactions.push({
              id: uid(), user_id: r.user_id, kind: 'redeem', points: back,
              note: r.service_name, ref_id: r.id, ref_type: 'appointment_reversal', created_at: nowISO(),
            } as PointTransaction);
          }
        });
      }
      if (state.session?.user?.id) syncPoints(state.session.user.id);
      persist();
      return { data: null, error: null };
    }
    if (order.length) rows = [...rows].sort((a, b) => compare(a, b, order));
    return single ? { data: rows[0] ?? null, error: null } : { data: rows, error: null };
  };

  const q: any = {
    select: () => q,
    eq: (col: string, val: any) => { filters.push((r) => r[col] === val); return q; },
    neq: (col: string, val: any) => { filters.push((r) => r[col] !== val); return q; },
    order: (col: string, opts?: { ascending?: boolean }) => { order.push({ col, asc: opts?.ascending !== false }); return q; },
    limit: () => q,
    maybeSingle: () => { single = true; return q; },
    single: () => { single = true; return q; },
    then: (resolve: any, reject: any) => run().then(resolve, reject),
  };
  return q;
}

export const demoSupabase: any = {
  auth,
  rpc,
  from: (table: string) => ({
    select: () => query(table),
    update: (patch: Row) => query(table, patch),
    insert: () => query(table, {}),
    delete: () => query(table, {}),
  }),
};
