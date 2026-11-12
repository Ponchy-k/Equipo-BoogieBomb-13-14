/**
 * Implementación de los servicios contra el backend Django REST (backend/).
 * Tiene las MISMAS funciones y devuelve los MISMOS formatos que la versión
 * con mocks, así que las páginas no cambian.
 *
 * Los IDs llegan como números desde la API y aquí se convierten a texto
 * ("1", "2"...) porque el frontend los compara con valores de <select> y URLs.
 */
import { galeria } from '../mocks/salon'
import { horariosLibres, horariosLibresCualquiera, tramoLibre } from '../utils/disponibilidad'
import { ahora, hoy, sumarDias, sumarMinutos } from '../utils/fecha'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'

export class ApiError extends Error {}

/* ---------------------------------------------------------------------------
 * Cliente HTTP
 * ------------------------------------------------------------------------- */

/** Saca un mensaje legible de los errores de DRF ({detail} o {campo: [msg]}). */
function mensajeError(body, status) {
  if (!body || typeof body !== 'object') return `Error ${status}`
  if (typeof body.detail === 'string') return body.detail
  const primero = Object.entries(body)[0]
  if (!primero) return `Error ${status}`
  const [campo, msg] = primero
  const texto = Array.isArray(msg) ? msg[0] : typeof msg === 'object' ? mensajeError(msg, status) : msg
  return campo === 'non_field_errors' || campo === 'detail' ? texto : `${campo}: ${texto}`
}

/** Convierte ids numéricos a texto (id, clienteId, servicioIds...). */
function normalizar(x) {
  if (Array.isArray(x)) return x.map(normalizar)
  if (!x || typeof x !== 'object') return x
  const out = {}
  for (const [k, v] of Object.entries(x)) {
    if ((k === 'id' || k.endsWith('Id')) && typeof v === 'number') out[k] = String(v)
    else if (k.endsWith('Ids') && Array.isArray(v)) out[k] = v.map(String)
    else out[k] = normalizar(v)
  }
  return out
}

function querystring(params = {}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== null && v !== '' && q.set(k, v))
  const s = q.toString()
  return s ? `?${s}` : ''
}

export async function request(path, { method = 'GET', body, params } = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${path}${querystring(params)}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. ¿Está corriendo "python manage.py runserver"?')
  }
  if (!res.ok) {
    const detalle = await res.json().catch(() => null)
    throw new ApiError(mensajeError(detalle, res.status))
  }
  return res.status === 204 ? null : normalizar(await res.json())
}

const get = (path, params) => request(path, { params })
const post = (path, body) => request(path, { method: 'POST', body })
const patch = (path, body) => request(path, { method: 'PATCH', body })
const del = (path) => request(path, { method: 'DELETE' })

/** Ya no hay datos locales que restablecer: la base de datos es la fuente. */
export function restablecerDatos() {}

const porId = (lista) => Object.fromEntries(lista.map((x) => [x.id, x]))

/* ===========================================================================
 * Catálogo: servicios, empleados, productos, salón
 * ========================================================================= */

export async function getServicios({ categoria, incluirInactivos = false } = {}) {
  const lista = await get('/servicios/', { categoria: categoria === 'Todos' ? undefined : categoria })
  return lista.filter((s) => incluirInactivos || s.activo)
}

export const getServicio = (id) => get(`/servicios/${id}/`)
export const crearServicio = (data) => post('/servicios/', { activo: true, ...data })
export const actualizarServicio = (id, cambios) => patch(`/servicios/${id}/`, cambios)
export const eliminarServicio = (id) => del(`/servicios/${id}/`)

export async function getEmpleados({ incluirInactivos = false, servicioId, estado } = {}) {
  const lista = await get('/empleados/')
  return lista.filter(
    (e) =>
      (incluirInactivos || e.activo) &&
      (!servicioId || e.servicioIds.includes(String(servicioId))) &&
      (!estado || e.estado === estado),
  )
}

