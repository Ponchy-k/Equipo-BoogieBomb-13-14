import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarClock, CalendarPlus, CalendarX, Clock, ShoppingBag, UserRound } from 'lucide-react'
import {
  AsyncBoundary, Button, Card, ConfirmDialog, EmptyState, Field, Input, PageHeader, StatusBadge, Tabs, Textarea,
} from '../../components/ui'
import { ReprogramarModal } from '../../components/booking/ReprogramarModal'
import { useAuth } from '../../context/AuthContext'
import { useAccion, useResource } from '../../hooks/useResource'
import { actualizarCliente, cancelarCita, cancelarPedido, getCitas, getCliente, getPedidos } from '../../services'
import { esPasado } from '../../utils/fecha'
import { formatCurrency, formatDate, formatRange } from '../../utils/format'

const TABS = ['citas', 'pedidos', 'perfil']

export default function MiCuenta() {
  const { usuario } = useAuth()
  const [params, setParams] = useSearchParams()
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : 'citas'

  return (
    <div className="container-page max-w-4xl py-10 md:py-14">
      <PageHeader
        title={`Hola, ${usuario.nombre.split(' ')[0]}`}
        description="Tus citas, pedidos y datos en un solo lugar."
        actions={<Button to="/reservar" icon={CalendarPlus}>Nueva cita</Button>}
      />
      <Tabs
        className="mt-8"
        label="Mi cuenta"
        value={tab}
        onChange={(t) => setParams(t === 'citas' ? {} : { tab: t }, { replace: true })}
        tabs={[
          { value: 'citas', label: 'Mis citas' },
          { value: 'pedidos', label: 'Mis pedidos' },
          { value: 'perfil', label: 'Mi perfil' },
        ]}
      />
      <div className="mt-8" role="tabpanel">
        {tab === 'citas' && <MisCitas clienteId={usuario.clienteId} />}
        {tab === 'pedidos' && <MisPedidos clienteId={usuario.clienteId} />}
        {tab === 'perfil' && <MiPerfil clienteId={usuario.clienteId} />}
      </div>
    </div>
  )
}

const ACTIVAS = ['Pendiente', 'Confirmada', 'En atención']

