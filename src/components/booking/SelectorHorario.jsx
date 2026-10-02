import { useEffect, useMemo } from 'react'
import { CalendarX2 } from 'lucide-react'
import { EmptyState, Skeleton, ErrorState } from '../ui'
import { useResource } from '../../hooks/useResource'
import { getDisponibilidad } from '../../services'
import { NOMBRES_DIA_CORTO, diaSemana, hoy, sumarDias } from '../../utils/fecha'
import { cn, formatDate } from '../../utils/format'

/** Próximos `dias` días a partir de hoy (domingo se muestra como cerrado). */
export function proximosDias(dias = 14) {
  const h = hoy()
  return Array.from({ length: dias }, (_, i) => sumarDias(h, i))
}

export function SelectorFecha({ value, onChange, dias = 14 }) {
  const fechas = useMemo(() => proximosDias(dias), [dias])
  return (
    <div role="radiogroup" aria-label="Fecha" className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0">
      {fechas.map((f) => {
        const cerrado = diaSemana(f) === 0
        const activo = value === f
        const [, , dia] = f.split('-')
        return (
          <button
            key={f}
            role="radio"
            aria-checked={activo}
            aria-label={cerrado ? `${formatDate(f)}, cerrado` : formatDate(f)}
            disabled={cerrado}
            onClick={() => onChange(f)}
            className={cn(
              'flex h-[72px] w-16 shrink-0 snap-start flex-col items-center justify-center gap-0.5 rounded-control border transition-colors',
              activo
                ? 'border-ink bg-ink text-bg'
                : cerrado
                  ? 'border-line bg-stone/40 text-ink-subtle line-through'
                  : 'border-line-strong bg-surface text-ink hover:border-ink',
            )}
          >
            <span className={cn('text-xs', activo ? 'text-bg/80' : 'text-ink-muted')}>
              {f === hoy() ? 'hoy' : NOMBRES_DIA_CORTO[diaSemana(f)]}
            </span>
            <span className="tabular text-lg font-medium leading-none">{Number(dia)}</span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Lista de horarios libres. Solo muestra horarios realmente disponibles
 * (calculados con la duración del servicio, citas existentes y walk-ins).
 */
export function SelectorHora({ empleadoId, servicioId, fecha, value, onChange, excluirCitaId }) {
  const disp = useResource(
    () => (fecha && servicioId && empleadoId ? getDisponibilidad(empleadoId, fecha, servicioId, { excluirCitaId }) : Promise.resolve([])),
    [empleadoId, servicioId, fecha, excluirCitaId],
  )

  // Si el horario elegido deja de estar libre (por otra reserva), se limpia.
  useEffect(() => {
    if (value && disp.data && !disp.data.some((s) => s.hora === value.hora)) onChange(null)
  }, [disp.data, value, onChange])

  if (!fecha) return null
  if (disp.loading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6" role="status" aria-label="Buscando horarios">
        {Array.from({ length: 12 }, (_, i) => (
          <Skeleton key={i} className="h-11" />
        ))}
      </div>
    )
  }
  if (disp.error) return <ErrorState error={disp.error} onRetry={disp.reload} />
  if (!disp.data.length) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Sin horarios libres este día"
        description={diaSemana(fecha) === 0 ? 'Los domingos el local está cerrado.' : 'Prueba con otra fecha u otro profesional.'}
      />
    )
  }

  const grupos = [
    { label: 'Mañana', slots: disp.data.filter((s) => s.hora < '12:00') },
    { label: 'Tarde', slots: disp.data.filter((s) => s.hora >= '12:00') },
  ].filter((g) => g.slots.length)

  return (
    <div className="flex flex-col gap-5">
      {grupos.map((g) => (
        <fieldset key={g.label}>
          <legend className="mb-2 text-sm text-ink-muted">{g.label}</legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
            {g.slots.map((s) => {
              const activo = value?.hora === s.hora
              return (
                <button
                  key={s.hora}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => onChange(s)}
                  className={cn(
                    'tabular h-11 rounded-control border text-sm font-medium transition-colors',
                    activo ? 'border-accent bg-accent text-on-accent' : 'border-line-strong bg-surface text-ink hover:border-ink',
                  )}
                >
                  {s.hora}
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