export const getEmpleado = (id) => get(`/empleados/${id}/`)
export const crearEmpleado = (data) => post('/empleados/', { estado: 'Disponible', activo: true, ...data })
export const actualizarEmpleado = (id, cambios) => patch(`/empleados/${id}/`, cambios)
export const actualizarEstadoEmpleado = (id, estado) => patch(`/empleados/${id}/`, { estado })
export const eliminarEmpleado = (id) => del(`/empleados/${id}/`)

export async function getProductos({ q = '', categoria, marca, precioMin, precioMax, soloDestacados } = {}) {
  const texto = q.trim().toLowerCase()
  const lista = await get('/productos/', { categoria })
  return lista.filter(
    (p) =>
      (!texto || `${p.nombre} ${p.marca}`.toLowerCase().includes(texto)) &&
      (!marca || p.marca === marca) &&
      (precioMin == null || precioMin === '' || p.precio >= Number(precioMin)) &&
      (precioMax == null || precioMax === '' || p.precio <= Number(precioMax)) &&
      (!soloDestacados || p.destacado),
  )
}

export const getProducto = (id) => get(`/productos/${id}/`)
export async function crearProducto(data) {
  return post('/productos/', { destacado: false, tono: Math.floor(Math.random() * 6), ...data })
}
export const actualizarProducto = (id, cambios) => patch(`/productos/${id}/`, cambios)
export const eliminarProducto = (id) => del(`/productos/${id}/`)

export const getSalon = () => get('/salon/')
export const getGaleria = async () => structuredClone(galeria) // la galería no está en la base

/* ===========================================================================
 * Citas, disponibilidad y walk-ins
 * ========================================================================= */

/** Agrega cliente/empleado/servicio a cada cita (como el "expandir" de los mocks). */
async function expandirCitas(citas) {
  const [clientes, empleados, servicios] = await Promise.all([
    get('/clientes/'), get('/empleados/'), get('/servicios/'),
  ])
  const C = porId(clientes), E = porId(empleados), S = porId(servicios)
  return citas.map((c) => {
    const cli = C[c.clienteId], emp = E[c.empleadoId], srv = S[c.servicioId]
    return {
      ...c,
      cliente: cli ? { id: cli.id, nombre: cli.nombre, telefono: cli.telefono, notas: cli.notas } : null,
      empleado: emp ? { id: emp.id, nombre: emp.nombre, especialidad: emp.especialidad } : null,
      servicio: srv ? { id: srv.id, nombre: srv.nombre, categoria: srv.categoria, duracion: srv.duracion } : null,
    }
  })
}

const ordenar = (a, b) => (a.fecha + a.horaInicio).localeCompare(b.fecha + b.horaInicio)

export async function getCitas({ clienteId, empleadoId, fecha, desde, hasta, estado } = {}) {
  const citas = await get('/citas/', { clienteId, empleadoId, fecha, desde, hasta, estado })
  return expandirCitas(citas.sort(ordenar))
}

export async function getCita(id) {
  const [cita] = await expandirCitas([await get(`/citas/${id}/`)])
  return cita
}

/** Datos para calcular huecos libres de un día (se calcula aquí con utils/disponibilidad). */
async function agendaDelDia(fecha) {
  const [citas, walkins] = await Promise.all([get('/citas/', { fecha }), get('/walkins/', { fecha })])
  return { citas, walkins }
}

export async function getDisponibilidad(empleadoId, fecha, servicioId, { excluirCitaId } = {}) {
  const [servicio, empleados, agenda] = await Promise.all([
    getServicio(servicioId), get('/empleados/'), agendaDelDia(fecha),
  ])
  const ctx = { duracion: servicio.duracion, fecha, ...agenda, excluirCitaId }
  if (empleadoId === 'cualquiera') {
    const candidatos = empleados.filter((e) => e.activo && e.servicioIds.includes(String(servicioId)))
    return horariosLibresCualquiera({ ...ctx, empleados: candidatos })
  }
  const empleado = empleados.find((e) => e.id === String(empleadoId))
  return horariosLibres({ ...ctx, empleado }).map((hora) => ({ hora, empleadoIds: [empleado.id] }))
}

