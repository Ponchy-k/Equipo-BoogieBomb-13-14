import { CalendarClock, ListChecks } from 'lucide-react'
import { AsyncBoundary, EmptyState, PageHeader, SkeletonList, StatCard } from '../../components/ui'
import { TareaItem } from '../../components/tasks/TareaItem'
import { useAuth } from '../../context/AuthContext'
import { useResource } from '../../hooks/useResource'
import { getTareas } from '../../services'
import { hoy } from '../../utils/fecha'

const GRUPOS = ['En progreso', 'Pendiente', 'Completada']

export default function MisTareas() {
  const { usuario } = useAuth()
  const tareas = useResource(() => getTareas({ responsableId: usuario.empleadoId }), [usuario.empleadoId])

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Mis tareas" description="Ordenadas por prioridad. Las tareas diarias y semanales se renuevan al completarlas." />
      <AsyncBoundary
        resource={tareas}
        skeleton={<SkeletonList rows={5} />}
        empty={<EmptyState icon={ListChecks} title="No tienes tareas asignadas" description="Cuando el administrador te asigne una, aparecerá aquí." />}
      >
        {(data) => {
          const abiertas = data.filter((t) => t.estado !== 'Completada')
          // Solo se muestran las completadas de hoy para no acumular historial.
          const visibles = data.filter((t) => t.estado !== 'Completada' || t.completadaEn === hoy())
          return (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <StatCard label="Por hacer" value={abiertas.length} icon={ListChecks} />
                <StatCard
                  label="Vencidas"
                  value={abiertas.filter((t) => t.vencida).length}
                  icon={CalendarClock}
                  tone={abiertas.some((t) => t.vencida) ? 'danger' : undefined}
                  hint={abiertas.some((t) => t.vencida) ? 'Atiéndelas primero' : 'Todo al día'}
                />
                <StatCard
                  className="col-span-2 md:col-span-1"
                  label="Completadas hoy"
                  value={data.filter((t) => t.estado === 'Completada' && t.completadaEn === hoy()).length}
                />
              </div>
              {GRUPOS.map((g) => {
                const items = visibles
                  .filter((t) => t.estado === g)
                  .sort((a, b) => Number(b.vencida) - Number(a.vencida))
                if (!items.length) return null
                return (
                  <section key={g} aria-labelledby={`g-${g}`}>
                    <h2 id={`g-${g}`} className="mb-3 text-2xl font-medium">
                      {g} <span className="tabular font-sans text-base text-ink-muted">({items.length})</span>
                    </h2>
                    <ul className="divide-y divide-line rounded-card border border-line bg-surface">
                      {items.map((t) => <TareaItem key={t.id} tarea={t} />)}
                    </ul>
                  </section>
                )
              })}
            </>
          )
        }}
      </AsyncBoundary>
    </div>
  )
}
