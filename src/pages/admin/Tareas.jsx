import { useEffect, useMemo, useState } from 'react'
import { ClipboardList, Plus } from 'lucide-react'
import {
  AsyncBoundary, Avatar, Button, EmptyState, Field, Input, Modal, PageHeader, Select, Skeleton, SkeletonList,
} from '../../components/ui'
import { TareaItem } from '../../components/tasks/TareaItem'
import { useAccion, useResource } from '../../hooks/useResource'
import { CATEGORIAS_TAREA, PRIORIDADES, RECURRENCIAS, crearTarea, getEmpleados, getProductos, getTareas } from '../../services'
import { hoy } from '../../utils/fecha'
import { cn } from '../../utils/format'

export default function Tareas() {
  const tareas = useResource(() => getTareas(), [])
  const empleados = useResource(() => getEmpleados(), [])
  const [filtros, setFiltros] = useState({ responsableId: '', estado: 'abiertas' })
  const [nueva, setNueva] = useState(false)

  const progreso = useMemo(() => {
    if (!tareas.data || !empleados.data) return []
    // Progreso del día: tareas que vencen hoy o antes y siguen abiertas + las completadas hoy.
    return empleados.data.map((e) => {
      const suyas = tareas.data.filter((t) => t.responsableId === e.id)
      const hechas = suyas.filter((t) => t.estado === 'Completada' && t.completadaEn === hoy()).length
      const abiertas = suyas.filter((t) => t.estado !== 'Completada' && t.fechaLimite <= hoy()).length
      const vencidas = suyas.filter((t) => t.vencida).length
      return { empleado: e, hechas, total: hechas + abiertas, vencidas }
    })
  }, [tareas.data, empleados.data])

  const set = (k) => (e) => setFiltros((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Tareas"
        description="Limpieza, toallas, reposición y mantenimiento. Las recurrentes se renuevan solas."
        actions={<Button icon={Plus} onClick={() => setNueva(true)}>Nueva tarea</Button>}
      />

      <section aria-labelledby="progreso">
        <h2 id="progreso" className="mb-3 text-2xl font-medium">Progreso de hoy por empleado</h2>
        {!progreso.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-card" />)}</div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {progreso.map(({ empleado: e, hechas, total, vencidas }) => {
              const pct = total ? Math.round((hechas / total) * 100) : 100
              return (
                <li key={e.id}>
                  <button
                    onClick={() => setFiltros((f) => ({ ...f, responsableId: f.responsableId === e.id ? '' : e.id }))}
                    aria-pressed={filtros.responsableId === e.id}
                    className={cn(
                      'flex w-full flex-col gap-3 rounded-card border bg-surface p-4 text-left transition-colors',
                      filtros.responsableId === e.id ? 'border-ink ring-1 ring-ink' : 'border-line hover:border-line-strong',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar nombre={e.nombre} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{e.nombre}</p>
                        <p className="tabular text-xs text-ink-muted">
                          {hechas} de {total} hechas{vencidas ? ` · ${vencidas} vencida${vencidas > 1 ? 's' : ''}` : ''}
                        </p>
                      </div>
                      <span className="tabular text-sm font-medium">{pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-stone" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso de ${e.nombre}`}>
                      <div className={cn('h-full rounded-full transition-[width] duration-500', vencidas ? 'bg-warning' : 'bg-accent')} style={{ width: `${pct}%` }} />
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="lista-tareas" className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="lista-tareas" className="text-2xl font-medium">Todas las tareas</h2>
          <div className="grid grid-cols-2 gap-2 sm:w-[420px]">
            <Select aria-label="Responsable" value={filtros.responsableId} onChange={set('responsableId')}>
              <option value="">Todo el equipo</option>
              {empleados.data?.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </Select>
            <Select aria-label="Estado" value={filtros.estado} onChange={set('estado')}>
              <option value="abiertas">Abiertas</option>
              <option value="vencidas">Vencidas</option>
              <option value="Completada">Completadas</option>
              <option value="">Todas</option>
            </Select>
          </div>
        </div>
        <AsyncBoundary resource={tareas} skeleton={<SkeletonList rows={5} />}>
          {(data) => {
            const lista = data.filter(
              (t) =>
                (!filtros.responsableId || t.responsableId === filtros.responsableId) &&
                (filtros.estado === ''
                  ? true
                  : filtros.estado === 'abiertas'
                    ? t.estado !== 'Completada'
                    : filtros.estado === 'vencidas'
                      ? t.vencida
                      : t.estado === filtros.estado),
            )
            return lista.length ? (
              <ul className="divide-y divide-line rounded-card border border-line bg-surface">
                {lista.map((t) => <TareaItem key={t.id} tarea={t} mostrarResponsable />)}
              </ul>
            ) : (
              <EmptyState icon={ClipboardList} title="Sin tareas con estos filtros" />
            )
          }}
        </AsyncBoundary>
      </section>

      <NuevaTareaModal open={nueva} onClose={() => setNueva(false)} empleados={empleados.data ?? []} />
    </div>
  )
}

const VACIO = { titulo: '', categoria: 'Limpieza', responsableId: '', prioridad: 'Media', fechaLimite: hoy(), recurrencia: 'Única', productoId: '' }

function NuevaTareaModal({ open, onClose, empleados }) {
  const productos = useResource(() => getProductos(), [])
  const [form, setForm] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const { ejecutar, pendiente } = useAccion()

  useEffect(() => {
    if (open) {
      setForm({ ...VACIO, fechaLimite: hoy() })
      setErrores({})
    }
  }, [open])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const guardar = async () => {
    const errs = {}
    if (!form.titulo.trim()) errs.titulo = 'Describe la tarea.'
    if (!form.responsableId) errs.responsableId = 'Asigna un responsable.'
    setErrores(errs)
    if (Object.keys(errs).length) return
    const r = await ejecutar(() => crearTarea({ ...form, titulo: form.titulo.trim(), productoId: form.productoId || null }), { exito: 'Tarea creada y asignada.' })
    if (r.ok) onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva tarea"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={guardar} loading={pendiente != null}>Crear tarea</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tarea" error={errores.titulo} className="sm:col-span-2">
          <Input value={form.titulo} onChange={set('titulo')} placeholder="Ejemplo: lavar toallas de la zona de lavado" />
        </Field>
        <Field label="Categoría">
          <Select value={form.categoria} onChange={set('categoria')}>{CATEGORIAS_TAREA.map((c) => <option key={c}>{c}</option>)}</Select>
        </Field>
        <Field label="Responsable" error={errores.responsableId}>
          <Select value={form.responsableId} onChange={set('responsableId')}>
            <option value="">Elige a alguien</option>
            {empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </Select>
        </Field>
        <Field label="Prioridad">
          <Select value={form.prioridad} onChange={set('prioridad')}>{PRIORIDADES.map((p) => <option key={p}>{p}</option>)}</Select>
        </Field>
        <Field label="Fecha límite">
          <Input type="date" min={hoy()} value={form.fechaLimite} onChange={set('fechaLimite')} />
        </Field>
        <Field label="Recurrencia" hint={form.recurrencia !== 'Única' ? 'Al completarla se crea la siguiente.' : undefined}>
          <Select value={form.recurrencia} onChange={set('recurrencia')}>{RECURRENCIAS.map((r) => <option key={r}>{r}</option>)}</Select>
        </Field>
        <Field label="Producto vinculado" hint="Opcional, para tareas de reposición.">
          <Select value={form.productoId} onChange={set('productoId')}>
            <option value="">Ninguno</option>
            {productos.data?.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </Select>
        </Field>
      </div>
    </Modal>
  )
}