export async function crearCita({ clienteId, empleadoId, servicioId, fecha, horaInicio, notas = '', estado = 'Pendiente' }) {
  const [servicio, empleados, agenda] = await Promise.all([
    getServicio(servicioId), get('/empleados/'), agendaDelDia(fecha),
  ])
  const libre = (id) => tramoLibre({ empleadoId: id, fecha, horaInicio, duracion: servicio.duracion, ...agenda })

  let asignado = String(empleadoId)
  if (empleadoId === 'cualquiera') {
    asignado = empleados.find((e) => e.activo && e.servicioIds.includes(servicio.id) && libre(e.id))?.id
    if (!asignado) throw new ApiError('Ya no hay profesionales libres a esa hora.')
  } else if (!libre(asignado)) {
    throw new ApiError('Ese horario acaba de ocuparse. Elige otro, por favor.')
  }

  const cita = await post('/citas/', {
    clienteId, empleadoId: asignado, servicioId, fecha, horaInicio,
    horaFin: sumarMinutos(horaInicio, servicio.duracion), precio: servicio.precio, estado, notas,
  })
  return (await expandirCitas([cita]))[0]
}

export async function actualizarCita(id, cambios) {
  const actual = await get(`/citas/${id}/`)
  const siguiente = { ...actual, ...cambios }
  const moverAgenda = ['fecha', 'horaInicio', 'empleadoId', 'servicioId'].some(
    (k) => k in cambios && String(cambios[k]) !== String(actual[k]),
  )
  const datos = { ...cambios }
  if (moverAgenda) {
    const [servicio, agenda] = await Promise.all([getServicio(siguiente.servicioId), agendaDelDia(siguiente.fecha)])
    const libre = tramoLibre({
      empleadoId: String(siguiente.empleadoId), fecha: siguiente.fecha, horaInicio: siguiente.horaInicio,
      duracion: servicio.duracion, ...agenda, excluirCitaId: actual.id,
    })
    if (!libre) throw new ApiError('Ese horario acaba de ocuparse. Elige otro, por favor.')
    datos.horaFin = sumarMinutos(siguiente.horaInicio, servicio.duracion)
    datos.precio = servicio.precio
  }
  return (await expandirCitas([await patch(`/citas/${id}/`, datos)]))[0]
}

/** El backend suma la inasistencia al cliente si el estado es "No asistió". */
export async function cambiarEstadoCita(id, estado) {
  return (await expandirCitas([await patch(`/citas/${id}/`, { estado })]))[0]
}

export const cancelarCita = (id) => cambiarEstadoCita(id, 'Cancelada')

async function expandirWalkins(walkins) {
  const [empleados, servicios] = await Promise.all([get('/empleados/'), get('/servicios/')])
  const E = porId(empleados), S = porId(servicios)
  return walkins.map((w) => ({
    ...w,
    servicio: S[w.servicioId] ? { id: w.servicioId, nombre: S[w.servicioId].nombre, duracion: S[w.servicioId].duracion } : null,
    empleado: E[w.empleadoId] ? { id: w.empleadoId, nombre: E[w.empleadoId].nombre } : null,
  }))
}

export async function getWalkins({ empleadoId, fecha, desde, hasta } = {}) {
  const lista = await get('/walkins/', { empleadoId, fecha, desde, hasta })
  return expandirWalkins(lista.sort(ordenar))
}

export async function registrarWalkin({ empleadoId, servicioId, clienteNombre, horaInicio = ahora() }) {
  const fecha = hoy()
  const [servicio, agenda] = await Promise.all([getServicio(servicioId), agendaDelDia(fecha)])
  if (!tramoLibre({ empleadoId: String(empleadoId), fecha, horaInicio, duracion: servicio.duracion, ...agenda })) {
    throw new ApiError('Ese tramo se cruza con otra cita o servicio de tu agenda. Ajusta la hora de inicio.')
  }
  const walkin = await post('/walkins/', {
    empleadoId, servicioId, clienteNombre: clienteNombre?.trim() || 'Cliente ocasional',
    fecha, horaInicio, horaFin: sumarMinutos(horaInicio, servicio.duracion), precio: servicio.precio,
  })
  return (await expandirWalkins([walkin]))[0]
}

