import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, TriangleAlert, UserPlus } from 'lucide-react'
import { Badge, Button, Card, EmptyState, ErrorState, PageHeader, Segmented, Skeleton, StatusBadge } from '../../components/ui'
import { DetalleCitaModal } from '../../components/booking/DetalleCitaModal'
import { EstadoEmpleado } from './EstadoEmpleado'
import { useAuth } from '../../context/AuthContext'
import { useResource } from '../../hooks/useResource'
import { getCitas, getWalkins } from '../../services'
import { aMinutos, ahora, diaSemana, hoy, inicioSemana, sumarDias } from '../../utils/fecha'
import { cn, formatDate, formatDateLong, formatDateShort, formatRange } from '../../utils/format'

const INICIO = 8 * 60
const FIN = 20 * 60
const PX_MIN = 1.3

const estiloCita = {
  Pendiente: 'border-warning/40 bg-warning-soft',
  Confirmada: 'border-accent-line bg-accent-soft',
  'En atención': 'border-ink bg-surface ring-1 ring-ink',
  Completada: 'border-success/30 bg-success-soft/70',
  'No asistió': 'border-danger/30 bg-danger-soft/60 opacity-70',
}

export default function Agenda() {
  const { usuario } = useAuth()
  const [vista, setVista] = useState('dia')
  const [fecha, setFecha] = useState(hoy)
  const [seleccion, setSeleccion] = useState(null)

  const rango = vista === 'dia' ? { desde: fecha, hasta: fecha } : { desde: inicioSemana(fecha), hasta: sumarDias(inicioSemana(fecha), 5) }
  const citas = useResource(() => getCitas({ empleadoId: usuario.empleadoId, ...rango }), [usuario.empleadoId, rango.desde, rango.hasta])
  const walkins = useResource(() => getWalkins({ empleadoId: usuario.empleadoId, ...rango }), [usuario.empleadoId, rango.desde, rango.hasta])

  const visibles = useMemo(() => (citas.data ?? []).filter((c) => c.estado !== 'Cancelada'), [citas.data])
  // Mantener sincronizada la cita abierta en el modal cuando cambia su estado.
  const citaAbierta = seleccion ? visibles.find((c) => c.id === seleccion) ?? null : null

  const mover = (dir) => setFecha((f) => sumarDias(f, dir * (vista === 'dia' ? 1 : 7)))
  const titulo =
    vista === 'dia'
      ? formatDateLong(fecha)
      : `${formatDateShort(rango.desde)} al ${formatDateShort(rango.hasta)}`

  const cargando = citas.loading || walkins.loading
  const error = citas.error || walkins.error

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mi agenda"
        description="Toca una cita para iniciar la atención, finalizarla o marcar inasistencia."
        actions={<Button to="/empleado/sin-cita" icon={UserPlus}>Registrar sin cita</Button>}
      />

      <Card className="flex flex-col gap-2 p-4 md:hidden">
        <p className="text-sm font-medium">Mi estado</p>
        <EstadoEmpleado />
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <Button variant="secondary" size="icon-sm" onClick={() => mover(-1)} aria-label={vista === 'dia' ? 'Día anterior' : 'Semana anterior'}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="secondary" size="icon-sm" onClick={() => mover(1)} aria-label={vista === 'dia' ? 'Día siguiente' : 'Semana siguiente'}>
            <ChevronRight className="size-4" />
          </Button>
          <p className="ml-2 font-medium first-letter:uppercase" aria-live="polite">{titulo}</p>
          {fecha !== hoy() && (
            <Button variant="ghost" size="sm" onClick={() => setFecha(hoy())} className="ml-1">Hoy</Button>
          )}
        </div>
        <Segmented
          label="Vista"
          size="sm"
          value={vista}
          onChange={setVista}
          options={[{ value: 'dia', label: 'Día' }, { value: 'semana', label: 'Semana' }]}
        />
      </div>

      {error ? (
        <ErrorState error={error} onRetry={() => { citas.reload(); walkins.reload() }} />
      ) : cargando ? (
        <Skeleton className="h-[600px] rounded-card" />
      ) : vista === 'dia' ? (
        <VistaDia fecha={fecha} citas={visibles} walkins={walkins.data} onSelect={(c) => setSeleccion(c.id)} />
      ) : (
        <VistaSemana
          desde={rango.desde}
          citas={visibles}
          walkins={walkins.data}
          onSelect={(c) => setSeleccion(c.id)}
          onDia={(f) => { setFecha(f); setVista('dia') }}
        />
      )}

      <DetalleCitaModal cita={citaAbierta} onClose={() => setSeleccion(null)} />
    </div>
  )
}

