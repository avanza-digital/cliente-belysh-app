// Belysh — datos compartidos entre las dos direcciones visuales
// Spa de belleza · enfoque cabello de mujer · segmento premium

const SERVICES = [
  { id: 'corte', name: 'Corte & Estilo Signature', cat: 'Corte', min: 75, price: 90, popular: true,
    desc: 'Diagnóstico personalizado, corte a medida y peinado final con acabado de pasarela.',
    tone: 'emerald', tag: 'corte', img: 'assets/hair-2.png', pos: 'center 30%' },
  { id: 'brushing', name: 'Brushing de Lujo', cat: 'Peinado', min: 60, price: 55, popular: false,
    desc: 'Lavado ritual, masaje capilar relajante y brushing con acabado espejo.',
    tone: 'rose', tag: 'brushing', img: 'assets/hair-1.png', pos: 'center 20%' },
  { id: 'color', name: 'Color Completo', cat: 'Color', min: 150, price: 150, popular: false,
    desc: 'Coloración uniforme de raíz a puntas con tinte premium sin amoníaco.',
    tone: 'sand', tag: 'color', img: 'assets/hair-1.png', pos: 'center 42%' },
  { id: 'balayage', name: 'Balayage & Iluminación', cat: 'Color', min: 180, price: 240, popular: true,
    desc: 'Mechas pintadas a mano alzada para un degradado natural, luminoso y de bajo mantenimiento.',
    tone: 'rose', tag: 'balayage', img: 'assets/hair-3.png', pos: 'center 28%' },
  { id: 'keratina', name: 'Keratina Brasileña', cat: 'Tratamiento', min: 120, price: 190, popular: true,
    desc: 'Alisado y nutrición profunda. Frizz bajo control y brillo intenso hasta por 4 meses.',
    tone: 'emerald', tag: 'keratina', img: 'assets/hair-1.png', pos: 'center 32%' },
  { id: 'botox', name: 'Botox Capilar', cat: 'Tratamiento', min: 90, price: 120, popular: false,
    desc: 'Reconstrucción intensa para cabello dañado, poroso o sin vida.',
    tone: 'sand', tag: 'tratamiento', img: 'assets/hair-2.png', pos: 'center 44%' },
  { id: 'evento', name: 'Peinado de Evento', cat: 'Peinado', min: 75, price: 95, popular: false,
    desc: 'Recogidos, ondas y semirecogidos para bodas y ocasiones especiales.',
    tone: 'rose', tag: 'evento', img: 'assets/hair-2.png', pos: 'center 18%' },
  { id: 'extensiones', name: 'Extensiones Premium', cat: 'Extensión', min: 180, price: 360, popular: false,
    desc: 'Cabello 100% natural aplicado por mechones para un look largo y sin costuras.',
    tone: 'emerald', tag: 'extensiones', img: 'assets/hair-3.png', pos: 'center 46%' },
];

const CATEGORIES = ['Todo', 'Corte', 'Color', 'Tratamiento', 'Peinado', 'Extensión'];

const STYLISTS = [
  { id: 'valentina', name: 'Valentina R.', role: 'Especialista en color', initials: 'VR', rating: 4.9 },
  { id: 'camila',    name: 'Camila S.',    role: 'Directora de estilo',   initials: 'CS', rating: 5.0 },
  { id: 'daniela',   name: 'Daniela M.',   role: 'Experta en tratamientos', initials: 'DM', rating: 4.8 },
  { id: 'sofia',     name: 'Sofía L.',     role: 'Peinados & eventos',     initials: 'SL', rating: 4.9 },
];

const TIMES = ['9:30', '10:30', '11:30', '13:00', '15:00', '16:30', '18:00'];

const PROMOS = [
  { id: 'p1', title: 'Color + Tratamiento', kind: 'Paquete', desc: 'Color completo + botox capilar en una sola visita.',
    now: 290, was: 340, badge: '−15%', tone: 'emerald', img: 'assets/hair-3.png' },
  { id: 'p2', title: 'Glow de Novia', kind: 'Paquete', desc: 'Prueba de peinado + maquillaje + el día del evento.',
    now: 380, was: 450, badge: 'Exclusivo', tone: 'rose', img: 'assets/hair-2.png' },
  { id: 'p3', title: 'Martes de Brushing', kind: 'Descuento', desc: 'Brushing de lujo 2×1 todos los martes.',
    now: 55, was: 110, badge: '2×1', tone: 'sand', img: 'assets/hair-1.png' },
];

const REVIEWS = [
  { id: 'r1', name: 'Mariana G.', stars: 5, service: 'Balayage', text: 'Salí enamorada de mi color. Valentina es una artista, el lugar impecable.' },
  { id: 'r2', name: 'Lucía P.',  stars: 5, service: 'Keratina',  text: 'Mi cabello nunca había estado tan suave. Atención de primera, volveré sin duda.' },
  { id: 'r3', name: 'Andrea T.', stars: 5, service: 'Corte',     text: 'Entendieron exactamente lo que quería. Ambiente relajante y muy profesional.' },
];

// Belysh Club — fidelidad
const CLUB = {
  member: 'Isabella',
  points: 720,
  tier: 'Oro',
  nextTier: 'Diamante',
  toNext: 780, // pts faltantes para Diamante (1500)
  tierMin: 500,
  tierMax: 1500,
  tiers: [
    { name: 'Plata',    min: 0,    perk: '5% en cada visita' },
    { name: 'Oro',      min: 500,  perk: '10% + brushing de regalo' },
    { name: 'Diamante', min: 1500, perk: '15% + sesión VIP anual' },
  ],
  rewards: [
    { id: 'w1', title: 'Brushing de regalo', cost: 300, ready: true },
    { id: 'w2', title: '$20 en tu próxima cita', cost: 500, ready: true },
    { id: 'w3', title: 'Tratamiento botox gratis', cost: 900, ready: false },
  ],
};

export const BELYSH = { SERVICES, CATEGORIES, STYLISTS, TIMES, PROMOS, REVIEWS, CLUB };

export const DOW = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export const dow = (n: any) => DOW[(((n || 1) - 1) % 7 + 7) % 7];

export const GUIDES = [
  { num: "01", img: "assets/hair-1.png", pos: "center 18%", a: "Reserva en ", b: "segundos", text: "Agenda el día y la hora que quieras. Sin llamadas, sin esperas." },
  { num: "02", img: "assets/hair-3.png", pos: "center 20%", a: "Tu estilista, ", b: "tu estilo", text: "Elige con quién y descubre nuestros rituales premium de color y cuidado." },
  { num: "03", img: "assets/hair-2.png", pos: "center 24%", a: "Gana al ", b: "consentirte", text: "Suma puntos del Belysh Club y desbloquea premios, promos y regalos." },
];
