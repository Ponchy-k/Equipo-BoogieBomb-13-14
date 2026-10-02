// Walk-ins, pedidos y tareas de prueba (relativos a hoy).
// Reemplazar por GET /api/walkins/, /api/pedidos/ y /api/tareas/
import { servicios } from './servicios'
import { productos } from './productos'
import { aMinutos, ahora, diaSemana, hoy, sumarDias, sumarMinutos } from '../utils/fecha'

// [díasDesdeHoy, empleadoId, servicioId, nombreCliente, hora]
const walkinsBase = [
  [-6, 'e3', 's9', 'Cliente ocasional', '17:00'], [-5, 'e1', 's11', 'Marco Antonio', '12:00'],
  [-4, 'e6', 's9', 'Cliente ocasional', '10:00'], [-3, 'e3', 's10', 'Óscar Mamani', '18:00'],
  [-2, 'e1', 's9', 'Cliente ocasional', '15:00'], [-2, 'e5', 's6', 'Rocío', '18:00'],
  [-1, 'e3', 's11', 'Cliente ocasional', '13:00'], [-1, 'e1', 's9', 'Cliente ocasional', '17:30'],
  [0, 'e1', 's11', 'Cliente ocasional', '12:00'], [0, 'e3', 's9', 'Hernán', '13:15'],
  [0, 'e6', 's9', 'Cliente ocasional', '10:00'],
]

export function generarWalkins() {
  const base = hoy()
  const now = aMinutos(ahora())
  return walkinsBase
    .map(([offset, empleadoId, servicioId, clienteNombre, horaInicio], i) => {
      const fecha = sumarDias(base, offset)
      if (diaSemana(fecha) === 0) return null
      const s = servicios.find((x) => x.id === servicioId)
      const horaFin = sumarMinutos(horaInicio, s.duracion)
      if (offset === 0 && aMinutos(horaFin) > now) return null // solo los ya ocurridos
      return { id: `W-${300 + i}`, empleadoId, servicioId, clienteNombre, fecha, horaInicio, horaFin, precio: s.precio }
    })
    .filter(Boolean)
}

const item = (productoId, cantidad) => {
  const p = productos.find((x) => x.id === productoId)
  return { productoId, nombre: p.nombre, precio: p.precio, cantidad }
}
const total = (items) => items.reduce((acc, i) => acc + i.precio * i.cantidad, 0)

export function generarPedidos() {
  const h = hoy()
  const def = [
    { id: 'P-2041', clienteId: 'c1', items: [item('p3', 1), item('p4', 1)], estado: 'Listo para recoger', dias: 0 },
    { id: 'P-2040', clienteId: 'c2', items: [item('p6', 2)], estado: 'Pendiente', dias: 0 },
    { id: 'P-2039', clienteId: 'c10', items: [item('p9', 1), item('p10', 1)], estado: 'Pendiente', dias: -1 },
    { id: 'P-2038', clienteId: 'c5', items: [item('p1', 1), item('p2', 1)], estado: 'Entregado y pagado', dias: 0, metodoPago: 'QR en caja' },
    { id: 'P-2037', clienteId: 'c8', items: [item('p7', 1)], estado: 'Entregado y pagado', dias: -2, metodoPago: 'Efectivo' },
    { id: 'P-2036', clienteId: 'c1', items: [item('p12', 2), item('p13', 1)], estado: 'Entregado y pagado', dias: -4, metodoPago: 'Efectivo' },
    { id: 'P-2035', clienteId: 'c4', items: [item('p6', 1)], estado: 'Expirado', dias: -5 },
    { id: 'P-2034', clienteId: 'c7', items: [item('p14', 1)], estado: 'Cancelado', dias: -6 },
    { id: 'P-2033', clienteId: 'c3', items: [item('p5', 1), item('p8', 1)], estado: 'Entregado y pagado', dias: -1, metodoPago: 'QR en caja' },
  ]
  return def.map(({ dias, metodoPago, ...p }) => {
    const fecha = sumarDias(h, dias)
    const pagado = p.estado === 'Entregado y pagado'
    return {
      ...p,
      total: total(p.items),
      fechaCreacion: fecha,
      horaCreacion: '10:30',
      expiraEl: sumarDias(fecha, 2),
      fechaPago: pagado ? fecha : null,
      metodoPago: pagado ? metodoPago : null,
    }
  })
}

