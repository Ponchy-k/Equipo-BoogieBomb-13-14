// Autenticación simulada. Reemplazar por POST /api/auth/login/ (JWT o sesión de Django).
import { usuariosDemo } from '../mocks/salon'
import { ApiError, clone, db, delay } from './api'
import { registrarCliente } from './clientes'

// API: POST /api/auth/login/   (acepta cualquier credencial en la demo)
export async function login(correo, password) {
  await delay(400)
  if (!correo || !password) throw new ApiError('Ingresa tu correo y contraseña.')
  const c = correo.toLowerCase()
  if (c.includes('admin')) return clone(usuariosDemo.admin)
  const empleado = db.empleados.find((e) => e.correo.toLowerCase() === c)
  if (empleado || c.includes('empleado')) {
    return empleado
      ? { id: `u-${empleado.id}`, nombre: empleado.nombre, correo: empleado.correo, rol: 'empleado', empleadoId: empleado.id }
      : clone(usuariosDemo.empleado)
  }
  const cliente = db.clientes.find((x) => x.correo.toLowerCase() === c)
  if (cliente) return { id: `u-${cliente.id}`, nombre: cliente.nombre, correo: cliente.correo, rol: 'cliente', clienteId: cliente.id }
  return clone(usuariosDemo.cliente)
}

export async function loginDemo(rol) {
  await delay(200)
  return clone(usuariosDemo[rol])
}

// API: POST /api/auth/registro/
export async function registro({ nombre, telefono, correo }) {
  const cliente = await registrarCliente({ nombre, telefono, correo })
  return { id: `u-${cliente.id}`, nombre: cliente.nombre, correo: cliente.correo, rol: 'cliente', clienteId: cliente.id }
}
