import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarX, Mail, Phone, ShoppingBag, TriangleAlert } from 'lucide-react'
import { AsyncBoundary, Avatar, Card, EmptyState, Skeleton, StatCard, StatusBadge, Table, Td, Th } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useResource } from '../../hooks/useResource'
import { getCliente } from '../../services'
import { formatCurrency, formatDate, formatRange } from '../../utils/format'

export default function FichaCliente({ base }) {
  const { id } = useParams()
  const { rol } = useAuth()
  const cliente = useResource(() => getCliente(id), [id])

  return (
    <div className="flex flex-col gap-6">
      <Link to={base} className="inline-flex h-9 items-center gap-2 self-start text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> Clientes
      </Link>
      <AsyncBoundary
        resource={cliente}
        skeleton={<div className="flex flex-col gap-4"><Skeleton className="h-24" /><Skeleton className="h-64" /></div>}
      >
        {(c) => {
          const completadas = c.citas.filter((x) => x.estado === 'Completada')
          return (
            <>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <Avatar nombre={c.nombre} size="lg" />
                <div className="flex-1">
                  <h1 className="text-3xl font-medium md:text-4xl">{c.nombre}</h1>
                  <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-muted">
                    <a href={`tel:${c.telefono.replace(/\s/g, '')}`} className="tabular inline-flex items-center gap-1.5 hover:text-ink"><Phone className="size-3.5" aria-hidden="true" />{c.telefono}</a>
                    <a href={`mailto:${c.correo}`} className="inline-flex items-center gap-1.5 hover:text-ink"><Mail className="size-3.5" aria-hidden="true" />{c.correo}</a>
                    <span>Cliente desde {formatDate(c.registradoEn)}</span>
                  </div>
                </div>
              </div>

              {c.notas ? (
                <div role="note" className="flex gap-3 rounded-card border border-warning/30 bg-warning-soft p-4">
                  <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" strokeWidth={1.75} aria-hidden="true" />
                  <div>
                    <p className="font-medium">Notas y alergias</p>
                    <p className="mt-0.5 text-ink-muted">{c.notas}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-ink-muted">Sin notas ni alergias registradas.</p>
              )}

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Servicios realizados" value={completadas.length} />
                <StatCard label="Gasto en servicios" value={formatCurrency(c.gastoServicios)} />
                <StatCard label="Compras en tienda" value={formatCurrency(c.gastoProductos)} icon={ShoppingBag} />
                <StatCard
                  label="Inasistencias"
                  value={c.inasistencias}
                  icon={CalendarX}
                  tone={c.inasistencias >= 2 ? 'danger' : undefined}
                  hint={c.inasistencias >= 2 ? 'Confirmar antes de la cita' : undefined}
                />
              </div>

              <section aria-labelledby="historial-servicios">
                <h2 id="historial-servicios" className="mb-3 text-2xl font-medium">Historial de servicios</h2>
                {c.citas.length === 0 ? (
                  <EmptyState title="Sin citas registradas" />
                ) : (
                  <Table>
                    <thead>
                      <tr><Th>Fecha</Th><Th>Servicio</Th><Th>Profesional</Th><Th>Estado</Th><Th className="text-right">Precio</Th></tr>
                    </thead>
                    <tbody>
                      {c.citas.map((x) => (
                        <tr key={x.id}>
                          <Td><span className="whitespace-nowrap">{formatDate(x.fecha)}</span><span className="tabular block text-xs text-ink-muted">{formatRange(x.horaInicio, x.horaFin)}</span></Td>
                          <Td>{x.servicio}</Td>
                          <Td>{x.empleado}</Td>
                          <Td><StatusBadge estado={x.estado} /></Td>
                          <Td className="tabular text-right">{formatCurrency(x.precio)}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </section>

              {rol === 'admin' && (
                <section aria-labelledby="compras">
                  <h2 id="compras" className="mb-3 text-2xl font-medium">Compras</h2>
                  {c.pedidos.length === 0 ? (
                    <EmptyState icon={ShoppingBag} title="Sin pedidos en la tienda" />
                  ) : (
                    <Card>
                      <ul className="divide-y divide-line">
                        {c.pedidos.map((p) => (
                          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                            <div>
                              <p className="tabular font-medium">{p.id} · {formatDate(p.fechaCreacion)}</p>
                              <p className="text-sm text-ink-muted">{p.items.map((i) => `${i.cantidad} × ${i.nombre}`).join(', ')}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="tabular">{formatCurrency(p.total)}</span>
                              <StatusBadge estado={p.estado} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </section>
              )}
            </>
          )
        }}
      </AsyncBoundary>
    </div>
  )
}
