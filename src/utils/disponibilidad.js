import { aHora, aMinutos, ahora, diaSemana, hoy } from './fecha'

/** Estados de cita que NO ocupan la agenda. */
export const ESTADOS_LIBERAN = ['Cancelada', 'No asistió']

/** Intervalo de generación de horarios (minutos). */
export const PASO_MINUTOS = 15

/**
 * Bloques ocupados de un empleado en una fecha, en minutos desde 00:00.
 * Considera citas activas y servicios sin cita (walk-ins).
 */
export function bloquesOcupados({ empleadoId, fecha, citas, walkins, excluirCitaId }) {
  const deCitas = citas
    .filter(
      (c) =>
        c.empleadoId === empleadoId &&
        c.fecha === fecha &&
        c.id !== excluirCitaId &&
        !ESTADOS_LIBERAN.includes(c.estado),
    )
    .map((c) => [aMinutos(c.horaInicio), aMinutos(c.horaFin)])

  const deWalkins = walkins
    .filter((w) => w.empleadoId === empleadoId && w.fecha === fecha)
    .map((w) => [aMinutos(w.horaInicio), aMinutos(w.horaFin)])

  return [...deCitas, ...deWalkins].sort((a, b) => a[0] - b[0])
}

const seSolapan = (a0, a1, b0, b1) => a0 < b1 && b0 < a1

/**
 * Horarios libres (['09:00', '09:15', ...]) para que un empleado atienda
 * un servicio de `duracion` minutos en `fecha`.
 * Un horario es válido si el servicio completo cabe dentro de un turno
 * del horario semanal y no se cruza con citas ni walk-ins.
 */
export function horariosLibres({ empleado, duracion, fecha, citas, walkins, excluirCitaId, paso = PASO_MINUTOS }) {
  const turnos = empleado.horario?.[diaSemana(fecha)] ?? []
  if (!turnos.length) return []

  const ocupados = bloquesOcupados({ empleadoId: empleado.id, fecha, citas, walkins, excluirCitaId })
  const esHoy = fecha === hoy()
  const minimo = esHoy ? aMinutos(ahora()) + 15 : 0
  const libres = []

  for (const turno of turnos) {
    const ini = aMinutos(turno.inicio)
    const fin = aMinutos(turno.fin)
    for (let t = ini; t + duracion <= fin; t += paso) {
      if (t < minimo) continue
      const choca = ocupados.some(([o0, o1]) => seSolapan(t, t + duracion, o0, o1))
      if (!choca) libres.push(aHora(t))
    }
  }
  return libres
}

/**
 * Para "Cualquiera disponible": une los horarios de todos los empleados
 * que ofrecen el servicio. Devuelve [{ hora, empleadoIds: [...] }].
 */
export function horariosLibresCualquiera({ empleados, duracion, fecha, citas, walkins, excluirCitaId }) {
  const mapa = new Map()
  for (const empleado of empleados) {
    for (const hora of horariosLibres({ empleado, duracion, fecha, citas, walkins, excluirCitaId })) {
      if (!mapa.has(hora)) mapa.set(hora, [])
      mapa.get(hora).push(empleado.id)
    }
  }
  return [...mapa.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hora, empleadoIds]) => ({ hora, empleadoIds }))
}

/** ¿El tramo [inicio, inicio + duracion) está libre para el empleado? */
export function tramoLibre({ empleadoId, fecha, horaInicio, duracion, citas, walkins, excluirCitaId }) {
  const t0 = aMinutos(horaInicio)
  const t1 = t0 + duracion
  return !bloquesOcupados({ empleadoId, fecha, citas, walkins, excluirCitaId }).some(([o0, o1]) =>
    seSolapan(t0, t1, o0, o1),
  )
}
