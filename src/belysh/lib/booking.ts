import type { BookingState } from '../data';

/** Mantiene la jerarquía estilista → día → hora al editar una reserva. */
export function applyBookingPatch(current: BookingState, patch: Partial<BookingState>): BookingState {
  const stylistChanged = patch.stylist !== undefined && patch.stylist !== current.stylist;
  const dateChanged = patch.date !== undefined && patch.date !== current.date;
  const time = stylistChanged || dateChanged
    ? null
    : patch.time !== undefined
      ? patch.time
      : current.time;

  return { ...current, ...patch, time };
}
