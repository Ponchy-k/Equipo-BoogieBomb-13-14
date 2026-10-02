import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Search, TriangleAlert, Users } from 'lucide-react'
import { AsyncBoundary, Avatar, Badge, EmptyState, Input, PageHeader, SkeletonList } from '../../components/ui'
import { useResource } from '../../hooks/useResource'
import { getClientes } from '../../services'
import { formatDate } from '../../utils/format'

export default function ClientesLista({ base }) {
  const [q, setQ] = useState('')
  const [busqueda, setBusqueda] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setBusqueda(q), 250)
    return () => clearTimeout(t)
  }, [q])
  const clientes = useResource(() => getClientes({ q: busqueda }), [busqueda])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Clientes" description="Datos de contacto, alergias e historial de cada cliente." />
      <div className="max-w-md">
        <label htmlFor="buscar-cliente" className="sr-only">Buscar cliente</label>
        <Input id="buscar-cliente" type="search" icon={Search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, teléfono o correo" />
      </div>
      <AsyncBoundary
        resource={clientes}
        skeleton={<SkeletonList rows={6} />}
        empty={<EmptyState icon={Users} title="No encontramos clientes" description="Revisa cómo escribiste el nombre o el teléfono." />}
      >
        {(data) => (
          <ul className="divide-y divide-line rounded-card border border-line bg-surface">
            {data.map((c) => (
              <li key={c.id}>
                <Link to={`${base}/${c.id}`} className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-stone/50">
                  <Avatar nombre={c.nombre} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{c.nombre}</p>
                      {c.notas && <Badge tone="warning" icon={TriangleAlert}>Notas</Badge>}
                      {c.inasistencias >= 2 && <Badge tone="danger">{c.inasistencias} inasistencias</Badge>}
                    </div>
                    <p className="tabular truncate text-sm text-ink-muted">{c.telefono} · {c.correo}</p>
                  </div>
                  <div className="hidden text-right text-sm md:block">
                    <p className="tabular">{c.totalCitas} citas</p>
                    <p className="text-ink-muted">{c.ultimaVisita ? `Última: ${formatDate(c.ultimaVisita)}` : 'Sin visitas'}</p>
                  </div>
                  <ChevronRight className="size-4 text-ink-subtle" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AsyncBoundary>
    </div>
  )
}
