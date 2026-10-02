import { useEffect, useState } from 'react'
import { ClipboardPlus, Package, PackageX, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import {
  AsyncBoundary, Badge, Button, Checkbox, ConfirmDialog, EmptyState, Field, Input, Modal, PageHeader, Placeholder, Select,
  SkeletonList, Table, Td, Textarea, Th,
} from '../../components/ui'
import { useAccion, useResource } from '../../hooks/useResource'
import {
  actualizarProducto, crearProducto, crearTareaReposicion, eliminarProducto, getEmpleados, getProductos, getTareas,
} from '../../services'
import { cn, formatCurrency } from '../../utils/format'

export default function Productos() {
  const [q, setQ] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [soloBajo, setSoloBajo] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setBusqueda(q), 250)
    return () => clearTimeout(t)
  }, [q])
  const productos = useResource(() => getProductos({ q: busqueda }), [busqueda])
  const tareas = useResource(() => getTareas({ estado: 'Pendiente' }), [])
  const { ejecutar, pendiente } = useAccion()
  const [editar, setEditar] = useState(null)
  const [borrar, setBorrar] = useState(null)
  const [reponer, setReponer] = useState(null)

  const conTarea = new Set((tareas.data ?? []).filter((t) => t.productoId).map((t) => t.productoId))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Productos e inventario"
        description="Stock de la tienda. Los pedidos en curso ya están descontados."
        actions={<Button icon={Plus} onClick={() => setEditar('nuevo')}>Nuevo producto</Button>}
      />

      {productos.data && productos.data.some((p) => p.stock <= p.stockMinimo) && (
        <div role="alert" className="flex flex-col gap-3 rounded-card border border-warning/30 bg-warning-soft p-4 sm:flex-row sm:items-center">
          <PackageX className="size-5 shrink-0 text-warning" strokeWidth={1.75} aria-hidden="true" />
          <p className="flex-1 text-sm">
            <span className="font-medium">{productos.data.filter((p) => p.stock <= p.stockMinimo).length} productos con stock bajo.</span>{' '}
            <span className="text-ink-muted">Crea una tarea de reposición para asignarla a alguien del equipo.</span>
          </p>
          <Button variant="secondary" size="sm" onClick={() => setSoloBajo((v) => !v)}>
            {soloBajo ? 'Ver todos' : 'Ver solo stock bajo'}
          </Button>
        </div>
      )}

      <div className="max-w-md">
        <label htmlFor="buscar-prod" className="sr-only">Buscar producto</label>
        <Input id="buscar-prod" type="search" icon={Search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o marca" />
      </div>

      <AsyncBoundary
        resource={productos}
        skeleton={<SkeletonList rows={6} />}
        empty={<EmptyState icon={Package} title="No hay productos" />}
      >
        {(data) => {
          const lista = soloBajo ? data.filter((p) => p.stock <= p.stockMinimo) : data
          return (
            <Table>
              <thead>
                <tr><Th>Producto</Th><Th>Categoría</Th><Th className="text-right">Precio</Th><Th className="text-right">Stock</Th><Th>Estado</Th><Th className="text-right">Acciones</Th></tr>
              </thead>
              <tbody>
                {lista.map((p) => {
                  const bajo = p.stock <= p.stockMinimo
                  return (
                    <tr key={p.id} className={cn('hover:bg-stone/40', bajo && 'bg-warning-soft/40')}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <Placeholder tono={p.tono} className="size-10 shrink-0 rounded-control border border-line" />
                          <div>
                            <p className="font-medium">{p.nombre}</p>
                            <p className="text-xs text-ink-muted">{p.marca}</p>
                          </div>
                        </div>
                      </Td>
                      <Td>{p.categoria}</Td>
                      <Td className="tabular whitespace-nowrap text-right">{formatCurrency(p.precio)}</Td>
                      <Td className="tabular text-right">
                        <span className={cn('font-medium', bajo && 'text-warning')}>{p.stock}</span>
                        <span className="text-ink-muted"> / mín. {p.stockMinimo}</span>
                      </Td>
                      <Td>
                        {p.stock === 0 ? <Badge tone="danger">Agotado</Badge> : bajo ? <Badge tone="warning">Stock bajo</Badge> : <Badge tone="success">Normal</Badge>}
                      </Td>
                      <Td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {bajo &&
                            (conTarea.has(p.id) ? (
                              <span className="mr-2 whitespace-nowrap text-xs text-ink-muted">Tarea creada</span>
                            ) : (
                              <Button variant="secondary" size="sm" icon={ClipboardPlus} onClick={() => setReponer(p)}>
                                Crear tarea de reposición
                              </Button>
                            ))}
                          <Button variant="ghost" size="icon-sm" onClick={() => setEditar(p)} aria-label={`Editar ${p.nombre}`}><Pencil className="size-4" strokeWidth={1.75} /></Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => setBorrar(p)} aria-label={`Eliminar ${p.nombre}`}><Trash2 className="size-4" strokeWidth={1.75} /></Button>
                        </div>
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          )
        }}
      </AsyncBoundary>

      <ProductoModal valor={editar} onClose={() => setEditar(null)} />
      <ReposicionModal producto={reponer} onClose={() => setReponer(null)} />
      <ConfirmDialog
        open={!!borrar}
        onClose={() => setBorrar(null)}
        title="¿Eliminar producto?"
        description={borrar ? `"${borrar.nombre}" dejará de mostrarse en la tienda.` : ''}
        confirmLabel="Eliminar"
        tone="danger"
        loading={pendiente != null}
        onConfirm={async () => {
          await ejecutar(() => eliminarProducto(borrar.id), { exito: 'Producto eliminado.' })
          setBorrar(null)
        }}
      />
    </div>
  )
}

function ReposicionModal({ producto, onClose }) {
  const empleados = useResource(() => getEmpleados(), [])
  const [responsableId, setResponsableId] = useState('')
  const { ejecutar, pendiente } = useAccion()

  useEffect(() => {
    if (producto && empleados.data?.length) setResponsableId((r) => r || empleados.data[0].id)
  }, [producto, empleados.data])

  const crear = async () => {
    const r = await ejecutar(() => crearTareaReposicion(producto.id, responsableId), { exito: 'Tarea de reposición creada.' })
    if (r.ok) onClose()
  }

  return (
    <Modal
      open={!!producto}
      onClose={onClose}
      size="sm"
      title="Tarea de reposición"
      description={producto ? `${producto.nombre} (stock ${producto.stock})` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button icon={ClipboardPlus} onClick={crear} loading={pendiente != null} disabled={!responsableId}>Crear tarea</Button>
        </>
      }
    >
      <Field label="Responsable" hint="Vence mañana. Prioridad alta si el producto está agotado.">
        <Select value={responsableId} onChange={(e) => setResponsableId(e.target.value)}>
          {empleados.data?.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </Select>
      </Field>
    </Modal>
  )
}

const VACIO = { nombre: '', marca: '', categoria: 'Cuidado capilar', precio: '', stock: 0, stockMinimo: 3, descripcion: '', destacado: false }
const CATEGORIAS = ['Cuidado capilar', 'Styling', 'Barba', 'Uñas', 'Accesorios']

function ProductoModal({ valor, onClose }) {
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
    if (!form.nombre.trim()) errs.nombre = 'Escribe el nombre.'
    if (!form.marca.trim()) errs.marca = 'Escribe la marca.'
    if (!(Number(form.precio) > 0)) errs.precio = 'Precio mayor a 0.'
    if (Number(form.stock) < 0) errs.stock = 'No puede ser negativo.'
    setErrores(errs)
    if (Object.keys(errs).length) return
    const datos = { ...form, precio: Number(form.precio), stock: Number(form.stock), stockMinimo: Number(form.stockMinimo) }
    const r = editando
      ? await ejecutar(() => actualizarProducto(valor.id, datos), { exito: 'Producto actualizado.' })
      : await ejecutar(() => crearProducto(datos), { exito: 'Producto creado.' })
    if (r.ok) onClose()
  }

  return (
    <Modal
      open={!!valor}
      onClose={onClose}
      title={editando ? 'Editar producto' : 'Nuevo producto'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={guardar} loading={pendiente != null}>Guardar</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" error={errores.nombre} className="sm:col-span-2"><Input value={form.nombre} onChange={set('nombre')} /></Field>
        <Field label="Marca" error={errores.marca}><Input value={form.marca} onChange={set('marca')} /></Field>
        <Field label="Categoría">
          <Select value={form.categoria} onChange={set('categoria')}>{CATEGORIAS.map((c) => <option key={c}>{c}</option>)}</Select>
        </Field>
        <Field label="Precio (Bs)" error={errores.precio}><Input type="number" min="0" step="0.5" value={form.precio} onChange={set('precio')} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Stock" error={errores.stock}><Input type="number" min="0" value={form.stock} onChange={set('stock')} /></Field>
          <Field label="Mínimo"><Input type="number" min="0" value={form.stockMinimo} onChange={set('stockMinimo')} /></Field>
        </div>
        <Field label="Descripción" className="sm:col-span-2"><Textarea rows={3} value={form.descripcion} onChange={set('descripcion')} /></Field>
        <Checkbox className="sm:col-span-2" label="Destacar en la página de inicio" checked={form.destacado} onChange={(e) => setForm((f) => ({ ...f, destacado: e.target.checked }))} />
      </div>
    </Modal>
  )
}
