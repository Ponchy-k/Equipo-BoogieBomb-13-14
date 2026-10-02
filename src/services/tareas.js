// Tareas operativas del local.
import { clone, db, delay, nuevoId, persistir } from './api'
import { hoy, sumarDias } from '../utils/fecha'

export const CATEGORIAS_TAREA = ['Limpieza', 'Toallas', 'Reposición de stock', 'Mantenimiento de herramientas']
export const PRIORIDADES = ['Alta', 'Media', 'Baja']
export const RECURRENCIAS = ['Única', 'Diaria', 'Semanal']

function expandir(t) {
  const responsable = db.empleados.find((e) => e.id === t.responsableId)
  const producto = t.productoId ? db.productos.find((p) => p.id === t.productoId) : null
  return {
    ...clone(t),
    vencida: t.estado !== 'Completada' && t.fechaLimite < hoy(),
    responsable: responsable ? { id: responsable.id, nombre: responsable.nombre } : null,
    producto: producto ? { id: producto.id, nombre: producto.nombre, stock: producto.stock } : null,
  }
}

const pesoPrioridad = { Alta: 0, Media: 1, Baja: 2 }

// API: GET /api/tareas/?responsable=&estado=
export async function getTareas({ responsableId, estado } = {}) {
  await delay()
  return db.tareas
    .filter((t) => (!responsableId || t.responsableId === responsableId) && (!estado || t.estado === estado))
    .map(expandir)
    .sort(
      (a, b) =>
        pesoPrioridad[a.prioridad] - pesoPrioridad[b.prioridad] || a.fechaLimite.localeCompare(b.fechaLimite),
    )
}

// API: POST /api/tareas/
export async function crearTarea(data) {
  await delay(350)
  const tarea = { estado: 'Pendiente', observacion: '', productoId: null, ...data, id: nuevoId('T') }
  db.tareas.push(tarea)
  persistir()
  return expandir(tarea)
}

// API: PATCH /api/tareas/:id/
export async function actualizarTarea(id, cambios) {
  await delay(250)
  const t = db.tareas.find((x) => x.id === id)
  Object.assign(t, cambios)
  persistir()
  return expandir(t)
}

/**
 * API: POST /api/tareas/:id/completar/   body: { observacion }
 * Si la tarea es recurrente, el backend genera la siguiente ocurrencia.
 */
export async function completarTarea(id, observacion = '') {
  await delay(300)
  const t = db.tareas.find((x) => x.id === id)
  t.estado = 'Completada'
  t.observacion = observacion
  t.completadaEn = hoy()

  let siguiente = null
  if (t.recurrencia !== 'Única') {
    const dias = t.recurrencia === 'Diaria' ? 1 : 7
    const base = t.fechaLimite > hoy() ? t.fechaLimite : hoy()
    siguiente = {
      ...t,
      id: nuevoId('T'),
      estado: 'Pendiente',
      observacion: '',
      completadaEn: undefined,
      fechaLimite: sumarDias(base, dias),
    }
    db.tareas.push(siguiente)
  }
  persistir()
  return { tarea: expandir(t), siguiente: siguiente ? expandir(siguiente) : null }
}

/** Atajo desde inventario: crea una tarea de reposición para un producto. */
export async function crearTareaReposicion(productoId, responsableId) {
  const producto = db.productos.find((p) => p.id === productoId)
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
