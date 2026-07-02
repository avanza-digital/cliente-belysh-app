// RN necesita require() estático para imágenes. El prototipo referencia las
// imágenes por string ('assets/hair-1.png'); RES() traduce string → módulo.
import type { ImageSourcePropType } from 'react-native';

// Las claves conservan '.png' (las referencia data.ts); las fotos ahora son JPEG (mucho más livianas).
export const IMAGES: Record<string, ImageSourcePropType> = {
  'assets/hair-1.png': require('../assets/belysh/hair-1.jpg'),
  'assets/hair-2.png': require('../assets/belysh/hair-2.jpg'),
  'assets/hair-3.png': require('../assets/belysh/hair-3.jpg'),
  'assets/belysh-logo.png': require('../assets/belysh/belysh-logo.png'),
  'assets/belysh-mark-gold.png': require('../assets/belysh/belysh-mark-gold.png'),
  'assets/belysh-wordmark-gold.png': require('../assets/belysh/belysh-wordmark-gold.png'),
};

export const RES = (p?: string): ImageSourcePropType | undefined =>
  p ? IMAGES[p] ?? undefined : undefined;