function MisCitas({ clienteId }) {
  const citas = useResource(() => getCitas({ clienteId }), [clienteId])
  const { ejecutar, pendiente } = useAccion()
  const [cancelar, setCancelar] = useState(null)
  const [reprogramar, setReprogramar] = useState(null)

  const esProxima = (c) => ACTIVAS.includes(c.estado) && !esPasado(c.fecha, c.horaFin)

  return (
    <AsyncBoundary resource={citas}>
      {(data) => {
        const proximas = data.filter(esProxima)
        const historial = data.filter((c) => !esProxima(c)).reverse()
        return (
          <div className="flex flex-col gap-12">
            <section aria-labelledby="proximas">
              <h2 id="proximas" className="text-2xl font-medium">Próximas</h2>
              {proximas.length === 0 ? (
                <EmptyState
                  className="mt-4"
                  icon={CalendarClock}
                  title="No tienes citas próximas"
                  description="Reserva en menos de un minuto."
                  action={<Button to="/reservar" size="sm">Reservar cita</Button>}
                />
              ) : (
                <ul className="mt-4 flex flex-col gap-3">
                  {proximas.map((c) => (
                    <li key={c.id}>
                      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                        <div className="flex w-16 shrink-0 flex-col items-center rounded-control border border-line bg-bg py-2">
                          <span className="text-xs text-ink-muted">{formatDate(c.fecha).split(' ')[0]}</span>
                          <span className="tabular text-2xl font-medium leading-tight">{c.fecha.slice(8).replace(/^0/, '')}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{c.servicio?.nombre}</p>
                            <StatusBadge estado={c.estado} />
                          </div>
                          <p className="mt-1 text-sm text-ink-muted">
                            {formatDate(c.fecha)} · <span className="tabular">{formatRange(c.horaInicio, c.horaFin)}</span> · {c.empleado?.nombre}
                          </p>
                        </div>
                        {c.estado !== 'En atención' && (
                          <div className="flex gap-2">
                            <Button variant="secondary" size="sm" icon={CalendarClock} onClick={() => setReprogramar(c)}>
                              Reprogramar
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setCancelar(c)}>
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="historial">
              <h2 id="historial" className="text-2xl font-medium">Historial</h2>
              {historial.length === 0 ? (
                <p className="mt-4 text-ink-muted">Aún no tienes citas anteriores.</p>
              ) : (
                <ul className="mt-4 divide-y divide-line border-y border-line">
                  {historial.map((c) => (
                    <li key={c.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3.5">
                      <div>
                        <p className="font-medium">{c.servicio?.nombre}</p>
                        <p className="text-sm text-ink-muted">{formatDate(c.fecha)} · {c.empleado?.nombre}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="tabular text-sm">{formatCurrency(c.precio)}</span>
                        <StatusBadge estado={c.estado} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <ConfirmDialog
              open={!!cancelar}
              onClose={() => setCancelar(null)}
              title="¿Cancelar esta cita?"
              description={cancelar ? `${cancelar.servicio?.nombre}, ${formatDate(cancelar.fecha)} a las ${cancelar.horaInicio}. El horario quedará libre para otra persona.` : ''}
              confirmLabel="Sí, cancelar cita"
              tone="danger"
              loading={pendiente != null}
              onConfirm={async () => {
                await ejecutar(() => cancelarCita(cancelar.id), { exito: 'Cita cancelada.' })
                setCancelar(null)
              }}
            />
            <ReprogramarModal cita={reprogramar} onClose={() => setReprogramar(null)} />
          </div>
        )
      }}
    </AsyncBoundary>
  )
}

function MisPedidos({ clienteId }) {
  const pedidos = useResource(() => getPedidos({ clienteId }), [clienteId])
  const { ejecutar, pendiente } = useAccion()
  return (
    <AsyncBoundary
      resource={pedidos}
      empty={
        <EmptyState
          icon={ShoppingBag}
          title="Todavía no hiciste pedidos"
          description="Compra en línea y retira en el local."
          action={<Button to="/tienda" size="sm">Ir a la tienda</Button>}
        />
      }
    >
      {(data) => (
        <ul className="flex flex-col gap-3">
          {data.map((p) => (
            <li key={p.id}>
              <Card className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <p className="tabular font-medium">{p.id}</p>
                    <StatusBadge estado={p.estado} />
                  </div>
                  <p className="tabular font-medium">{formatCurrency(p.total)}</p>
                </div>
                <p className="mt-2 text-sm text-ink-muted">{p.items.map((i) => `${i.cantidad} × ${i.nombre}`).join(', ')}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm">
                  <p className="inline-flex items-center gap-1.5 text-ink-muted">
                    <Clock className="size-4" aria-hidden="true" />
                    {['Pendiente', 'Listo para recoger'].includes(p.estado)
                      ? `Retira y paga hasta el ${formatDate(p.expiraEl)}`
                      : p.fechaPago
                        ? `Pagado el ${formatDate(p.fechaPago)} (${p.metodoPago})`
                        : `Pedido del ${formatDate(p.fechaCreacion)}`}
                  </p>
                  {p.estado === 'Pendiente' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={pendiente === p.id}
                      onClick={() => ejecutar(() => cancelarPedido(p.id), { exito: `Pedido ${p.id} cancelado.`, clave: p.id })}
                    >
                      Cancelar pedido
                    </Button>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </AsyncBoundary>
  )
}

function MiPerfil({ clienteId }) {
  const cliente = useResource(() => getCliente(clienteId), [clienteId])
  const { actualizarUsuario } = useAuth()
  const { ejecutar, pendiente } = useAccion()
  const [form, setForm] = useState(null)
  const [errores, setErrores] = useState({})

  useEffect(() => {
    if (cliente.data && !form) {
      const { nombre, telefono, correo, notas } = cliente.data
      setForm({ nombre, telefono, correo, notas })
    }
  }, [cliente.data, form])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const guardar = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio.'
    if (!/^\S+@\S+\.\S+$/.test(form.correo)) errs.correo = 'Revisa el formato del correo.'
    setErrores(errs)
    if (Object.keys(errs).length) return
    const r = await ejecutar(() => actualizarCliente(clienteId, form), { exito: 'Datos actualizados.' })
    if (r.ok) actualizarUsuario({ nombre: form.nombre, correo: form.correo })
  }

  return (
    <AsyncBoundary resource={cliente}>
      {(c) =>
        form && (
          <div className="grid gap-8 md:grid-cols-[1fr_240px]">
            <form onSubmit={guardar} noValidate className="flex flex-col gap-4">
              <Field label="Nombre completo" error={errores.nombre}>
                <Input value={form.nombre} onChange={set('nombre')} autoComplete="name" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Teléfono">
                  <Input type="tel" value={form.telefono} onChange={set('telefono')} autoComplete="tel" />
                </Field>
                <Field label="Correo" error={errores.correo}>
                  <Input type="email" value={form.correo} onChange={set('correo')} autoComplete="email" />
                </Field>
              </div>
              <Field label="Alergias y preferencias" hint="Lo verá el profesional antes de atenderte.">
                <Textarea rows={3} value={form.notas} onChange={set('notas')} placeholder="Ejemplo: alergia al amoníaco, piel sensible" />
              </Field>
              <Button type="submit" loading={pendiente != null} className="sm:self-start">
                Guardar cambios
              </Button>
            </form>
            <Card className="flex flex-col gap-4 self-start p-5 text-sm">
              <UserRound className="size-5 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <p className="text-ink-muted">Cliente desde</p>
                <p className="font-medium">{formatDate(c.registradoEn)}</p>
              </div>
              <div>
                <p className="text-ink-muted">Citas completadas</p>
                <p className="tabular font-medium">{c.citas.filter((x) => x.estado === 'Completada').length}</p>
              </div>
              {c.inasistencias > 0 && (
                <div className="flex gap-2 text-warning">
                  <CalendarX className="size-4 shrink-0" aria-hidden="true" />
                  <p>{c.inasistencias} {c.inasistencias === 1 ? 'inasistencia' : 'inasistencias'} registradas</p>
                </div>
              )}
            </Card>
          </div>
        )
      }
    </AsyncBoundary>
  )
}

