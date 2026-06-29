// Belysh · "Liquid Glow" design tokens — RN port of the prototype's T / G / TONE
// NOTE: token names ("rose", "roseDeep", "emerald") are kept 1:1 from the prototype
// for fidelity even though the palette is emerald + gold (no actual pink).

export const T = {
  bg: '#F6F3EB',
  card: '#FCFBF6',
  soft: '#EEEADE',
  ink: '#16271F',
  body: '#4B544C',
  muted: '#6E685B',
  line: '#E7E1D2',
  rose: '#0E5E47', // deep emerald (primary accent)
  roseDeep: '#0A4632', // darkest emerald
  roseSoft: '#DBE5DD',
  blush: '#F0ECDF',
  emerald: '#A9885A', // gold (yes — named "emerald" in the prototype)
} as const;

// Tonos para placeholders de foto (gradiente a/b)
export const TONE: Record<string, [string, string]> = {
  emerald: ['#2C8266', '#1B6E54'],
  rose: ['#E7C0AE', '#C68A6F'],
  sand: ['#EBD9C9', '#D2B89F'],
};

// Glass / chrome tokens, reshaped for React Native.
//  - cardBg/chipBg: el color (semi-opaco) que va detrás del BlurView
//  - border: hairline champagne (el "tell" de lujo)
//  - grad/goldColors: para <LinearGradient>
export const G = {
  cardBg: 'rgba(252,251,246,0.88)',
  chipBg: 'rgba(252,251,246,0.94)',
  tabBg: 'rgba(250,250,246,0.5)',
  border: 'rgba(150,128,92,0.18)',
  borderLight: 'rgba(255,255,255,0.6)',
  hair: 'rgba(22,39,31,0.06)',
  blurIntensity: 18,
  chipBlurIntensity: 28,
  gold: '#B5904F',
  // deep jewel emerald — usado en botones, chips activos, avatares
  grad: {
    colors: ['#0B5440', '#1E7E62'] as [string, string],
    start: { x: 0.1, y: 0 },
    end: { x: 0.9, y: 1 },
  },
  goldColors: ['#DCC084', '#B5904F'] as [string, string],
} as const;

// La tarjeta esmeralda metálica (Club / teaser / giftcard)
export const EMERALD_CARD = {
  colors: ['#0B2E22', '#0F4C39', '#0A3B2C', '#06231A'] as [string, string, string, string],
  locations: [0, 0.42, 0.7, 1] as [number, number, number, number],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

// ── Fuentes ──────────────────────────────────────────────
// En RN cada peso/estilo es una familia distinta (no hay síntesis de bold).
// Los nombres de familia se registran en useFonts (_layout.tsx).
// Helpers: el prototipo usa `fontFamily: T.serif, fontWeight: 600, fontStyle:'italic'`.
// En RN se traduce a una sola familia. Usar SIEMPRE estos helpers en las pantallas.
export function serif(weight: number = 600, italic: boolean = false): string {
  if (italic) return weight >= 600 ? 'Cormorant-SemiBoldItalic' : 'Cormorant-MediumItalic';
  if (weight >= 700) return 'Cormorant-Bold';
  if (weight >= 600) return 'Cormorant-SemiBold';
  return 'Cormorant-Medium';
}
export function sans(weight: number = 600): string {
  if (weight >= 800) return 'Mulish-ExtraBold';
  if (weight >= 700) return 'Mulish-Bold';
  if (weight >= 600) return 'Mulish-SemiBold';
  if (weight >= 500) return 'Mulish-Medium';
  return 'Mulish-Regular';
}

export const RADII = { card: 22, chip: 999, tile: 18 };
