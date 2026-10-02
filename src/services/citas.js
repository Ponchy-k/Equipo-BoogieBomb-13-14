// Citas, disponibilidad y servicios sin cita (walk-ins).
import { ApiError, clone, db, delay, nuevoId, persistir } from './api'
import { horariosLibres, horariosLibresCualquiera, tramoLibre } from '../utils/disponibilidad'
import { ahora, hoy, sumarMinutos } from '../utils/fecha'

/** Equivalente a un serializer anidado de DRF. */
function expandir(cita) {
  const cliente = db.clientes.find((c) => c.id === cita.clienteId)
  const empleado = db.empleados.find((e) => e.id === cita.empleadoId)
  const servicio = db.servicios.find((s) => s.id === cita.servicioId)
  return {
    ...clone(cita),
    cliente: cliente ? { id: cliente.id, nombre: cliente.nombre, telefono: cliente.telefono, notas: cliente.notas } : null,
    empleado: empleado ? { id: empleado.id, nombre: empleado.nombre, especialidad: empleado.especialidad } : null,
    servicio: servicio
      ? { id: servicio.id, nombre: servicio.nombre, categoria: servicio.categoria, duracion: servicio.duracion }
      : null,
  }
}

const ordenar = (a, b) => (a.fecha + a.horaInicio).localeCompare(b.fecha + b.horaInicio)

// API: GET /api/citas/?cliente=&empleado=&fecha=&desde=&hasta=&estado=
export async function getCitas({ clienteId, empleadoId, fecha, desde, hasta, estado } = {}) {
  await delay()
  return db.citas
    .filter(
      (c) =>
        (!clienteId || c.clienteId === clienteId) &&
        (!empleadoId || c.empleadoId === empleadoId) &&
        (!fecha || c.fecha === fecha) &&
        (!desde || c.fecha >= desde) &&
        (!hasta || c.fecha <= hasta) &&
        (!estado || c.estado === estado),
    )
    .sort(ordenar)
    .map(expandir)
}

// API: GET /api/citas/:id/
export async function getCita(id) {
  await delay(150)
  const c = db.citas.find((x) => x.id === id)
  if (!c) throw new ApiError('Cita no encontrada')
  return expandir(c)
}

/**
 * API: GET /api/disponibilidad/?empleado=&fecha=&servicio=
 * empleadoId puede ser 'cualquiera'. Devuelve [{ hora, empleadoIds }].
 */
export async function getDisponibilidad(empleadoId, fecha, servicioId, { excluirCitaId } = {}) {
  await delay(250)
  const servicio = db.servicios.find((s) => s.id === servicioId)
  if (!servicio) throw new ApiError('Servicio no encontrado')
  const ctx = { duracion: servicio.duracion, fecha, citas: db.citas, walkins: db.walkins, excluirCitaId }

  if (empleadoId === 'cualquiera') {
    const empleados = db.empleados.filter((e) => e.activo && e.servicioIds.includes(servicioId))
    return horariosLibresCualquiera({ ...ctx, empleados })
  }
  const empleado = db.empleados.find((e) => e.id === empleadoId)
  return horariosLibres({ ...ctx, empleado }).map((hora) => ({ hora, empleadoIds: [empleadoId] }))
}

function validarTramo({ empleadoId, fecha, horaInicio, duracion, excluirCitaId }) {
  const libre = tramoLibre({ empleadoId, fecha, horaInicio, duracion, citas: db.citas, walkins: db.walkins, excluirCitaId })
  if (!libre) throw new ApiError('Ese horario acaba de ocuparse. Elige otro, por favor.')
}

