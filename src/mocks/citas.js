// Datos de prueba generados en relación a la fecha actual para que la demo
// siempre tenga citas "de hoy". Reemplazar por GET /api/citas/
import { servicios } from './servicios'
import { aMinutos, ahora, diaSemana, hoy, sumarDias, sumarMinutos } from '../utils/fecha'

// [díasDesdeHoy, empleadoId, servicioId, clienteId, horaInicio, estadoForzado?]
const plantilla = [
  // Pasado
  [-6, 'e1', 's10', 'c2', '10:00'], [-6, 'e2', 's1', 'c3', '09:30'], [-6, 'e4', 's3', 'c7', '14:00'],
  [-5, 'e1', 's9', 'c4', '09:00', 'No asistió'], [-5, 'e3', 's10', 'c6', '15:00'], [-5, 'e5', 's6', 'c9', '12:30'],
  [-4, 'e2', 's4', 'c5', '09:00'], [-4, 'e1', 's12', 'c10', '16:00'], [-4, 'e6', 's9', 'c8', '11:00', 'Cancelada'],
  [-3, 'e1', 's9', 'c1', '10:00'], [-3, 'e5', 's7', 'c1', '15:00'], [-3, 'e4', 's5', 'c3', '09:00'],
  [-2, 'e1', 's10', 'c6', '09:00'], [-2, 'e2', 's2', 'c7', '11:00'], [-2, 'e3', 's9', 'c4', '13:00', 'No asistió'],
  [-1, 'e1', 's11', 'c10', '12:00'], [-1, 'e2', 's1', 'c1', '14:00'], [-1, 'e6', 's10', 'c2', '15:00'],
  [-1, 'e5', 's6', 'c9', '16:00'],
  // Hoy
  [0, 'e1', 's10', 'c2', '09:00'], [0, 'e1', 's9', 'c4', '10:15'], [0, 'e1', 's11', 'c6', '11:00'],
  [0, 'e1', 's10', 'c8', '14:00'], [0, 'e1', 's12', 'c10', '15:30'], [0, 'e1', 's9', 'c1', '17:00'],
  [0, 'e2', 's1', 'c3', '09:30'], [0, 'e2', 's3', 'c5', '11:00'], [0, 'e2', 's2', 'c7', '15:00'],
  [0, 'e3', 's13', 'c9', '12:30'], [0, 'e3', 's10', 'c2', '16:00'],
  [0, 'e4', 's4', 'c7', '09:00'], [0, 'e5', 's6', 'c1', '12:00'], [0, 'e5', 's7', 'c9', '14:00'],
  [0, 'e6', 's11', 'c4', '14:30'],
  // Futuro
  [1, 'e1', 's10', 'c6', '09:00'], [1, 'e1', 's9', 'c8', '11:00'], [1, 'e2', 's3', 'c1', '10:00'],
  [1, 'e4', 's5', 'c5', '14:00'], [1, 'e5', 's7', 'c3', '15:00'],
  [2, 'e1', 's12', 'c2', '10:00'], [2, 'e3', 's10', 'c10', '13:00'], [2, 'e2', 's8', 'c7', '12:00'],
  [3, 'e1', 's9', 'c1', '15:00'], [3, 'e6', 's10', 'c4', '09:30'], [3, 'e4', 's4', 'c9', '09:00'],
  [5, 'e1', 's10', 'c10', '11:00'], [5, 'e2', 's1', 'c5', '09:00'],
  [6, 'e5', 's6', 'c1', '12:30'], [6, 'e1', 's11', 'c6', '16:00'],
]

function estadoSegunHora(fecha, inicio, fin, idx) {
  const h = hoy()
  if (fecha < h) return 'Completada'
  if (fecha > h) return idx % 3 === 0 ? 'Pendiente' : 'Confirmada'
  const now = aMinutos(ahora())
  if (aMinutos(fin) <= now) return 'Completada'
  if (aMinutos(inicio) <= now) return 'En atención'
  return idx % 4 === 0 ? 'Pendiente' : 'Confirmada'
}

export function generarCitas() {
  const base = hoy()
  let n = 1000
  return plantilla
    .map(([offset, empleadoId, servicioId, clienteId, horaInicio, forzado], idx) => {
      const fecha = sumarDias(base, offset)
      if (diaSemana(fecha) === 0) return null // domingo cerrado
      const servicio = servicios.find((s) => s.id === servicioId)
      const horaFin = sumarMinutos(horaInicio, servicio.duracion)
      return {
        id: `C-${++n}`,
        clienteId,
        empleadoId,
        servicioId,
        fecha,
        horaInicio,
        horaFin,
        precio: servicio.precio,
        estado: forzado ?? estadoSegunHora(fecha, horaInicio, horaFin, idx),
        notas: '',
        creadaEn: sumarDias(fecha, -3),
      }
    })
    .filter(Boolean)
}
