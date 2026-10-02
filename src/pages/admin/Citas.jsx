import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarPlus, CalendarSearch, Pencil, X } from 'lucide-react'
import {
  AsyncBoundary, Button, ConfirmDialog, EmptyState, Field, Input, Modal, PageHeader, Select, SkeletonList, StatusBadge,
  Table, Td, Textarea, Th,
} from '../../components/ui'
import { SelectorHora } from '../../components/booking/SelectorHorario'
import { DetalleCitaModal } from '../../components/booking/DetalleCitaModal'
import { useAccion, useResource } from '../../hooks/useResource'
import {
  actualizarCita, cambiarEstadoCita, cancelarCita, crearCita, getCitas, getClientes, getEmpleados, getServicios,
} from '../../services'
import { ESTADOS_CITA } from '../../utils/estados'
import { hoy } from '../../utils/fecha'
import { formatCurrency, formatDate, formatRange } from '../../utils/format'

export default function Citas() {
  const [filtros, setFiltros] = useState({ empleadoId: '', fecha: hoy(), estado: '' })
  const citas = useResource(() => getCitas(filtros.fecha ? filtros : { ...filtros, desde: hoy() }), [filtros])
  const empleados = useResource(() => getEmpleados(), [])
  const { ejecutar, pendiente } = useAccion()
  const [form, setForm] = useState(null) // null | 'nueva' | cita
  const [cancelar, setCancelar] = useState(null)
  const [detalle, setDetalle] = useState(null)

  const set = (k) => (e) => setFiltros((f) => ({ ...f, [k]: e.target.value }))
  const citaDetalle = detalle ? citas.data?.find((c) => c.id === detalle) ?? null : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Citas"
        description="Filtra por profesional, fecha o estado. Sin fecha se muestran las próximas."
        actions={<Button icon={CalendarPlus} onClick={() => setForm('nueva')}>Nueva cita</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
        <Field label="Profesional">
          <Select value={filtros.empleadoId} onChange={set('empleadoId')}>
            <option value="">Todos</option>
            {empleados.data?.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </Select>
        </Field>
        <Field label="Fecha">
          <Input type="date" value={filtros.fecha} onChange={set('fecha')} />
        </Field>
        <Field label="Estado">
          <Select value={filtros.estado} onChange={set('estado')}>
            <option value="">Todos</option>
            {ESTADOS_CITA.map((e) => <option key={e}>{e}</option>)}
          </Select>
        </Field>
        <Button variant="ghost" icon={X} onClick={() => setFiltros({ empleadoId: '', fecha: '', estado: '' })}>
          Quitar filtros
        </Button>
      </div>

      <AsyncBoundary
        resource={citas}
        skeleton={<SkeletonList rows={6} />}
        empty={<EmptyState icon={CalendarSearch} title="No hay citas con estos filtros" description="Cambia la fecha o crea una nueva cita." />}
      >
        {(data) => (
          <>
            <p className="-mb-3 text-sm text-ink-muted">{data.length} {data.length === 1 ? 'cita' : 'citas'}</p>
            <Table>
              <thead>
                <tr><Th>Fecha y hora</Th><Th>Cliente</Th><Th>Servicio</Th><Th>Profesional</Th><Th>Estado</Th><Th className="text-right">Acciones</Th></tr>
              </thead>
              <tbody>
                {data.map((c) => {
                  const editable = ['Pendiente', 'Confirmada'].includes(c.estado)
                  return (
                    <tr key={c.id} className="hover:bg-stone/40">
                      <Td>
                        <button onClick={() => setDetalle(c.id)} className="text-left hover:underline hover:underline-offset-4">
                          <span className="block whitespace-nowrap">{formatDate(c.fecha)}</span>
                          <span className="tabular text-xs text-ink-muted">{formatRange(c.horaInicio, c.horaFin)}</span>
                        </button>
                      </Td>
                      <Td className="font-medium">{c.cliente?.nombre}</Td>
                      <Td>{c.servicio?.nombre}<span className="tabular block text-xs text-ink-muted">{formatCurrency(c.precio)}</span></Td>
                      <Td>{c.empleado?.nombre}</Td>
                      <Td><StatusBadge estado={c.estado} /></Td>
                      <Td className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => setForm(c)} aria-label={`Editar cita de ${c.cliente?.nombre}`}>
                            <Pencil className="size-4" strokeWidth={1.75} />
                          </Button>
                          {editable && (
                            <Button variant="ghost" size="sm" onClick={() => setCancelar(c)}>Cancelar</Button>
                          )}
                        </div>
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </>
        )}
      </AsyncBoundary>

      <CitaFormModal valor={form} onClose={() => setForm(null)} />
      <DetalleCitaModal cita={citaDetalle} onClose={() => setDetalle(null)} fichaBase="/admin/clientes" />
      <ConfirmDialog
        open={!!cancelar}
        onClose={() => setCancelar(null)}
        title="¿Cancelar la cita?"
        description={cancelar ? `${cancelar.cliente?.nombre}: ${cancelar.servicio?.nombre}, ${formatDate(cancelar.fecha)} a las ${cancelar.horaInicio}.` : ''}
        confirmLabel="Cancelar cita"
        tone="danger"
        loading={pendiente != null}
        onConfirm={async () => {
          await ejecutar(() => cancelarCita(cancelar.id), { exito: 'Cita cancelada.' })
          setCancelar(null)
        }}
      />
    </div>
  )
}

const VACIO = { clienteId: '', servicioId: '', empleadoId: '', fecha: hoy(), estado: 'Confirmada', notas: '' }

function CitaFormModal({ valor, onClose }) {
  const editando = valor && valor !== 'nueva'
  const clientes = useResource(() => getClientes(), [])
  const servicios = useResource(() => getServicios(), [])
  const empleados = useResource(() => getEmpleados(), [])
  const { ejecutar, pendiente } = useAccion()
  const [form, setForm] = useState(VACIO)
  const [slot, setSlot] = useState(null)
  const [errores, setErrores] = useState({})
  const onSlot = useCallback((s) => setSlot(s), [])

  useEffect(() => {
    if (!valor) return
    setErrores({})
    if (editando) {
      const { clienteId, servicioId, empleadoId, fecha, estado, notas, horaInicio } = valor
      setForm({ clienteId, servicioId, empleadoId, fecha, estado, notas })
      setSlot({ hora: horaInicio })
    } else {
      setForm(VACIO)
      setSlot(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor])

  const profesionales = useMemo(
    () => (empleados.data ?? []).filter((e) => !form.servicioId || e.servicioIds.includes(form.servicioId)),
    [empleados.data, form.servicioId],
  )

  const set = (k) => (e) => {
    const v = e.target.value
    setForm((f) => {
      const n = { ...f, [k]: v }
      if (k === 'servicioId' && f.empleadoId && !empleados.data?.find((x) => x.id === f.empleadoId)?.servicioIds.includes(v)) n.empleadoId = ''
      return n
    })
    if (['servicioId', 'empleadoId', 'fecha'].includes(k)) setSlot(null)
  }

  const guardar = async () => {
    const errs = {}
    if (!form.clienteId) errs.clienteId = 'Elige un cliente.'
    if (!form.servicioId) errs.servicioId = 'Elige un servicio.'
    if (!form.empleadoId) errs.empleadoId = 'Elige un profesional.'
    if (!slot) errs.hora = 'Elige un horario libre.'
    setErrores(errs)
    if (Object.keys(errs).length) return

    const r = editando
      ? await ejecutar(async () => {
          const { estado, ...resto } = form
          await actualizarCita(valor.id, { ...resto, horaInicio: slot.hora })
          if (estado !== valor.estado) await cambiarEstadoCita(valor.id, estado)
        }, { exito: 'Cita actualizada.' })
      : await ejecutar(() => crearCita({ ...form, horaInicio: slot.hora }), { exito: 'Cita creada.' })
    if (r.ok) onClose()
  }

  // El horario actual de la cita sigue siendo válido aunque no aparezca como "libre".
  const mismoTramo = editando && form.fecha === valor.fecha && form.empleadoId === valor.empleadoId && form.servicioId === valor.servicioId

  return (
    <Modal
      open={!!valor}
      onClose={onClose}
      size="lg"
      title={editando ? 'Editar cita' : 'Nueva cita'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={guardar} loading={pendiente != null}>{editando ? 'Guardar cambios' : 'Crear cita'}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Cliente" error={errores.clienteId}>
          <Select value={form.clienteId} onChange={set('clienteId')}>
            <option value="">Elige un cliente</option>
            {clientes.data?.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Servicio" error={errores.servicioId}>
            <Select value={form.servicioId} onChange={set('servicioId')}>
              <option value="">Elige un servicio</option>
              {servicios.data?.map((s) => <option key={s.id} value={s.id}>{s.nombre} ({s.categoria})</option>)}
            </Select>
          </Field>
          <Field label="Profesional" error={errores.empleadoId}>
            <Select value={form.empleadoId} onChange={set('empleadoId')}>
              <option value="">Elige un profesional</option>
              {profesionales.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </Select>
          </Field>
          <Field label="Fecha">
            <Input type="date" value={form.fecha} min={editando ? undefined : hoy()} onChange={set('fecha')} />
          </Field>
          {editando && (
            <Field label="Estado">
              <Select value={form.estado} onChange={set('estado')}>
                {ESTADOS_CITA.map((e) => <option key={e}>{e}</option>)}
              </Select>
            </Field>
          )}
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">
            Horario {slot && <span className="tabular font-normal text-ink-muted">(elegido: {slot.hora})</span>}
          </p>
          {form.servicioId && form.empleadoId ? (
            <>
              {mismoTramo && (
                <button
                  type="button"
                  onClick={() => setSlot({ hora: valor.horaInicio })}
                  className="mb-3 text-sm text-ink-muted underline underline-offset-4 hover:text-ink"
                >
                  Mantener horario actual ({valor.horaInicio})
                </button>
              )}
              <SelectorHora
                empleadoId={form.empleadoId}
                servicioId={form.servicioId}
                fecha={form.fecha}
                value={slot}
                onChange={(s) => (s || !mismoTramo ? onSlot(s) : null)}
                excluirCitaId={editando ? valor.id : undefined}
              />
            </>
          ) : (
            <p className="rounded-control bg-stone/60 px-3 py-3 text-sm text-ink-muted">Elige servicio y profesional para ver los horarios libres.</p>
          )}
          {errores.hora && <p className="mt-2 text-sm text-danger">{errores.hora}</p>}
        </div>
        <Field label="Notas">
          <Textarea rows={2} value={form.notas} onChange={set('notas')} />
        </Field>
      </div>
    </Modal>
  )
}
