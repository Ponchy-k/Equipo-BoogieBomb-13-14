import { Link } from 'react-router-dom'
import { ArrowUpRight, CalendarDays, ClipboardList, PackageX, ShoppingBag, UserPlus, Wallet } from 'lucide-react'
import { AsyncBoundary, Card, EmptyState, PageHeader, Skeleton, StatCard, StatusBadge } from '../../components/ui'
import { useResource } from '../../hooks/useResource'
import { getCitas, getIngresosSemana, getProductos, getResumenDashboard } from '../../services'
import { hoy } from '../../utils/fecha'
import { cn, formatCurrency, formatDateLong, formatRange } from '../../utils/format'
import { NOMBRES_DIA_CORTO, diaSemana } from '../../utils/fecha'

export default function Dashboard() {
  const resumen = useResource(getResumenDashboard, [])
  const semana = useResource(getIngresosSemana, [])
  const citasHoy = useResource(() => getCitas({ fecha: hoy() }), [])
  const productos = useResource(() => getProductos(), [])

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Resumen" description={<span className="first-letter:uppercase inline-block">{formatDateLong(hoy())}</span>} />

      <AsyncBoundary
        resource={resumen}
        skeleton={<div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-32 rounded-card" />)}</div>}
      >
        {(r) => (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <Enlace to="/admin/citas"><StatCard label="Citas de hoy" value={r.citasHoy} icon={CalendarDays} hint={`${r.citasPendientesHoy} por atender`} /></Enlace>
            <Enlace to="/admin/caja"><StatCard label="Servicios sin cita hoy" value={r.walkinsHoy} icon={UserPlus} /></Enlace>
            <Enlace to="/admin/caja"><StatCard label="Ingresos del día" value={formatCurrency(r.ingresosHoy)} icon={Wallet} /></Enlace>
            <Enlace to="/admin/pedidos"><StatCard label="Pedidos pendientes" value={r.pedidosPendientes} icon={ShoppingBag} tone={r.pedidosPendientes ? 'warning' : undefined} hint={r.pedidosPendientes ? 'Preparar para retiro' : 'Nada pendiente'} /></Enlace>
            <Enlace to="/admin/tareas"><StatCard label="Tareas vencidas" value={r.tareasVencidas} icon={ClipboardList} tone={r.tareasVencidas ? 'danger' : undefined} hint={r.tareasVencidas ? 'Revisar responsables' : 'Todo al día'} /></Enlace>
            <Enlace to="/admin/productos"><StatCard label="Stock bajo" value={r.stockBajo} icon={PackageX} tone={r.stockBajo ? 'warning' : undefined} hint={r.stockBajo ? 'Productos por reponer' : 'Inventario en orden'} /></Enlace>
          </div>
        )}
      </AsyncBoundary>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-5 md:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-2xl font-medium">Ingresos de la semana</h2>
            <div className="flex gap-4 text-xs text-ink-muted">
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-accent" />Servicios</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-sand" />Productos</span>
            </div>
          </div>
          <AsyncBoundary resource={semana} skeleton={<Skeleton className="mt-6 h-64" />}>
            {(data) => <GraficoSemana data={data} />}
          </AsyncBoundary>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-2xl font-medium">Próximas de hoy</h2>
            <Link to="/admin/citas" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">Ver todas <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
          </div>
          <AsyncBoundary resource={citasHoy} skeleton={<div className="p-5"><Skeleton className="h-40" /></div>}>
            {(data) => {
              const proximas = data.filter((c) => ['Pendiente', 'Confirmada', 'En atención'].includes(c.estado)).slice(0, 6)
              return proximas.length ? (
                <ul className="divide-y divide-line">
                  {proximas.map((c) => (
                    <li key={c.id} className="flex items-center gap-4 px-5 py-3">
                      <span className="tabular w-12 text-sm font-medium">{c.horaInicio}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{c.cliente?.nombre}</p>
                        <p className="truncate text-xs text-ink-muted">{c.servicio?.nombre} · {c.empleado?.nombre.split(' ')[0]}</p>
                      </div>
                      <StatusBadge estado={c.estado} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState className="m-5" icon={CalendarDays} title="No quedan citas por hoy" />
              )
            }}
          </AsyncBoundary>
        </Card>
      </div>

      <AsyncBoundary resource={productos} skeleton={null}>
        {(data) => {
          const bajos = data.filter((p) => p.stock <= p.stockMinimo)
          if (!bajos.length) return null
          return (
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-medium">Stock bajo</h2>
                <Link to="/admin/productos" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">Inventario <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {bajos.map((p) => (
                  <li key={p.id} className="rounded-control border border-warning/25 bg-warning-soft px-3 py-1.5 text-sm">
                    {p.nombre} <span className="tabular font-medium text-warning">({p.stock}/{p.stockMinimo})</span>
                  </li>
                ))}
              </ul>
            </Card>
          )
        }}
      </AsyncBoundary>
    </div>
  )
}

function Enlace({ to, children }) {
  return (
    <Link to={to} className="block rounded-card transition-transform duration-200 hover:-translate-y-0.5 [&>*]:h-full">
      {children}
    </Link>
  )
}

/** Gráfico de barras apiladas en CSS (sin librerías). */
function GraficoSemana({ data }) {
  const max = Math.max(...data.map((d) => d.total), 1)
  const tope = Math.ceil(max / 500) * 500
  const total = data.reduce((a, d) => a + d.total, 0)
  return (
    <figure className="mt-6">
      <p className="tabular text-3xl font-medium">{formatCurrency(total)}</p>
      <p className="text-sm text-ink-muted">Últimos 7 días</p>
      <div className="mt-6 flex h-56 items-end gap-2 border-b border-line sm:gap-4" aria-hidden="true">
        {data.map((d) => {
          const esHoy = d.fecha === hoy()
          return (
            <div key={d.fecha} className="group relative flex h-full flex-1 flex-col justify-end">
              <span className="tabular pointer-events-none absolute -top-1 left-1/2 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-control bg-ink px-2 py-1 text-xs text-bg group-hover:block">
                {formatCurrency(d.total)}
              </span>
              <div className="flex flex-col overflow-hidden rounded-t-[4px]" style={{ height: `${(d.total / tope) * 100}%` }}>
                <div className="bg-sand" style={{ height: `${d.total ? (d.productos / d.total) * 100 : 0}%` }} />
                <div className={cn('flex-1', esHoy ? 'bg-accent' : 'bg-accent/75')} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-4" aria-hidden="true">
        {data.map((d) => (
          <span key={d.fecha} className={cn('flex-1 text-center text-xs', d.fecha === hoy() ? 'font-medium text-ink' : 'text-ink-muted')}>
            {d.fecha === hoy() ? 'hoy' : NOMBRES_DIA_CORTO[diaSemana(d.fecha)]}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>Ingresos por día</caption>
        <thead><tr><th>Día</th><th>Servicios</th><th>Productos</th><th>Total</th></tr></thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.fecha}><td>{d.fecha}</td><td>{formatCurrency(d.servicios)}</td><td>{formatCurrency(d.productos)}</td><td>{formatCurrency(d.total)}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
