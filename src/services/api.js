/**
 * Capa de acceso a datos.
 *
 * HOY: los servicios leen y escriben sobre una "base de datos" en memoria
 * inicializada desde src/mocks y guardada en localStorage, para que la demo
 * sobreviva a una recarga.
 *
 * MAÑANA (Django REST): reemplazar el cuerpo de cada función de services/*.js
 * por una llamada a `request()`, por ejemplo:
 *
 *   export async function getServicios() {
 *     return request('/servicios/')
 *   }
 *
 * Los componentes no cambian porque solo conocen estas funciones.
 */
import { servicios } from '../mocks/servicios'
import { empleados } from '../mocks/empleados'
import { clientes } from '../mocks/clientes'
import { productos } from '../mocks/productos'
import { generarCitas } from '../mocks/citas'
import { generarPedidos, generarTareas, generarWalkins } from '../mocks/operacion'
import { hoy } from '../utils/fecha'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

/** Cliente HTTP listo para cuando exista el backend. */
export async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const detalle = await res.json().catch(() => ({}))
    throw new Error(detalle.detail ?? `Error ${res.status}`)
  }
  return res.status === 204 ? null : res.json()
}

/** Retraso simulado de red. */
export const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export const clone = (x) => structuredClone(x)

const STORAGE_KEY = 'lumina:db:v1'

function semilla() {
  return {
    fecha: hoy(),
    servicios: clone(servicios),
    empleados: clone(empleados),
    clientes: clone(clientes),
    productos: clone(productos),
    citas: generarCitas(),
    walkins: generarWalkins(),
    pedidos: generarPedidos(),
    tareas: generarTareas(),
    secuencia: 5000,
  }
}

function cargar() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      // Los mocks son relativos a "hoy": si cambió el día se regeneran.
      if (data.fecha === hoy()) return data
    }
  } catch {
    /* almacenamiento no disponible: se usa la semilla en memoria */
  }
  return semilla()
}

export const db = cargar()

export function persistir() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    /* sin persistencia, la demo sigue funcionando en memoria */
  }
}

export function restablecerDatos() {
  Object.assign(db, semilla())
  persistir()
}

export function nuevoId(prefijo) {
  db.secuencia += 1
  return `${prefijo}-${db.secuencia}`
}

export class ApiError extends Error {}
