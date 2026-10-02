import { useMemo, useState } from 'react'
import { Clock, UserPlus } from 'lucide-react'
import { AsyncBoundary, Button, Card, EmptyState, Field, Input, PageHeader, Select, SkeletonList } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useAccion, useResource } from '../../hooks/useResource'
import { getEmpleado, getServicios, getWalkins, registrarWalkin } from '../../services'
import { ahora, hoy, sumarMinutos } from '../../utils/fecha'
import { formatCurrency, formatDate, formatDuration, formatRange } from '../../utils/format'

export default function SinCita() {
  const { usuario } = useAuth()
  const empleado = useResource(() => getEmpleado(usuario.empleadoId), [usuario.empleadoId])
  const servicios = useResource(() => getServicios(), [])
  const walkins = useResource(() => getWalkins({ empleadoId: usuario.empleadoId, fecha: hoy() }), [usuario.empleadoId])
  const { ejecutar, pendiente } = useAccion()

  const [form, setForm] = useState({ servicioId: '', clienteNombre: '', horaInicio: ahora() })
  const [error, setError] = useState(null)

  const misServicios = useMemo(
    () => (servicios.data ?? []).filter((s) => empleado.data?.servicioIds.includes(s.id)),
    [servicios.data, empleado.data],
  )
  const servicio = misServicios.find((s) => s.id === form.servicioId)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.servicioId) return setError('Elige el servicio que vas a realizar.')
    setError(null)
    const r = await ejecutar(() => registrarWalkin({ empleadoId: usuario.empleadoId, ...form }), {
      exito: (w) => `Registrado: ${w.servicio.nombre} de ${w.horaInicio} a ${w.horaFin}. El tramo quedó bloqueado.`,
    })
    if (r.ok) setForm({ servicioId: '', clienteNombre: '', horaInicio: ahora() })
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Registrar servicio sin cita" description="Para clientes que llegan al local sin reserva. Se bloquea el tramo en tu agenda." />

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <Card className="p-5 md:p-6">
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <Field label="Servicio" error={error}>
              <Select value={form.servicioId} onChange={(e) => setForm({ ...form, servicioId: e.target.value })} disabled={!misServicios.length}>
                <option value="">{misServicios.length ? 'Elige un servicio' : 'Cargando…'}</option>
                {misServicios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} · {formatDuration(s.duracion)} · {formatCurrency(s.precio)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Nombre del cliente" hint='Opcional. Si lo dejas vacío se registra como "Cliente ocasional".'>
              <Input value={form.clienteNombre} onChange={(e) => setForm({ ...form, clienteNombre: e.target.value })} autoComplete="off" />
            </Field>
            <Field label="Hora de inicio" hint="Por defecto, ahora.">
              <Input type="time" step="300" value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} />
            </Field>
            {servicio && (
              <p className="flex items-center gap-2 rounded-control bg-stone/70 px-3 py-2.5 text-sm text-ink-muted">
                <Clock className="size-4 shrink-0" aria-hidden="true" />
                Se bloqueará tu agenda de <span className="tabular font-medium text-ink">{formatRange(form.horaInicio, sumarMinutos(form.horaInicio, servicio.duracion))}</span>
              </p>
            )}
            <Button type="submit" size="lg" icon={UserPlus} loading={pendiente != null} className="mt-1">
              Registrar servicio
            </Button>
          </form>
        </Card>

        <section aria-labelledby="hoy-sin-cita">
          <h2 id="hoy-sin-cita" className="text-2xl font-medium">Hoy sin cita</h2>
          <p className="mt-1 text-sm text-ink-muted">{formatDate(hoy())}</p>
          <div className="mt-4">
            <AsyncBoundary
              resource={walkins}
              skeleton={<SkeletonList rows={2} />}
              empty={<EmptyState icon={UserPlus} title="Aún no registraste servicios sin cita hoy" />}
            >
              {(data) => (
                <ul className="divide-y divide-line rounded-card border border-line bg-surface">
                  {data.map((w) => (
                    <li key={w.id} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div>
                        <p className="font-medium">{w.servicio?.nombre}</p>
                        <p className="text-sm text-ink-muted">{w.clienteNombre} · <span className="tabular">{formatRange(w.horaInicio, w.horaFin)}</span></p>
                      </div>
                      <span className="tabular text-sm">{formatCurrency(w.precio)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </AsyncBoundary>
          </div>
        </section>
      </div>
    </div>
  )
}
