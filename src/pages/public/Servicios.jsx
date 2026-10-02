import { useSearchParams } from 'react-router-dom'
import { Clock, Scissors } from 'lucide-react'
import { AsyncBoundary, Button, EmptyState, PageHeader, Segmented, Skeleton } from '../../components/ui'
import { useResource } from '../../hooks/useResource'
import { getServicios } from '../../services'
import { formatCurrency, formatDuration } from '../../utils/format'

const CATEGORIAS = ['Todos', 'Salón', 'Barbería']

export default function Servicios() {
  const [params, setParams] = useSearchParams()
  const categoria = CATEGORIAS.includes(params.get('categoria')) ? params.get('categoria') : 'Todos'
  const servicios = useResource(() => getServicios({ categoria }), [categoria])

  const grupos = (data) =>
    (categoria === 'Todos' ? ['Salón', 'Barbería'] : [categoria])
      .map((cat) => ({ cat, items: data.filter((s) => s.categoria === cat) }))
      .filter((g) => g.items.length)

  return (
    <div className="container-page py-10 md:py-16">
      <PageHeader title="Servicios" description="Precios finales en bolivianos. Reserva en línea o pasa por el local." />

      <Segmented
        label="Filtrar por categoría"
        className="mt-8"
        options={CATEGORIAS.map((c) => ({ value: c, label: c }))}
        value={categoria}
        onChange={(c) => setParams(c === 'Todos' ? {} : { categoria: c }, { replace: true })}
      />

      <div className="mt-10">
        <AsyncBoundary
          resource={servicios}
          skeleton={<div className="flex flex-col gap-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-24" />)}</div>}
          empty={<EmptyState icon={Scissors} title="No hay servicios en esta categoría" />}
        >
          {(data) => (
            <div className="flex flex-col gap-14">
              {grupos(data).map(({ cat, items }) => (
                <section key={cat} aria-labelledby={`cat-${cat}`}>
                  <h2 id={`cat-${cat}`} className="border-b border-ink pb-3 text-3xl font-medium">
                    {cat}
                  </h2>
                  <ul className="divide-y divide-line">
                    {items.map((s) => (
                      <li key={s.id} className="grid gap-3 py-6 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8">
                        <div>
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <h3 className="font-sans text-lg font-medium">{s.nombre}</h3>
                            <span className="inline-flex items-center gap-1 text-sm text-ink-muted">
                              <Clock className="size-3.5" aria-hidden="true" /> {formatDuration(s.duracion)}
                            </span>
                          </div>
                          <p className="mt-1 max-w-[62ch] text-ink-muted">{s.descripcion}</p>
                        </div>
                        <div className="flex items-center justify-between gap-6 sm:justify-end">
                          <span className="tabular text-lg">{formatCurrency(s.precio)}</span>
                          <Button to={`/reservar?servicio=${s.id}`} variant="secondary" size="sm">
                            Reservar
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </AsyncBoundary>
      </div>
    </div>
  )
}