/* ===========================================================================
 * Clientes
 * ========================================================================= */

export async function getClientes({ q = '' } = {}) {
  const texto = q.trim().toLowerCase()
  const [clientes, completadas] = await Promise.all([get('/clientes/'), get('/citas/', { estado: 'Completada' })])
  return clientes
    .filter((c) => !texto || `${c.nombre} ${c.telefono} ${c.correo}`.toLowerCase().includes(texto))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .map((c) => {
      const suyas = completadas.filter((x) => x.clienteId === c.id)
      return { ...c, totalCitas: suyas.length, ultimaVisita: suyas.map((x) => x.fecha).sort().at(-1) ?? null }
    })
}

export async function getCliente(id) {
  const [cliente, citas, pedidos, empleados, servicios] = await Promise.all([
    get(`/clientes/${id}/`), get('/citas/', { clienteId: id }), get('/pedidos/', { clienteId: id }),
    get('/empleados/'), get('/servicios/'),
  ])
  const E = porId(empleados), S = porId(servicios)
  const historial = citas
    .sort((a, b) => (b.fecha + b.horaInicio).localeCompare(a.fecha + a.horaInicio))
    .map((c) => ({ ...c, servicio: S[c.servicioId]?.nombre, empleado: E[c.empleadoId]?.nombre }))
  const pedidosOrd = pedidos.sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))
  return {
    ...cliente,
    citas: historial,
    pedidos: pedidosOrd,
    gastoServicios: historial.filter((c) => c.estado === 'Completada').reduce((a, c) => a + c.precio, 0),
    gastoProductos: pedidosOrd.filter((p) => p.estado === 'Entregado y pagado').reduce((a, p) => a + p.total, 0),
  }
}

export const registrarCliente = (data) => post('/clientes/', data)
export const actualizarCliente = (id, cambios) => patch(`/clientes/${id}/`, cambios)

export async function buscarClientePorCorreo(correo) {
  const clientes = await get('/clientes/')
  return clientes.find((c) => c.correo?.toLowerCase() === correo.toLowerCase()) ?? null
}

/* ===========================================================================
 * Pedidos (el backend reserva/devuelve stock y vence los de +48 h)
 * ========================================================================= */

export const ESTADOS_PEDIDO = ['Pendiente', 'Listo para recoger', 'Entregado y pagado', 'Cancelado', 'Expirado']

async function expandirPedidos(pedidos) {
  const C = porId(await get('/clientes/'))
  return pedidos.map((p) => {
    const c = C[p.clienteId]
    return { ...p, cliente: c ? { id: c.id, nombre: c.nombre, telefono: c.telefono } : null }
  })
}

export async function getPedidos({ clienteId, estado } = {}) {
  const lista = await get('/pedidos/', { clienteId, estado })
  return expandirPedidos(
    lista.sort((a, b) => (b.fechaCreacion + b.horaCreacion).localeCompare(a.fechaCreacion + a.horaCreacion)),
  )
}

export async function crearPedido({ clienteId, items }) {
  if (!items.length) throw new ApiError('El carrito está vacío.')
  const pedido = await post('/pedidos/', {
    clienteId,
    items: items.map(({ productoId, cantidad }) => ({ productoId, cantidad })),
  })
  return (await expandirPedidos([pedido]))[0]
}

export async function cambiarEstadoPedido(id, estado, { metodoPago } = {}) {
  if (estado === 'Entregado y pagado' && !metodoPago) throw new ApiError('Indica el método de pago.')
  const cambios = { estado }
  if (estado === 'Entregado y pagado') Object.assign(cambios, { metodoPago, fechaPago: hoy() })
  return (await expandirPedidos([await patch(`/pedidos/${id}/`, cambios)]))[0]
}

