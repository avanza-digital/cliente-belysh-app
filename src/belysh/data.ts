// Belysh — datos compartidos entre las dos direcciones visuales
// Spa de belleza · enfoque cabello de mujer · segmento premium

export type Service = { id: string; name: string; cat: string; min: number; price: number; popular: boolean; desc: string; tone: string; tag: string; img: string; pos: string };
export type Stylist = { id: string; name: string; role: string; initials: string; rating: number };
export type Promo = { id: string; serviceId: string; title: string; kind: string; desc: string; now: number; was: number; badge: string; tone: string; img: string };
export type Review = { id: string; name: string; stars: number; service: string; text: string };
export type Tier = { name: string; min: number; discountPct: number; perk: string };
export type ClubReward = { id: string; title: string; cost: number; ready: boolean };
export type Guide = { num: string; img: string; pos: string; a: string; b: string; text: string };
// Estado del flujo de reserva (compartido por BelyshApp y las pantallas del flujo).
export type BookingState = { stylist: string | null; date: string | null; time: string | null; rescheduleId: string | null };

const SERVICES: Service[] = [
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

const CATEGORIES: string[] = ['Todo', 'Corte', 'Color', 'Tratamiento', 'Peinado', 'Extensión'];

const STYLISTS: Stylist[] = [
  { id: 'valentina', name: 'Valentina R.', role: 'Especialista en color', initials: 'VR', rating: 4.9 },
  { id: 'camila',    name: 'Camila S.',    role: 'Directora de estilo',   initials: 'CS', rating: 5.0 },
  { id: 'daniela',   name: 'Daniela M.',   role: 'Experta en tratamientos', initials: 'DM', rating: 4.8 },
  { id: 'sofia',     name: 'Sofía L.',     role: 'Peinados & eventos',     initials: 'SL', rating: 4.9 },
];

const TIMES: string[] = ['9:30', '10:30', '11:30', '13:00', '15:00', '16:30', '18:00'];

// serviceId mapea cada promo al servicio reservable más cercano (la promo abre su reserva).
const PROMOS: Promo[] = [
  { id: 'p1', serviceId: 'color', title: 'Color + Tratamiento', kind: 'Paquete', desc: 'Color completo + botox capilar en una sola visita.',
    now: 290, was: 340, badge: '−15%', tone: 'emerald', img: 'assets/hair-3.png' },
  { id: 'p2', serviceId: 'evento', title: 'Glow de Novia', kind: 'Paquete', desc: 'Prueba de peinado + maquillaje + el día del evento.',
    now: 380, was: 450, badge: 'Exclusivo', tone: 'rose', img: 'assets/hair-2.png' },
  { id: 'p3', serviceId: 'brushing', title: 'Martes de Brushing', kind: 'Descuento', desc: 'Brushing de lujo 2×1 todos los martes.',
    now: 55, was: 110, badge: '2×1', tone: 'sand', img: 'assets/hair-1.png' },
];

const REVIEWS: Review[] = [
  { id: 'r1', name: 'Mariana G.', stars: 5, service: 'Balayage', text: 'Salí enamorada de mi color. Valentina es una artista, el lugar impecable.' },
  { id: 'r2', name: 'Lucía P.',  stars: 5, service: 'Keratina',  text: 'Mi cabello nunca había estado tan suave. Atención de primera, volveré sin duda.' },
  { id: 'r3', name: 'Andrea T.', stars: 5, service: 'Corte',     text: 'Entendieron exactamente lo que quería. Ambiente relajante y muy profesional.' },
];

// Belysh Privilege — fidelidad. Solo config de RENDER: el nivel sale del consumo
// pagado en 12 meses (server: client_tier) y el descuento lo calcula confirm_payment.
// `min` está en SOLES de consumo, no en puntos. Los ids de rewards deben existir
// en la tabla `rewards` del servidor (redeem_reward deriva el costo real de ahí).
const CLUB: { tiers: Tier[]; rewards: ClubReward[] } = {
  tiers: [
    { name: 'Member', min: 0,    discountPct: 0,  perk: 'Bienvenida al club' },
    { name: 'VIP',    min: 2000, discountPct: 10, perk: '10% en cada visita' },
    { name: 'Elite',  min: 5000, discountPct: 15, perk: '15% en cada visita' },
    { name: 'Black',  min: 8000, discountPct: 20, perk: '20% + experiencias exclusivas' },
  ],
  rewards: [
    { id: 'masaje10', title: 'Masaje relajante 10 min', cost: 30,  ready: true },
    { id: 'cejas',    title: 'Diseño de cejas',          cost: 50,  ready: true },
    { id: 'manos',    title: 'Spa de manos',             cost: 70,  ready: true },
    { id: 'ritual',   title: 'Ritual capilar express',   cost: 100, ready: true },
    { id: 'gift50',   title: 'Gift card S/ 50',          cost: 150, ready: true },
    { id: 'facial',   title: 'Facial detox express',     cost: 200, ready: true },
  ],
};

export const BELYSH = { SERVICES, CATEGORIES, STYLISTS, TIMES, PROMOS, REVIEWS, CLUB };

export const GUIDES: Guide[] = [
  { num: "01", img: "assets/hair-1.png", pos: "center 18%", a: "Reserva en ", b: "segundos", text: "Agenda el día y la hora que quieras. Sin llamadas, sin esperas." },
  { num: "02", img: "assets/hair-3.png", pos: "center 20%", a: "Tu estilista, ", b: "tu estilo", text: "Elige con quién y descubre nuestros rituales premium de color y cuidado." },
  { num: "03", img: "assets/hair-2.png", pos: "center 24%", a: "Gana al ", b: "consentirte", text: "Suma puntos del Belysh Club y desbloquea premios, promos y regalos." },
];