// API: POST /api/citas/
export async function crearCita({ clienteId, empleadoId, servicioId, fecha, horaInicio, notas = '', estado = 'Pendiente' }) {
  await delay(400)
  const servicio = db.servicios.find((s) => s.id === servicioId)

  let asignado = empleadoId
  if (empleadoId === 'cualquiera') {
    const candidatos = db.empleados.filter((e) => e.activo && e.servicioIds.includes(servicioId))
    asignado = candidatos.find((e) =>
      tramoLibre({ empleadoId: e.id, fecha, horaInicio, duracion: servicio.duracion, citas: db.citas, walkins: db.walkins }),
    )?.id
    if (!asignado) throw new ApiError('Ya no hay profesionales libres a esa hora.')
  } else {
    validarTramo({ empleadoId, fecha, horaInicio, duracion: servicio.duracion })
  }

  const cita = {
    id: nuevoId('C'),
    clienteId,
    empleadoId: asignado,
    servicioId,
    fecha,
    horaInicio,
    horaFin: sumarMinutos(horaInicio, servicio.duracion),
    precio: servicio.precio,
    estado,
    notas,
    creadaEn: hoy(),
  }
  db.citas.push(cita)
  persistir()
  return expandir(cita)
}

// API: PATCH /api/citas/:id/  (editar o reprogramar)
export async function actualizarCita(id, cambios) {
  await delay(350)
  const cita = db.citas.find((c) => c.id === id)
  if (!cita) throw new ApiError('Cita no encontrada')
  const siguiente = { ...cita, ...cambios }
  const servicio = db.servicios.find((s) => s.id === siguiente.servicioId)
  const moverAgenda = ['fecha', 'horaInicio', 'empleadoId', 'servicioId'].some((k) => k in cambios && cambios[k] !== cita[k])
  if (moverAgenda) {
    validarTramo({ ...siguiente, duracion: servicio.duracion, excluirCitaId: id })
    siguiente.horaFin = sumarMinutos(siguiente.horaInicio, servicio.duracion)
    siguiente.precio = servicio.precio
  }
  Object.assign(cita, siguiente)
  persistir()
  return expandir(cita)
}

// API: POST /api/citas/:id/estado/
export async function cambiarEstadoCita(id, estado) {
  await delay(250)
  const cita = db.citas.find((c) => c.id === id)
  if (estado === 'No asistió' && cita.estado !== 'No asistió') {
    const cliente = db.clientes.find((c) => c.id === cita.clienteId)
    if (cliente) cliente.inasistencias += 1
  }
  cita.estado = estado
  persistir()
  return expandir(cita)
}

export async function cancelarCita(id) {
  return cambiarEstadoCita(id, 'Cancelada')
}

/* ---------- Walk-ins ---------- */

function expandirWalkin(w) {
  const servicio = db.servicios.find((s) => s.id === w.servicioId)
  const empleado = db.empleados.find((e) => e.id === w.empleadoId)
  return {
    ...clone(w),
    servicio: servicio ? { id: servicio.id, nombre: servicio.nombre, duracion: servicio.duracion } : null,
    empleado: empleado ? { id: empleado.id, nombre: empleado.nombre } : null,
  }
}

// API: GET /api/walkins/?empleado=&fecha=&desde=&hasta=
export async function getWalkins({ empleadoId, fecha, desde, hasta } = {}) {
  await delay()
  return db.walkins
    .filter(
      (w) =>
        (!empleadoId || w.empleadoId === empleadoId) &&
        (!fecha || w.fecha === fecha) &&
        (!desde || w.fecha >= desde) &&
        (!hasta || w.fecha <= hasta),
    )
    .sort(ordenar)
    .map(expandirWalkin)
}

// API: POST /api/walkins/
export async function registrarWalkin({ empleadoId, servicioId, clienteNombre, horaInicio = ahora() }) {
  await delay(350)
  const servicio = db.servicios.find((s) => s.id === servicioId)
  const fecha = hoy()
  const libre = tramoLibre({
    empleadoId, fecha, horaInicio, duracion: servicio.duracion, citas: db.citas, walkins: db.walkins,
  })
  if (!libre) {
    throw new ApiError('Ese tramo se cruza con otra cita o servicio de tu agenda. Ajusta la hora de inicio.')
  }
  const walkin = {
    id: nuevoId('W'),
    empleadoId,
    servicioId,
    clienteNombre: clienteNombre?.trim() || 'Cliente ocasional',
    fecha,
    horaInicio,
    horaFin: sumarMinutos(horaInicio, servicio.duracion),
    precio: servicio.precio,
  }
  db.walkins.push(walkin)
  persistir()
  return expandirWalkin(walkin)
}
