// Clientes y su historial.
import { ApiError, clone, db, delay, nuevoId, persistir } from './api'
import { hoy } from '../utils/fecha'

// API: GET /api/clientes/?q=
export async function getClientes({ q = '' } = {}) {
  await delay()
  const texto = q.trim().toLowerCase()
  return clone(
    db.clientes
      .filter((c) => !texto || `${c.nombre} ${c.telefono} ${c.correo}`.toLowerCase().includes(texto))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
      .map((c) => ({
        ...c,
        totalCitas: db.citas.filter((x) => x.clienteId === c.id && x.estado === 'Completada').length,
        ultimaVisita: db.citas
          .filter((x) => x.clienteId === c.id && x.estado === 'Completada')
          .map((x) => x.fecha)
          .sort()
          .at(-1) ?? null,
      })),
  )
}

/** API: GET /api/clientes/:id/  (incluye historial de citas y compras) */
export async function getCliente(id) {
  await delay()
  const cliente = db.clientes.find((c) => c.id === id)
  if (!cliente) throw new ApiError('Cliente no encontrado')

  const citas = db.citas
    .filter((c) => c.clienteId === id)
    .sort((a, b) => (b.fecha + b.horaInicio).localeCompare(a.fecha + a.horaInicio))
    .map((c) => ({
      ...c,
      servicio: db.servicios.find((s) => s.id === c.servicioId)?.nombre,
      empleado: db.empleados.find((e) => e.id === c.empleadoId)?.nombre,
    }))
  const pedidos = db.pedidos.filter((p) => p.clienteId === id).sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))
  const gastoServicios = citas.filter((c) => c.estado === 'Completada').reduce((a, c) => a + c.precio, 0)
  const gastoProductos = pedidos.filter((p) => p.estado === 'Entregado y pagado').reduce((a, p) => a + p.total, 0)

  return clone({ ...cliente, citas, pedidos, gastoServicios, gastoProductos })
}

// API: POST /api/clientes/  (registro desde la web)
export async function registrarCliente({ nombre, telefono, correo }) {
  await delay(400)
  if (db.clientes.some((c) => c.correo.toLowerCase() === correo.toLowerCase())) {
    throw new ApiError('Ya existe una cuenta con ese correo.')
  }
  const cliente = { id: nuevoId('c'), nombre, telefono, correo, notas: '', inasistencias: 0, registradoEn: hoy() }
  db.clientes.push(cliente)
  persistir()
  return clone(cliente)
}

// API: PATCH /api/clientes/:id/
export async function actualizarCliente(id, cambios) {
  await delay(350)
  const c = db.clientes.find((x) => x.id === id)
  Object.assign(c, cambios)
  persistir()
  return clone(c)
}

export async function buscarClientePorCorreo(correo) {
  await delay(150)
  return clone(db.clientes.find((c) => c.correo.toLowerCase() === correo.toLowerCase()) ?? null)
}
