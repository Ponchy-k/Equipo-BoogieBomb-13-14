// Servicios, empleados, productos e información del salón.
import { salon, galeria } from '../mocks/salon'
import { ApiError, clone, db, delay, nuevoId, persistir } from './api'

/* ---------- Servicios ---------- */

// API: GET /api/servicios/?categoria=
export async function getServicios({ categoria, incluirInactivos = false } = {}) {
  await delay()
  return clone(
    db.servicios.filter(
      (s) => (incluirInactivos || s.activo) && (!categoria || categoria === 'Todos' || s.categoria === categoria),
    ),
  )
}

// API: GET /api/servicios/:id/
export async function getServicio(id) {
  await delay(150)
  const s = db.servicios.find((x) => x.id === id)
  if (!s) throw new ApiError('Servicio no encontrado')
  return clone(s)
}

// API: POST /api/servicios/
export async function crearServicio(data) {
  await delay()
  const servicio = { ...data, id: nuevoId('s'), activo: true }
  db.servicios.push(servicio)
  persistir()
  return clone(servicio)
}

// API: PATCH /api/servicios/:id/
export async function actualizarServicio(id, cambios) {
  await delay()
  const s = db.servicios.find((x) => x.id === id)
  Object.assign(s, cambios)
  persistir()
  return clone(s)
}

// API: DELETE /api/servicios/:id/ (baja lógica: las citas antiguas lo siguen referenciando)
export async function eliminarServicio(id) {
  await delay()
  const s = db.servicios.find((x) => x.id === id)
  s.activo = false
  db.empleados.forEach((e) => (e.servicioIds = e.servicioIds.filter((x) => x !== id)))
  persistir()
}

/* ---------- Empleados ---------- */

// API: GET /api/empleados/
export async function getEmpleados({ incluirInactivos = false, servicioId, estado } = {}) {
  await delay()
  return clone(
    db.empleados.filter(
      (e) =>
        (incluirInactivos || e.activo) &&
        (!servicioId || e.servicioIds.includes(servicioId)) &&
        (!estado || e.estado === estado),
    ),
  )
}

// API: GET /api/empleados/:id/
export async function getEmpleado(id) {
  await delay(150)
  const e = db.empleados.find((x) => x.id === id)
  if (!e) throw new ApiError('Empleado no encontrado')
  return clone(e)
}

// API: POST /api/empleados/
export async function crearEmpleado(data) {
  await delay()
  const empleado = { estado: 'Disponible', ...data, id: nuevoId('e'), activo: true }
  db.empleados.push(empleado)
  persistir()
  return clone(empleado)
}

// API: PATCH /api/empleados/:id/
export async function actualizarEmpleado(id, cambios) {
  await delay()
  const e = db.empleados.find((x) => x.id === id)
  Object.assign(e, cambios)
  persistir()
  return clone(e)
}

// API: PATCH /api/empleados/:id/estado/
export async function actualizarEstadoEmpleado(id, estado) {
  return actualizarEmpleado(id, { estado })
}

// API: DELETE /api/empleados/:id/ (baja lógica)
export async function eliminarEmpleado(id) {
  await delay()
  db.empleados.find((x) => x.id === id).activo = false
  persistir()
}

/* ---------- Productos ---------- */

// API: GET /api/productos/?q=&categoria=&marca=&precio_min=&precio_max=
export async function getProductos({ q = '', categoria, marca, precioMin, precioMax, soloDestacados } = {}) {
  await delay()
  const texto = q.trim().toLowerCase()
  return clone(
    db.productos.filter(
      (p) =>
        !p.eliminado &&
        (!texto || `${p.nombre} ${p.marca}`.toLowerCase().includes(texto)) &&
        (!categoria || p.categoria === categoria) &&
        (!marca || p.marca === marca) &&
        (precioMin == null || precioMin === '' || p.precio >= Number(precioMin)) &&
        (precioMax == null || precioMax === '' || p.precio <= Number(precioMax)) &&
        (!soloDestacados || p.destacado),
    ),
  )
}

// API: GET /api/productos/:id/
export async function getProducto(id) {
  await delay(200)
  const p = db.productos.find((x) => x.id === id && !x.eliminado)
  if (!p) throw new ApiError('Producto no encontrado')
  return clone(p)
}

// API: POST /api/productos/
export async function crearProducto(data) {
  await delay()
  const producto = { destacado: false, tono: db.productos.length % 6, ...data, id: nuevoId('p') }
  db.productos.push(producto)
  persistir()
  return clone(producto)
}

// API: PATCH /api/productos/:id/
export async function actualizarProducto(id, cambios) {
  await delay()
  const p = db.productos.find((x) => x.id === id)
  Object.assign(p, cambios)
  persistir()
  return clone(p)
}

// API: DELETE /api/productos/:id/
export async function eliminarProducto(id) {
  await delay()
  db.productos.find((x) => x.id === id).eliminado = true
  persistir()
}

/* ---------- Salón ---------- */

// API: GET /api/salon/
export async function getSalon() {
  await delay(100)
  return clone(salon)
}

// API: GET /api/galeria/
export async function getGaleria() {
  await delay()
  return clone(galeria)
}
