import { useEffect, useState } from 'react'
import { Mail, Pencil, Phone, Plus, Trash2, UserPlus, Users } from 'lucide-react'
import {
  AsyncBoundary, Avatar, Button, Card, Checkbox, ConfirmDialog, EmptyState, Field, Input, Modal, PageHeader, Select,
  Skeleton, StatusBadge,
} from '../../components/ui'
import { useAccion, useResource } from '../../hooks/useResource'
import { actualizarEmpleado, crearEmpleado, eliminarEmpleado, getEmpleados, getServicios } from '../../services'
import { ESTADOS_EMPLEADO } from '../../utils/estados'
import { NOMBRES_DIA } from '../../utils/fecha'
import { cn } from '../../utils/format'

const DIAS = [1, 2, 3, 4, 5, 6, 0]

function resumenHorario(horario) {
  const trabaja = DIAS.filter((d) => horario?.[d]?.length)
  if (!trabaja.length) return 'Sin horario'
  return trabaja.map((d) => NOMBRES_DIA[d].slice(0, 3)).join(', ')
}

export default function Empleados() {
  const empleados = useResource(() => getEmpleados(), [])
  const servicios = useResource(() => getServicios(), [])
  const { ejecutar, pendiente } = useAccion()
  const [editar, setEditar] = useState(null)
  const [baja, setBaja] = useState(null)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Empleados"
        description="Datos, servicios que ofrece cada profesional y su horario semanal."
        actions={<Button icon={UserPlus} onClick={() => setEditar('nuevo')}>Nuevo empleado</Button>}
      />
      <AsyncBoundary
        resource={empleados}
        skeleton={<div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-48 rounded-card" />)}</div>}
        empty={<EmptyState icon={Users} title="Aún no hay empleados" action={<Button size="sm" onClick={() => setEditar('nuevo')}>Agregar empleado</Button>} />}
      >
        {(data) => (
          <ul className="grid gap-4 md:grid-cols-2">
            {data.map((e) => (
              <li key={e.id}>
                <Card className="flex h-full flex-col gap-4 p-5">
                  <div className="flex items-start gap-4">
                    <Avatar nombre={e.nombre} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{e.nombre}</p>
                      <p className="text-sm text-ink-muted">{e.especialidad}</p>
                      <div className="mt-2"><StatusBadge estado={e.estado} /></div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditar(e)} aria-label={`Editar a ${e.nombre}`}>
                        <Pencil className="size-4" strokeWidth={1.75} />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setBaja(e)} aria-label={`Dar de baja a ${e.nombre}`}>
                        <Trash2 className="size-4" strokeWidth={1.75} />
                      </Button>
                    </div>
                  </div>
                  <dl className="grid gap-2 text-sm">
                    <div className="flex gap-2 text-ink-muted"><Phone className="mt-0.5 size-3.5" aria-hidden="true" /><span className="tabular">{e.telefono}</span></div>
                    <div className="flex gap-2 text-ink-muted"><Mail className="mt-0.5 size-3.5" aria-hidden="true" />{e.correo}</div>
                    <div><dt className="sr-only">Días de trabajo</dt><dd className="text-ink-muted">Trabaja: <span className="text-ink">{resumenHorario(e.horario)}</span></dd></div>
                  </dl>
                  <div className="mt-auto flex flex-wrap gap-1.5 border-t border-line pt-4">
                    {e.servicioIds.map((id) => {
                      const s = servicios.data?.find((x) => x.id === id)
                      return s ? <span key={id} className="rounded-control bg-stone px-2 py-0.5 text-xs text-ink-muted">{s.nombre}</span> : null
                    })}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </AsyncBoundary>

      <EmpleadoModal valor={editar} servicios={servicios.data ?? []} onClose={() => setEditar(null)} />
      <ConfirmDialog
        open={!!baja}
        onClose={() => setBaja(null)}
        title="¿Dar de baja a este empleado?"
        description={baja ? `${baja.nombre} dejará de aparecer en reservas y agenda. Sus citas pasadas se conservan.` : ''}
        confirmLabel="Dar de baja"
        tone="danger"
        loading={pendiente != null}
        onConfirm={async () => {
          await ejecutar(() => eliminarEmpleado(baja.id), { exito: `${baja.nombre} fue dado de baja.` })
          setBaja(null)
        }}
      />
    </div>
  )
}

const HORARIO_BASE = Object.fromEntries(
  DIAS.map((d) => [d, d === 0 ? [] : d === 6 ? [{ inicio: '09:00', fin: '15:00' }] : [{ inicio: '09:00', fin: '13:00' }, { inicio: '14:00', fin: '19:00' }]]),
)
const VACIO = { nombre: '', especialidad: 'Estilista', telefono: '', correo: '', estado: 'Disponible', servicioIds: [], horario: HORARIO_BASE }

function EmpleadoModal({ valor, servicios, onClose }) {
  const editando = valor && valor !== 'nuevo'
  const [form, setForm] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const { ejecutar, pendiente } = useAccion()

  useEffect(() => {
    if (!valor) return
    setErrores({})
    setForm(editando ? structuredClone({ ...VACIO, ...valor }) : structuredClone(VACIO))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggleServicio = (id) =>
    setForm((f) => ({ ...f, servicioIds: f.servicioIds.includes(id) ? f.servicioIds.filter((x) => x !== id) : [...f.servicioIds, id] }))

  const setTurnos = (dia, turnos) => setForm((f) => ({ ...f, horario: { ...f.horario, [dia]: turnos } }))

  const guardar = async () => {
    const errs = {}
    if (!form.nombre.trim()) errs.nombre = 'Escribe el nombre.'
    if (!/^\S+@\S+\.\S+$/.test(form.correo)) errs.correo = 'Correo no válido.'
    if (!form.servicioIds.length) errs.servicios = 'Elige al menos un servicio.'
    const malTurno = DIAS.some((d) => (form.horario[d] ?? []).some((t) => t.inicio >= t.fin))
    if (malTurno) errs.horario = 'Cada turno debe terminar después de empezar.'
    setErrores(errs)
    if (Object.keys(errs).length) return
    const { id, activo, ...datos } = form
    const r = editando
      ? await ejecutar(() => actualizarEmpleado(valor.id, datos), { exito: 'Empleado actualizado.' })
      : await ejecutar(() => crearEmpleado(datos), { exito: 'Empleado creado.' })
    if (r.ok) onClose()
  }

  return (
    <Modal
      open={!!valor}
      onClose={onClose}
      size="lg"
      title={editando ? 'Editar empleado' : 'Nuevo empleado'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={guardar} loading={pendiente != null}>Guardar</Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre completo" error={errores.nombre} className="sm:col-span-2">
            <Input value={form.nombre} onChange={set('nombre')} />
          </Field>
          <Field label="Especialidad">
            <Select value={form.especialidad} onChange={set('especialidad')}>
              <option>Estilista</option>
              <option>Barbero</option>
            </Select>
          </Field>
          <Field label="Estado">
            <Select value={form.estado} onChange={set('estado')}>
              {ESTADOS_EMPLEADO.map((e) => <option key={e}>{e}</option>)}
            </Select>
          </Field>
          <Field label="Teléfono">
            <Input type="tel" value={form.telefono} onChange={set('telefono')} />
          </Field>
          <Field label="Correo" error={errores.correo}>
            <Input type="email" value={form.correo} onChange={set('correo')} />
          </Field>
        </div>

        <fieldset>
          <legend className="text-sm font-medium">Servicios que ofrece</legend>
          <div className="mt-2 grid gap-x-4 sm:grid-cols-2">
            {servicios.map((s) => (
              <Checkbox
                key={s.id}
                label={<span>{s.nombre} <span className="text-ink-muted">({s.categoria})</span></span>}
                checked={form.servicioIds.includes(s.id)}
                onChange={() => toggleServicio(s.id)}
              />
            ))}
          </div>
          {errores.servicios && <p className="mt-1 text-sm text-danger">{errores.servicios}</p>}
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium">Horario semanal</legend>
          <div className="mt-2 divide-y divide-line rounded-card border border-line">
            {DIAS.map((d) => {
              const turnos = form.horario[d] ?? []
              const trabaja = turnos.length > 0
              return (
                <div key={d} className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center">
                  <Checkbox
                    className="w-32 shrink-0"
                    label={NOMBRES_DIA[d]}
                    checked={trabaja}
                    onChange={() => setTurnos(d, trabaja ? [] : [{ inicio: '09:00', fin: '18:00' }])}
                  />
                  <div className={cn('flex flex-1 flex-wrap items-center gap-2', !trabaja && 'text-sm text-ink-subtle')}>
                    {!trabaja && 'No trabaja'}
                    {turnos.map((t, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <Input type="time" step="900" aria-label={`${NOMBRES_DIA[d]}, inicio turno ${i + 1}`} className="h-9! w-[7.5rem]!" value={t.inicio}
                          onChange={(e) => setTurnos(d, turnos.map((x, j) => (j === i ? { ...x, inicio: e.target.value } : x)))} />
                        <span className="text-ink-muted">a</span>
                        <Input type="time" step="900" aria-label={`${NOMBRES_DIA[d]}, fin turno ${i + 1}`} className="h-9! w-[7.5rem]!" value={t.fin}
                          onChange={(e) => setTurnos(d, turnos.map((x, j) => (j === i ? { ...x, fin: e.target.value } : x)))} />
                        {turnos.length > 1 && (
                          <Button variant="ghost" size="icon-sm" aria-label="Quitar turno" onClick={() => setTurnos(d, turnos.filter((_, j) => j !== i))}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {trabaja && turnos.length < 2 && (
                      <Button variant="ghost" size="sm" icon={Plus} onClick={() => setTurnos(d, [...turnos, { inicio: '15:00', fin: '19:00' }])}>
                        Turno
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {errores.horario && <p className="mt-1 text-sm text-danger">{errores.horario}</p>}
        </fieldset>
      </div>
    </Modal>
  )
}
