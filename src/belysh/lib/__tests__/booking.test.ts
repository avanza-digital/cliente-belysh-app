import { describe, expect, it } from '@jest/globals';
import { applyBookingPatch } from '../booking';
import type { BookingState } from '../../data';

const selected: BookingState = {
  stylist: 'stylist-a',
  date: '2026-07-10',
  time: '10:00',
  rescheduleId: null,
};

describe('applyBookingPatch', () => {
  it('borra la hora al cambiar de estilista', () => {
    expect(applyBookingPatch(selected, { stylist: 'stylist-b' })).toEqual({
      ...selected,
      stylist: 'stylist-b',
      time: null,
    });
  });

  it('borra la hora al cambiar de día', () => {
    expect(applyBookingPatch(selected, { date: '2026-07-11' })).toEqual({
      ...selected,
      date: '2026-07-11',
      time: null,
    });
  });

  it('permite elegir otra hora sin alterar el resto', () => {
    expect(applyBookingPatch(selected, { time: '11:30' })).toEqual({
      ...selected,
      time: '11:30',
    });
  });
});
