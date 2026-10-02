// Pedidos de la tienda. El pago es presencial al recoger.
import { ApiError, clone, db, delay, nuevoId, persistir } from './api'
import { ahora, hoy, sumarDias } from '../utils/fecha'

export const ESTADOS_PEDIDO = ['Pendiente', 'Listo para recoger', 'Entregado y pagado', 'Cancelado', 'Expirado']
const ACTIVOS = ['Pendiente', 'Listo para recoger']

/** Devuelve el stock reservado si el pedido deja de estar activo. */
function liberarStock(pedido) {
  pedido.items.forEach((i) => {
    const p = db.productos.find((x) => x.id === i.productoId)
    if (p) p.stock += i.cantidad
  })
}

/** Simula la tarea programada del backend que vence pedidos de más de 48 h. */
function vencerPedidos() {
  let cambio = false
  db.pedidos.forEach((p) => {
    if (ACTIVOS.includes(p.estado) && p.expiraEl < hoy()) {
      p.estado = 'Expirado'
      liberarStock(p)
      cambio = true
    }
  })
  if (cambio) persistir()
}

function expandir(p) {
  const cliente = db.clientes.find((c) => c.id === p.clienteId)
  return { ...clone(p), cliente: cliente ? { id: cliente.id, nombre: cliente.nombre, telefono: cliente.telefono } : null }
}

// API: GET /api/pedidos/?cliente=&estado=
export async function getPedidos({ clienteId, estado } = {}) {
  await delay()
  vencerPedidos()
  return db.pedidos
    .filter((p) => (!clienteId || p.clienteId === clienteId) && (!estado || p.estado === estado))
    .sort((a, b) => (b.fechaCreacion + b.horaCreacion).localeCompare(a.fechaCreacion + a.horaCreacion))
    .map(expandir)
}

// API: POST /api/pedidos/
export async function crearPedido({ clienteId, items }) {
  await delay(500)
  if (!items.length) throw new ApiError('El carrito está vacío.')
  for (const i of items) {
    const p = db.productos.find((x) => x.id === i.productoId)
    if (!p || p.stock < i.cantidad) throw new ApiError(`No hay stock suficiente de "${i.nombre}".`)
  }
  items.forEach((i) => (db.productos.find((x) => x.id === i.productoId).stock -= i.cantidad))

  const fecha = hoy()
  const pedido = {
    id: nuevoId('P'),
    clienteId,
    items: items.map(({ productoId, nombre, precio, cantidad }) => ({ productoId, nombre, precio, cantidad })),
    total: items.reduce((a, i) => a + i.precio * i.cantidad, 0),
    estado: 'Pendiente',
    fechaCreacion: fecha,
    horaCreacion: ahora(),
    expiraEl: sumarDias(fecha, 2),
    fechaPago: null,
    metodoPago: null,
  }
  db.pedidos.push(pedido)
  persistir()
  return expandir(pedido)
}

// API: POST /api/pedidos/:id/estado/   body: { estado, metodo_pago? }
export async function cambiarEstadoPedido(id, estado, { metodoPago } = {}) {
  await delay(300)
  const pedido = db.pedidos.find((p) => p.id === id)
  if (estado === 'Entregado y pagado' && !metodoPago) throw new ApiError('Indica el método de pago.')
  if (['Cancelado', 'Expirado'].includes(estado) && ACTIVOS.includes(pedido.estado)) liberarStock(pedido)
  pedido.estado = estado
  if (estado === 'Entregado y pagado') {
    pedido.metodoPago = metodoPago
    pedido.fechaPago = hoy()
  }
  persistir()
  return expandir(pedido)
}

export async function cancelarPedido(id) {
  return cambiarEstadoPedido(id, 'Cancelado')
}
