import { traducir } from '../errors';

describe('traducir (errores → español)', () => {
  it('traduce credenciales inválidas', () => {
    expect(traducir('Invalid login credentials')).toMatch(/incorrect/i);
  });
  it('traduce saldo insuficiente del canje', () => {
    expect(traducir('insufficient_points')).toMatch(/puntos/i);
  });
  it('traduce cupo duplicado (23505)', () => {
    expect(traducir('duplicate key value (23505)')).toMatch(/ocup/i);
  });
  it('traduce sesión expirada (JWT)', () => {
    expect(traducir('JWT expired')).toMatch(/sesión/i);
  });
  it('cae a un mensaje genérico si no reconoce', () => {
    expect(traducir(undefined)).toMatch(/salió mal|inténtalo/i);
  });
});
