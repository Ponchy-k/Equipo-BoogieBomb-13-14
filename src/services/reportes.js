// Indicadores para el dashboard y la caja del día.
import { clone, db, delay } from './api'
import { hoy, sumarDias } from '../utils/fecha'

const ingresosDelDia = (fecha) => {
  const servicios = db.citas.filter((c) => c.fecha === fecha && c.estado === 'Completada').reduce((a, c) => a + c.precio, 0)
  const walkins = db.walkins.filter((w) => w.fecha === fecha).reduce((a, w) => a + w.precio, 0)
  const productos = db.pedidos.filter((p) => p.fechaPago === fecha).reduce((a, p) => a + p.total, 0)
  return { servicios: servicios + walkins, productos, total: servicios + walkins + productos }
}

// API: GET /api/reportes/resumen/
export async function getResumenDashboard() {
  await delay(350)
  const h = hoy()
  const citasHoy = db.citas.filter((c) => c.fecha === h && c.estado !== 'Cancelada')
  return {
    citasHoy: citasHoy.length,
    citasPendientesHoy: citasHoy.filter((c) => ['Pendiente', 'Confirmada'].includes(c.estado)).length,
    walkinsHoy: db.walkins.filter((w) => w.fecha === h).length,
    ingresosHoy: ingresosDelDia(h).total,
    pedidosPendientes: db.pedidos.filter((p) => ['Pendiente', 'Listo para recoger'].includes(p.estado)).length,
    tareasVencidas: db.tareas.filter((t) => t.estado !== 'Completada' && t.fechaLimite < h).length,
    stockBajo: db.productos.filter((p) => !p.eliminado && p.stock <= p.stockMinimo).length,
  }
}

// API: GET /api/reportes/ingresos-semana/
export async function getIngresosSemana() {
  await delay(400)
  const h = hoy()
  return Array.from({ length: 7 }, (_, i) => {
    const fecha = sumarDias(h, i - 6)
    return { fecha, ...ingresosDelDia(fecha) }
  })
}

// API: GET /api/caja/?fecha=
export async function getCaja(fecha = hoy()) {
  await delay(350)
  const servicio = (id) => db.servicios.find((s) => s.id === id)?.nombre
  const empleado = (id) => db.empleados.find((e) => e.id === id)?.nombre
  const cliente = (id) => db.clientes.find((c) => c.id === id)?.nombre

  const movimientos = [
    ...db.citas
      .filter((c) => c.fecha === fecha && c.estado === 'Completada')
      .map((c) => ({ id: c.id, tipo: 'Servicio con cita', hora: c.horaInicio, concepto: servicio(c.servicioId),
        detalle: `${cliente(c.clienteId)} · ${empleado(c.empleadoId)}`, monto: c.precio, metodo: 'En caja' })),
    ...db.walkins
      .filter((w) => w.fecha === fecha)
      .map((w) => ({ id: w.id, tipo: 'Servicio sin cita', hora: w.horaInicio, concepto: servicio(w.servicioId),
        detalle: `${w.clienteNombre} · ${empleado(w.empleadoId)}`, monto: w.precio, metodo: 'En caja' })),
    ...db.pedidos
      .filter((p) => p.fechaPago === fecha)
      .map((p) => ({ id: p.id, tipo: 'Productos', hora: p.horaCreacion, concepto: `Pedido ${p.id}`,
        detalle: cliente(p.clienteId), monto: p.total, metodo: p.metodoPago })),
  ].sort((a, b) => a.hora.localeCompare(b.hora))

  const porMetodo = db.pedidos
    .filter((p) => p.fechaPago === fecha)
    .reduce((acc, p) => ({ ...acc, [p.metodoPago]: (acc[p.metodoPago] ?? 0) + p.total }), {})

  return clone({ fecha, ...ingresosDelDia(fecha), porMetodo, movimientos })
}
