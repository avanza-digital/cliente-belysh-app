// MODO DEMO — permite enseñar la app sin backend.
//
// Con el modo demo activo, `api/supabase` no habla con Supabase: usa un backend
// falso en memoria (api/demoBackend) que persiste en el propio dispositivo. Sirve
// para demos comerciales y para seguir desarrollando la UI si el proyecto de
// Supabase no está disponible.
//
// Cómo apagarlo cuando el backend vuelva: poner DEFAULT_DEMO en false
// (o arrancar con EXPO_PUBLIC_DEMO_MODE=0, que manda sobre este valor).
const DEFAULT_DEMO = true;

const flag = process.env.EXPO_PUBLIC_DEMO_MODE;
const explicitOn = flag === '1' || flag === 'true';
const explicitOff = flag === '0' || flag === 'false';

// Salvaguarda: en un build compilado (release: TestFlight, tiendas) el modo demo
// NO se activa solo. Hay que pedirlo a propósito al compilar:
//   EXPO_PUBLIC_DEMO_MODE=1 npx expo run:ios --configuration Release
// Así se puede enseñar la app desde un teléfono real sin arriesgar que un build
// para tiendas salga con autenticación falsa por olvidar apagar la bandera.
// Con Metro (__DEV__) manda DEFAULT_DEMO, para no estorbar el día a día.
export const DEMO_MODE = explicitOff ? false
  : explicitOn ? true
  : __DEV__ && DEFAULT_DEMO;