export function generarTareas() {
  const h = hoy()
  return [
    { id: 'T-501', titulo: 'Limpiar y desinfectar sillones de barbería', categoria: 'Limpieza', responsableId: 'e1', prioridad: 'Alta',
      fechaLimite: h, recurrencia: 'Diaria', estado: 'Pendiente', observacion: '', productoId: null },
    { id: 'T-502', titulo: 'Esterilizar navajas y peines', categoria: 'Mantenimiento de herramientas', responsableId: 'e1', prioridad: 'Alta',
      fechaLimite: sumarDias(h, -1), recurrencia: 'Diaria', estado: 'Pendiente', observacion: '', productoId: null },
    { id: 'T-503', titulo: 'Lavar y doblar toallas', categoria: 'Toallas', responsableId: 'e1', prioridad: 'Media',
      fechaLimite: h, recurrencia: 'Diaria', estado: 'En progreso', observacion: '', productoId: null },
    { id: 'T-504', titulo: 'Reponer aceite para barba en vitrina', categoria: 'Reposición de stock', responsableId: 'e1', prioridad: 'Media',
      fechaLimite: sumarDias(h, 1), recurrencia: 'Única', estado: 'Pendiente', observacion: '', productoId: 'p9' },
    { id: 'T-505', titulo: 'Afilar tijeras de corte', categoria: 'Mantenimiento de herramientas', responsableId: 'e1', prioridad: 'Baja',
      fechaLimite: sumarDias(h, 4), recurrencia: 'Semanal', estado: 'Pendiente', observacion: '', productoId: null },
    { id: 'T-506', titulo: 'Limpiar espejos y estaciones', categoria: 'Limpieza', responsableId: 'e1', prioridad: 'Baja',
      fechaLimite: sumarDias(h, -1), recurrencia: 'Diaria', estado: 'Completada', observacion: 'Sin novedades.', productoId: null,
      completadaEn: sumarDias(h, -1) },
    { id: 'T-507', titulo: 'Reponer protector térmico', categoria: 'Reposición de stock', responsableId: 'e2', prioridad: 'Alta',
      fechaLimite: sumarDias(h, -2), recurrencia: 'Única', estado: 'Pendiente', observacion: '', productoId: 'p5' },
    { id: 'T-508', titulo: 'Lavar capas y toallas de color', categoria: 'Toallas', responsableId: 'e2', prioridad: 'Media',
      fechaLimite: h, recurrencia: 'Diaria', estado: 'Completada', observacion: '', productoId: null, completadaEn: h },
    { id: 'T-509', titulo: 'Limpiar lavacabezas', categoria: 'Limpieza', responsableId: 'e4', prioridad: 'Media',
      fechaLimite: h, recurrencia: 'Diaria', estado: 'Pendiente', observacion: '', productoId: null },
    { id: 'T-510', titulo: 'Revisar y limpiar secadores', categoria: 'Mantenimiento de herramientas', responsableId: 'e5', prioridad: 'Baja',
      fechaLimite: sumarDias(h, 2), recurrencia: 'Semanal', estado: 'Pendiente', observacion: '', productoId: null },
    { id: 'T-511', titulo: 'Desinfectar herramientas de manicure', categoria: 'Limpieza', responsableId: 'e5', prioridad: 'Alta',
      fechaLimite: h, recurrencia: 'Diaria', estado: 'Completada', observacion: '', productoId: null, completadaEn: h },
    { id: 'T-512', titulo: 'Aceitar máquinas de corte', categoria: 'Mantenimiento de herramientas', responsableId: 'e3', prioridad: 'Media',
      fechaLimite: sumarDias(h, -1), recurrencia: 'Semanal', estado: 'Pendiente', observacion: '', productoId: null },
    { id: 'T-513', titulo: 'Barrer y trapear zona de barbería', categoria: 'Limpieza', responsableId: 'e6', prioridad: 'Media',
      fechaLimite: h, recurrencia: 'Diaria', estado: 'Pendiente', observacion: '', productoId: null },
  ]
}
