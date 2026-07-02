# Belysh — App móvil

App de reservas y fidelidad para **Belysh**, spa de belleza premium (cabello de mujer · Lima, Perú).
Stack: **Expo SDK 56** · React Native 0.85 · React 19 · expo-router · **Supabase** (auth + Postgres + RPC) · TypeScript strict.

## Arrancar

```bash
npm install
cp .env.example .env   # ajusta EXPO_PUBLIC_SUPABASE_* si separas entornos
npm start              # Expo (elige iOS / Android / web)
```

Usuaria demo: `demo@belysh.app` / `belysh123`.

## Estructura

```
src/app/                 rutas expo-router (entrada → BelyshApp)
src/belysh/
  BelyshApp.tsx          navegación + flujo de reserva/reagendado
  screens/               Welcome, Inicio, Servicios, Detalle, Booking, Summary,
                         Success, Promos, Club, Perfil, Notifs
  api/                   supabase, auth, appointments, club, notifications
  lib/                   date, money, club, errors (+ __tests__)
  ui.tsx, theme.ts       design system "Liquid Glow"
  data.ts                catálogo (servicios, estilistas, promos, club) — tipado
  types/db.ts            tipos generados de Supabase
```

## Backend (Supabase)

- Economía de puntos **blindada en el servidor**: triggers `award_points_on_appointment` /
  `clawback_points_on_cancel`, RPC `redeem_reward`, índice único de cupo. El cliente no puede falsificar puntos.
- Fechas reales en `starts_at timestamptz` (zona Lima); RPC `taken_times`, `full_days`, `reschedule_appointment`.
- Regenerar tipos tras cambios de esquema: `supabase gen types` (o el MCP).

## Calidad

```bash
npm run lint     # ESLint (config Expo)
npm test         # Jest (jest-expo) — lógica de lib/
npx tsc --noEmit # typecheck (incluye tests)
```

CI (`.github/workflows/ci.yml`) corre tsc + jest + lint en cada push.

## Pendientes que requieren cuentas/assets

Ver [`../app-docs/PENDIENTES.md`](../app-docs/PENDIENTES.md): ícono de marca iOS, DSN de Sentry, credenciales Google OAuth,
y activar *leaked password protection* en Supabase Auth.
