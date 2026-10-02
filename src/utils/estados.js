// Mapea estados de dominio a tonos visuales del componente Badge.
export const ESTADOS_CITA = ['Pendiente', 'Confirmada', 'En atención', 'Completada', 'Cancelada', 'No asistió']
export const ESTADOS_EMPLEADO = ['Disponible', 'Ocupado', 'En descanso']

const tonos = {
  Pendiente: 'warning',
  Confirmada: 'accent',
  'En atención': 'info',
  Completada: 'success',
  Cancelada: 'neutral',
  'No asistió': 'danger',
  Disponible: 'success',
  Ocupado: 'warning',
  'En descanso': 'neutral',
  'Listo para recoger': 'accent',
  'Entregado y pagado': 'success',
  Cancelado: 'neutral',
  Expirado: 'danger',
  'En progreso': 'info',
  Alta: 'danger',
  Media: 'warning',
  Baja: 'neutral',
}

export const tonoEstado = (estado) => tonos[estado] ?? 'neutral'
