import { useEffect, useState } from 'react'
import { Pencil, Plus, Scissors, Trash2 } from 'lucide-react'
import {
  AsyncBoundary, Badge, Button, Checkbox, ConfirmDialog, EmptyState, Field, Input, Modal, PageHeader, Segmented, Select,
  SkeletonList, Table, Td, Textarea, Th,
} from '../../components/ui'
import { useAccion, useResource } from '../../hooks/useResource'
import { actualizarServicio, crearServicio, eliminarServicio, getServicios } from '../../services'
import { formatCurrency, formatDuration } from '../../utils/format'

export default function ServiciosAdmin() {
  const [categoria, setCategoria] = useState('Todos')
  const servicios = useResource(() => getServicios({ categoria }), [categoria])
  const { ejecutar, pendiente } = useAccion()
  const [editar, setEditar] = useState(null)
  const [borrar, setBorrar] = useState(null)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Servicios"
        description="Catálogo que se muestra en la web y en el flujo de reserva."
        actions={<Button icon={Plus} onClick={() => setEditar('nuevo')}>Nuevo servicio</Button>}
      />
      <Segmented
        label="Categoría"
        className="self-start"
        value={categoria}
        onChange={setCategoria}
        options={['Todos', 'Salón', 'Barbería'].map((c) => ({ value: c, label: c }))}
      />
      <AsyncBoundary
        resource={servicios}
        skeleton={<SkeletonList rows={6} />}
        empty={<EmptyState icon={Scissors} title="Sin servicios en esta categoría" />}
      >
        {(data) => (
          <Table>
            <thead>
              <tr><Th>Servicio</Th><Th>Categoría</Th><Th>Duración</Th><Th className="text-right">Precio</Th><Th className="text-right">Acciones</Th></tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.id} className="hover:bg-stone/40">
                  <Td>
                    <span className="font-medium">{s.nombre}</span>
                    {s.destacado && <Badge tone="accent" className="ml-2">Destacado</Badge>}
                    <span className="block max-w-[48ch] truncate text-xs text-ink-muted">{s.descripcion}</span>
                  </Td>
                  <Td>{s.categoria}</Td>
                  <Td className="tabular whitespace-nowrap">{formatDuration(s.duracion)}</Td>
                  <Td className="tabular whitespace-nowrap text-right">{formatCurrency(s.precio)}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditar(s)} aria-label={`Editar ${s.nombre}`}><Pencil className="size-4" strokeWidth={1.75} /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setBorrar(s)} aria-label={`Eliminar ${s.nombre}`}><Trash2 className="size-4" strokeWidth={1.75} /></Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </AsyncBoundary>

      <ServicioModal valor={editar} onClose={() => setEditar(null)} />
      <ConfirmDialog
        open={!!borrar}
        onClose={() => setBorrar(null)}
        title="¿Eliminar este servicio?"
        description={borrar ? `"${borrar.nombre}" dejará de mostrarse en la web y en las reservas. Las citas existentes se conservan.` : ''}
        confirmLabel="Eliminar"
        tone="danger"
        loading={pendiente != null}
        onConfirm={async () => {
          await ejecutar(() => eliminarServicio(borrar.id), { exito: 'Servicio eliminado.' })
          setBorrar(null)
        }}
      />
    </div>
  )
}

const VACIO = { nombre: '', categoria: 'Salón', duracion: 60, precio: '', descripcion: '', destacado: false }

function ServicioModal({ valor, onClose }) {
  const editando = valor && valor !== 'nuevo'
  const [form, setForm] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const { ejecutar, pendiente } = useAccion()

  useEffect(() => {
    if (!valor) return
    setErrores({})
    setForm(editando ? { ...VACIO, ...valor } : VACIO)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const guardar = async () => {
    const errs = {}
    if (!form.nombre.trim()) errs.nombre = 'Escribe el nombre del servicio.'
    if (!(Number(form.precio) > 0)) errs.precio = 'Ingresa un precio mayor a 0.'
    if (!(Number(form.duracion) >= 15)) errs.duracion = 'Mínimo 15 minutos.'
    setErrores(errs)
    if (Object.keys(errs).length) return
    const datos = { ...form, precio: Number(form.precio), duracion: Number(form.duracion) }
    const r = editando
      ? await ejecutar(() => actualizarServicio(valor.id, datos), { exito: 'Servicio actualizado.' })
      : await ejecutar(() => crearServicio(datos), { exito: 'Servicio creado.' })
    if (r.ok) onClose()
  }

  return (
    <Modal
      open={!!valor}
      onClose={onClose}
      title={editando ? 'Editar servicio' : 'Nuevo servicio'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={guardar} loading={pendiente != null}>Guardar</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" error={errores.nombre} className="sm:col-span-2">
          <Input value={form.nombre} onChange={set('nombre')} />
        </Field>
        <Field label="Categoría">
          <Select value={form.categoria} onChange={set('categoria')}>
            <option>Salón</option>
            <option>Barbería</option>
          </Select>
        </Field>
        <Field label="Duración (minutos)" error={errores.duracion}>
          <Input type="number" min="15" step="5" value={form.duracion} onChange={set('duracion')} />
        </Field>
        <Field label="Precio (Bs)" error={errores.precio}>
          <Input type="number" min="0" step="0.5" value={form.precio} onChange={set('precio')} />
        </Field>
        <div className="flex items-end">
          <Checkbox label="Destacar en la página de inicio" checked={form.destacado} onChange={(e) => setForm((f) => ({ ...f, destacado: e.target.checked }))} />
        </div>
        <Field label="Descripción" className="sm:col-span-2">
          <Textarea rows={3} value={form.descripcion} onChange={set('descripcion')} />
        </Field>
      </div>
    </Modal>
  )
}