export const cancelarPedido = (id) => cambiarEstadoPedido(id, 'Cancelado')

/* ===========================================================================
 * Tareas
 * ========================================================================= */

export const CATEGORIAS_TAREA = ['Limpieza', 'Toallas', 'Reposición de stock', 'Mantenimiento de herramientas']
export const PRIORIDADES = ['Alta', 'Media', 'Baja']
export const RECURRENCIAS = ['Única', 'Diaria', 'Semanal']

const pesoPrioridad = { Alta: 0, Media: 1, Baja: 2 }

async function expandirTareas(tareas) {
  const [empleados, productos] = await Promise.all([get('/empleados/'), get('/productos/')])
  const E = porId(empleados), P = porId(productos)
  return tareas.map((t) => {
    const r = E[t.responsableId], p = t.productoId ? P[t.productoId] : null
    return {
      ...t,
      vencida: t.estado !== 'Completada' && t.fechaLimite < hoy(),
      responsable: r ? { id: r.id, nombre: r.nombre } : null,
      producto: p ? { id: p.id, nombre: p.nombre, stock: p.stock } : null,
    }
  })
}

export async function getTareas({ responsableId, estado } = {}) {
  const lista = await expandirTareas(await get('/tareas/', { responsableId, estado }))
  return lista.sort(
    (a, b) => pesoPrioridad[a.prioridad] - pesoPrioridad[b.prioridad] || a.fechaLimite.localeCompare(b.fechaLimite),
  )
}

export async function crearTarea(data) {
  const t = await post('/tareas/', { estado: 'Pendiente', observacion: '', productoId: null, ...data })
  return (await expandirTareas([t]))[0]
}

export async function actualizarTarea(id, cambios) {
  return (await expandirTareas([await patch(`/tareas/${id}/`, cambios)]))[0]
}

/** Completa la tarea y, si es recurrente, crea la siguiente ocurrencia. */
export async function completarTarea(id, observacion = '') {
  const t = await patch(`/tareas/${id}/`, { estado: 'Completada', observacion, completadaEn: hoy() })
  let siguiente = null
  if (t.recurrencia !== 'Única') {
    const dias = t.recurrencia === 'Diaria' ? 1 : 7
    const base = t.fechaLimite > hoy() ? t.fechaLimite : hoy()
    siguiente = await post('/tareas/', {
      titulo: t.titulo, categoria: t.categoria, responsableId: t.responsableId, prioridad: t.prioridad,
      recurrencia: t.recurrencia, productoId: t.productoId, fechaLimite: sumarDias(base, dias),
    })
  }
  const [tarea, sig] = await expandirTareas(siguiente ? [t, siguiente] : [t])
  return { tarea, siguiente: sig ?? null }
}

export async function crearTareaReposicion(productoId, responsableId) {
  const producto = await getProducto(productoId)
  return crearTarea({
    titulo: `Reponer ${producto.nombre}`,
    categoria: 'Reposición de stock',
    responsableId,
    prioridad: producto.stock === 0 ? 'Alta' : 'Media',
    fechaLimite: sumarDias(hoy(), 1),
    recurrencia: 'Única',
    productoId,
  })
}

/* ===========================================================================
 * Autenticación
 * ========================================================================= */

/** Cuentas de demostración creadas por database/02_datos.sql (contraseña: demo123). */
const CUENTAS_DEMO = {
  admin: 'carla@lumina.bo',
  empleado: 'rodrigo@lumina.bo',
  cliente: 'valeria.quispe@gmail.com',
}

export async function login(correo, password) {
  if (!correo || !password) throw new ApiError('Ingresa tu correo y contraseña.')
  return post('/auth/login/', { correo, password })
}

export const loginDemo = (rol) => login(CUENTAS_DEMO[rol], 'demo123')

export const registro = ({ nombre, telefono, correo, password }) =>
  post('/auth/registro/', { nombre, telefono, correo, password })