function useMinutoActual() {
  const [min, setMin] = useState(() => aMinutos(ahora()))
  useEffect(() => {
    const t = setInterval(() => setMin(aMinutos(ahora())), 60_000)
    return () => clearInterval(t)
  }, [])
  return min
}

function VistaDia({ fecha, citas, walkins, onSelect }) {
  const minActual = useMinutoActual()
  const horas = Array.from({ length: (FIN - INICIO) / 60 + 1 }, (_, i) => INICIO + i * 60)
  const pos = (hhmm) => (aMinutos(hhmm) - INICIO) * PX_MIN
  const alto = (a, b) => Math.max((aMinutos(b) - aMinutos(a)) * PX_MIN - 4, 28)

  if (diaSemana(fecha) === 0) {
    return <EmptyState icon={CalendarDays} title="Domingo, el local está cerrado" description="Navega a otro día para ver tu agenda." />
  }

  const total = citas.length + walkins.length

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-3 text-sm">
        <span className="text-ink-muted">{total} {total === 1 ? 'servicio' : 'servicios'} en la agenda</span>
        <span className="flex items-center gap-3 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm border border-accent-line bg-accent-soft" />Cita</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm border border-dashed border-line-strong bg-stone" />Sin cita</span>
        </span>
      </div>
      <div className="relative ml-14 mr-3" style={{ height: (FIN - INICIO) * PX_MIN + 16 }}>
        {horas.map((m) => (
          <div key={m} className="absolute inset-x-0 border-t border-line" style={{ top: (m - INICIO) * PX_MIN + 8 }}>
            <span className="tabular absolute -left-12 -top-2.5 w-10 text-right text-xs text-ink-subtle">
              {String(m / 60).padStart(2, '0')}:00
            </span>
          </div>
        ))}

        {fecha === hoy() && minActual >= INICIO && minActual <= FIN && (
          <div className="absolute inset-x-0 z-10 flex items-center" style={{ top: (minActual - INICIO) * PX_MIN + 8 }} aria-label={`Hora actual ${ahora()}`}>
            <span className="-ml-1.5 size-3 rounded-full bg-danger" />
            <span className="h-px flex-1 bg-danger" />
          </div>
        )}

        {walkins.map((w) => (
          <div
            key={w.id}
            className="absolute left-1 right-1 flex items-center gap-2 overflow-hidden rounded-control border border-dashed border-line-strong bg-stone px-3 text-sm"
            style={{ top: pos(w.horaInicio) + 10, height: alto(w.horaInicio, w.horaFin) }}
          >
            <span className="tabular shrink-0 text-xs text-ink-muted">{w.horaInicio}</span>
            <span className="truncate font-medium">{w.servicio?.nombre} · {w.clienteNombre}</span>
            <span className="ml-auto shrink-0 text-xs text-ink-muted">Sin cita</span>
          </div>
        ))}

        {citas.map((c) => {
          const h = alto(c.horaInicio, c.horaFin)
          if (h < 52) {
            // Citas cortas: una sola línea para que no se corte el texto.
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c)}
                className={cn(
                  'absolute left-1 right-1 flex items-center gap-2 overflow-hidden rounded-control border px-3 text-left text-sm transition-[transform,box-shadow] hover:shadow-soft active:scale-[0.995]',
                  estiloCita[c.estado],
                )}
                style={{ top: pos(c.horaInicio) + 10, height: h }}
              >
                <span className="tabular shrink-0 text-xs text-ink-muted">{c.horaInicio}</span>
                <span className="truncate font-medium">{c.servicio?.nombre} · {c.cliente?.nombre}</span>
                {c.cliente?.notas && <TriangleAlert className="size-3 shrink-0 text-warning" aria-label="Tiene notas o alergias" />}
                <span className="ml-auto hidden shrink-0 sm:inline-flex"><StatusBadge estado={c.estado} /></span>
              </button>
            )
          }
          return (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className={cn(
              'absolute left-1 right-1 overflow-hidden rounded-control border px-3 py-1.5 text-left text-sm transition-[transform,box-shadow] hover:shadow-soft active:scale-[0.995]',
              estiloCita[c.estado],
            )}
            style={{ top: pos(c.horaInicio) + 10, height: h }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="truncate font-medium">
                {c.servicio?.nombre} · {c.cliente?.nombre}
              </p>
              <span className="hidden shrink-0 sm:inline-flex"><StatusBadge estado={c.estado} /></span>
            </div>
            <p className="tabular flex items-center gap-1.5 truncate text-xs text-ink-muted">
              {formatRange(c.horaInicio, c.horaFin)}
              {c.cliente?.notas && <TriangleAlert className="size-3 text-warning" aria-label="Tiene notas o alergias" />}
              <span className="sm:hidden">· {c.estado}</span>
            </p>
          </button>
          )
        })}
      </div>
    </Card>
  )
}

