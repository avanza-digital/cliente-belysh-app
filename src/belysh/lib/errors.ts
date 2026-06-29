// Traductor único de errores (Supabase/red) a español claro para el usuario.
// Se usa en login, reservar, cancelar y canjear.
export function traducir(msg?: string): string {
  const m = (msg || '').toLowerCase();
  if (m.includes('invalid login')) return 'Correo o contraseña incorrectos.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Ese correo ya tiene una cuenta. Inicia sesión.';
  if (m.includes('insufficient')) return 'No te alcanzan los puntos para canjear esto.';
  if (m.includes('reward_not_found')) return 'Esa recompensa ya no está disponible.';
  if (m.includes('forbidden_status') || m.includes('forbidden_field')) return 'No puedes modificar esta cita.';
  if (m.includes('ocup') || m.includes('23505') || m.includes('duplicate')) return 'Ese horario acaba de ocuparse. Elige otro, por favor.';
  if (m.includes('row-level security') || m.includes('permission')) return 'No tienes permiso para esta acción.';
  if (m.includes('jwt') || m.includes('expired') || m.includes('not authenticated')) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
  if (m.includes('password')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (m.includes('email')) return 'Revisa que el correo sea válido.';
  if (m.includes('network') || m.includes('fetch') || m.includes('timeout')) return 'Sin conexión. Revisa tu internet e inténtalo de nuevo.';
  return msg || 'Algo salió mal. Inténtalo de nuevo.';
}
