// Punto único de entrada a los datos. Los componentes importan SOLO desde aquí.
//
// Elige de dónde salen los datos:
//   - Backend Django (services/remoto.js): por defecto con `npm run dev`.
//   - Mocks en el navegador (services/mock.js): por defecto en el build de
//     GitHub Pages, porque ahí no hay servidor.
// Se puede forzar con VITE_USE_API=true / false en un archivo .env.local
import * as mock from './mock'
import * as remoto from './remoto'

export const USA_API = (import.meta.env.VITE_USE_API ?? (import.meta.env.DEV ? 'true' : 'false')) === 'true'

const impl = USA_API ? remoto : mock

export const {
  getCitas,
  getCita,
  getDisponibilidad,
  crearCita,
  actualizarCita,
  cambiarEstadoCita,
  cancelarCita,
  getWalkins,
  registrarWalkin,
  ESTADOS_PEDIDO,
  getPedidos,
  crearPedido,
  cambiarEstadoPedido,
  cancelarPedido,
  login,
  loginDemo,
  registro,
  getClientes,
  getCliente,
  registrarCliente,
  actualizarCliente,
  buscarClientePorCorreo,
  CATEGORIAS_TAREA,
  PRIORIDADES,
  RECURRENCIAS,
  getTareas,
  crearTarea,
  actualizarTarea,
  completarTarea,
  crearTareaReposicion,
  getServicios,
  getServicio,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  getEmpleados,
  getEmpleado,
  crearEmpleado,
  actualizarEmpleado,
  actualizarEstadoEmpleado,
  eliminarEmpleado,
  getProductos,
  getProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  getSalon,
  getGaleria,
  getResumenDashboard,
  getIngresosSemana,
  getCaja,
  restablecerDatos,
} = impl