function VistaSemana({ desde, citas, walkins, onSelect, onDia }) {
  const dias = Array.from({ length: 6 }, (_, i) => sumarDias(desde, i))
  return (
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
      {dias.map((f) => {
        const delDia = citas.filter((c) => c.fecha === f)
        const sinCita = walkins.filter((w) => w.fecha === f)
        const esHoy = f === hoy()
        return (
          <Card key={f} className={cn('flex flex-col', esHoy && 'border-ink')}>
            <button onClick={() => onDia(f)} className="flex items-baseline justify-between border-b border-line px-3 py-2.5 text-left hover:bg-stone/60">
              <span className="text-sm font-medium first-letter:uppercase">{formatDate(f).split(' ').slice(0, 2).join(' ')}</span>
              {esHoy ? <Badge tone="accent">Hoy</Badge> : <span className="tabular text-xs text-ink-muted">{delDia.length + sinCita.length}</span>}
            </button>
            <ul className="flex flex-col gap-1.5 p-2">
              {delDia.length + sinCita.length === 0 && <li className="px-1 py-3 text-center text-xs text-ink-subtle">Sin servicios</li>}
              {delDia.map((c) => (
                <li key={c.id}>
                  <button onClick={() => onSelect(c)} className={cn('w-full rounded-control border px-2.5 py-1.5 text-left text-xs', estiloCita[c.estado])}>
                    <span className="tabular block font-medium">{c.horaInicio}</span>
                    <span className="block truncate">{c.servicio?.nombre}</span>
                    <span className="block truncate text-ink-muted">{c.cliente?.nombre}</span>
                  </button>
                </li>
              ))}
              {sinCita.map((w) => (
                <li key={w.id} className="rounded-control border border-dashed border-line-strong bg-stone px-2.5 py-1.5 text-xs">
                  <span className="tabular block font-medium">{w.horaInicio}</span>
                  <span className="block truncate">{w.servicio?.nombre}</span>
                  <span className="block truncate text-ink-muted">Sin cita</span>
                </li>
              ))}
            </ul>
          </Card>
        )
      })}
    </div>
  )
}