/* ===========================================================================
 * Reportes (se calculan en el navegador a partir de la API)
 * ========================================================================= */

async function datosReportes(desde, hasta) {
  const [citas, walkins, pedidos] = await Promise.all([
    get('/citas/', { desde, hasta }), get('/walkins/', { desde, hasta }), get('/pedidos/'),
  ])
  return { citas, walkins, pedidos }
}

function ingresosDelDia(fecha, { citas, walkins, pedidos }) {
  const servicios = citas.filter((c) => c.fecha === fecha && c.estado === 'Completada').reduce((a, c) => a + c.precio, 0)
  const sinCita = walkins.filter((w) => w.fecha === fecha).reduce((a, w) => a + w.precio, 0)
  const productos = pedidos.filter((p) => p.fechaPago === fecha).reduce((a, p) => a + p.total, 0)
  return { servicios: servicios + sinCita, productos, total: servicios + sinCita + productos }
}

export async function getResumenDashboard() {
  const h = hoy()
  const [datos, tareas, productos] = await Promise.all([datosReportes(h, h), get('/tareas/'), get('/productos/')])
  const citasHoy = datos.citas.filter((c) => c.estado !== 'Cancelada')
  return {
    citasHoy: citasHoy.length,
    citasPendientesHoy: citasHoy.filter((c) => ['Pendiente', 'Confirmada'].includes(c.estado)).length,
    walkinsHoy: datos.walkins.length,
    ingresosHoy: ingresosDelDia(h, datos).total,
    pedidosPendientes: datos.pedidos.filter((p) => ['Pendiente', 'Listo para recoger'].includes(p.estado)).length,
    tareasVencidas: tareas.filter((t) => t.estado !== 'Completada' && t.fechaLimite < h).length,
    stockBajo: productos.filter((p) => p.stock <= p.stockMinimo).length,
  }
}

export async function getIngresosSemana() {
  const h = hoy()
  const datos = await datosReportes(sumarDias(h, -6), h)
  return Array.from({ length: 7 }, (_, i) => {
    const fecha = sumarDias(h, i - 6)
    return { fecha, ...ingresosDelDia(fecha, datos) }
  })
}

export async function getCaja(fecha = hoy()) {
  const [datos, servicios, empleados, clientes] = await Promise.all([
    datosReportes(fecha, fecha), get('/servicios/'), get('/empleados/'), get('/clientes/'),
  ])
  const S = porId(servicios), E = porId(empleados), C = porId(clientes)
  const pagados = datos.pedidos.filter((p) => p.fechaPago === fecha)

  const movimientos = [
    ...datos.citas
      .filter((c) => c.estado === 'Completada')
      .map((c) => ({ id: `C-${c.id}`, tipo: 'Servicio con cita', hora: c.horaInicio, concepto: S[c.servicioId]?.nombre,
        detalle: `${C[c.clienteId]?.nombre} · ${E[c.empleadoId]?.nombre}`, monto: c.precio, metodo: 'En caja' })),
    ...datos.walkins.map((w) => ({ id: `W-${w.id}`, tipo: 'Servicio sin cita', hora: w.horaInicio,
      concepto: S[w.servicioId]?.nombre, detalle: `${w.clienteNombre} · ${E[w.empleadoId]?.nombre}`,
      monto: w.precio, metodo: 'En caja' })),
    ...pagados.map((p) => ({ id: `P-${p.id}`, tipo: 'Productos', hora: p.horaCreacion, concepto: `Pedido ${p.id}`,
      detalle: C[p.clienteId]?.nombre, monto: p.total, metodo: p.metodoPago })),
  ].sort((a, b) => a.hora.localeCompare(b.hora))

  const porMetodo = pagados.reduce((acc, p) => ({ ...acc, [p.metodoPago]: (acc[p.metodoPago] ?? 0) + p.total }), {})
  return { fecha, ...ingresosDelDia(fecha, datos), porMetodo, movimientos }
}
