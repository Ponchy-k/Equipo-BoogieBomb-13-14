import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Clock, MapPin, MessageCircle, Phone, Scissors, Sparkles, UserRoundX } from 'lucide-react'
import { AsyncBoundary, Avatar, Button, EmptyState, Placeholder, Skeleton } from '../../components/ui'
import { ProductCard } from '../../components/shop/ProductCard'
import { useResource } from '../../hooks/useResource'
import { getEmpleados, getGaleria, getProductos, getSalon, getServicios } from '../../services'
import { cn, formatCurrency, formatDuration } from '../../utils/format'

export default function Landing() {
  return (
    <>
      <Hero />
      <ServiciosDestacados />
      <DisponiblesAhora />
      <Galeria />
      <ProductosDestacados />
      <Ubicacion />
    </>
  )
}

function Hero() {
  return (
    <section className="container-page grid items-center gap-10 pb-16 pt-10 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24">
      <div className="flex max-w-xl flex-col gap-6 animate-rise-in">
        <h1 className="text-5xl font-medium leading-[1.05] md:text-6xl lg:text-7xl">
          Cortes, color y barba con calma.
        </h1>
        <p className="max-w-[46ch] text-lg text-ink-muted">
          Salón y barbería en Sopocachi. Reserva en línea con el profesional que prefieras, sin esperas.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button to="/reservar" size="lg" icon={ArrowRight} className="flex-row-reverse">
            Reservar cita
          </Button>
          <Button to="/servicios" size="lg" variant="secondary">
            Ver servicios
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-[1.4fr_1fr] gap-3 md:gap-4">
        <Placeholder tono={5} icon={Scissors} label="Imagen del salón (placeholder)" className="row-span-2 aspect-[3/4] rounded-card" iconClassName="size-12" />
        <Placeholder tono={2} icon={Sparkles} className="aspect-square rounded-card" />
        <Placeholder tono={4} className="aspect-square rounded-card" />
      </div>
    </section>
  )
}

function ServiciosDestacados() {
  const servicios = useResource(() => getServicios(), [])
  return (
    <section className="border-y border-line bg-surface">
      <div className="container-page py-16 md:py-24">
        <div className="mb-10 flex flex-col gap-3 md:mb-14">
          <h2 className="text-4xl font-medium md:text-5xl">Servicios más pedidos</h2>
          <p className="max-w-[55ch] text-ink-muted">Precios finales en bolivianos. La duración incluye lavado y acabado.</p>
        </div>
        <AsyncBoundary
          resource={servicios}
          skeleton={
            <div className="grid gap-10 md:grid-cols-2">
              {[0, 1].map((i) => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="h-7 w-32" />
                  {[0, 1, 2].map((j) => <Skeleton key={j} className="h-14" />)}
                </div>
              ))}
            </div>
          }
        >
          {(data) => (
            <div className="grid gap-12 md:grid-cols-2 md:gap-16">
              {['Salón', 'Barbería'].map((cat) => (
                <div key={cat}>
                  <div className="flex items-baseline justify-between border-b border-ink pb-3">
                    <h3 className="text-3xl font-medium">{cat}</h3>
                    <Link to={`/servicios?categoria=${cat}`} className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
                      Ver todos <ArrowUpRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                  <ul>
                    {data
                      .filter((s) => s.categoria === cat && s.destacado)
                      .map((s) => (
                        <li key={s.id}>
                          <Link
                            to={`/reservar?servicio=${s.id}`}
                            className="group flex items-baseline gap-4 py-4 transition-colors"
                          >
                            <span className="flex-1">
                              <span className="block font-medium text-ink group-hover:underline group-hover:underline-offset-4">{s.nombre}</span>
                              <span className="text-sm text-ink-muted">{formatDuration(s.duracion)}</span>
                            </span>
                            <span className="tabular text-ink">{formatCurrency(s.precio)}</span>
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </AsyncBoundary>
      </div>
    </section>
  )
}

function DisponiblesAhora() {
  const empleados = useResource(() => getEmpleados({ estado: 'Disponible' }), [])
  return (
    <section className="container-page py-16 md:py-24">
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <div className="flex flex-col gap-3">
          <h2 className="text-4xl font-medium md:text-5xl">Disponibles ahora</h2>
          <p className="max-w-[40ch] text-ink-muted">Profesionales libres en este momento. Si estás cerca, puedes pasar sin cita.</p>
        </div>
        <AsyncBoundary
          resource={empleados}
          skeleton={<div className="grid gap-3 sm:grid-cols-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20" />)}</div>}
          empty={
            <EmptyState
              icon={UserRoundX}
              title="Todo el equipo está atendiendo"
              description="Reserva una cita para asegurar tu horario."
              action={<Button to="/reservar" variant="secondary" size="sm">Reservar cita</Button>}
            />
          }
        >
          {(data) => (
            <ul className="grid gap-3 sm:grid-cols-2">
              {data.map((e) => (
                <li key={e.id} className="flex items-center gap-4 rounded-card border border-line bg-surface p-4">
                  <Avatar nombre={e.nombre} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{e.nombre}</p>
                    <p className="text-sm text-ink-muted">{e.especialidad}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm text-success">
                    <span className="size-2 rounded-full bg-success" aria-hidden="true" />
                    Libre
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AsyncBoundary>
      </div>
    </section>
  )
}

function Galeria() {
  const galeria = useResource(getGaleria, [])
  // Bento de 5 celdas exactas: 1 grande (2x2) + 4 pequeñas, sin huecos en 2 o 4 columnas.
  return (
    <section className="border-t border-line bg-stone/40">
      <div className="container-page py-16 md:py-24">
        <h2 className="mb-10 text-4xl font-medium md:text-5xl">Trabajos recientes</h2>
        <AsyncBoundary resource={galeria} skeleton={<Skeleton className="h-96 w-full rounded-card" />}>
          {(data) => (
            <ul className="grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[200px] md:grid-cols-4 md:gap-4">
              {data.slice(0, 5).map((g, i) => (
                <li key={g.id} className={cn('group relative overflow-hidden rounded-card', i === 0 && 'col-span-2 row-span-2')}>
                  <Placeholder tono={g.tono} icon={g.categoria === 'Barbería' ? Scissors : Sparkles} label={g.titulo} className="h-full w-full" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-4 pt-10">
                    <p className="text-sm font-medium text-bg">{g.titulo}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AsyncBoundary>
      </div>
    </section>
  )
}

function ProductosDestacados() {
  const productos = useResource(() => getProductos({ soloDestacados: true }), [])
  return (
    <section className="container-page py-16 md:py-24">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-4xl font-medium md:text-5xl">Para llevar a casa</h2>
          <p className="max-w-[45ch] text-ink-muted">Pide en línea y recoge en el local. Pagas al retirar.</p>
        </div>
        <Button to="/tienda" variant="secondary" className="max-sm:hidden">
          Ir a la tienda
        </Button>
      </div>
      <AsyncBoundary
        resource={productos}
        skeleton={<div className="grid grid-cols-2 gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="aspect-[4/5]" />)}</div>}
      >
        {(data) => (
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
            {data.slice(0, 4).map((p) => (
              <ProductCard key={p.id} producto={p} className="w-[62vw] max-w-[260px] shrink-0 snap-start md:w-auto md:max-w-none" />
            ))}
          </div>
        )}
      </AsyncBoundary>
      <Button to="/tienda" variant="secondary" className="mt-6 w-full sm:hidden">
        Ir a la tienda
      </Button>
    </section>
  )
}

function Ubicacion() {
  const { data: salon } = useResource(getSalon, [])
  return (
    <section className="container-page">
      <div className="grid overflow-hidden rounded-card border border-line bg-surface lg:grid-cols-2">
        <Placeholder tono={3} icon={MapPin} label="Mapa de ubicación (placeholder)" className="min-h-64 lg:min-h-[420px]" iconClassName="size-10" />
        <div className="flex flex-col gap-8 p-6 md:p-10">
          <h2 className="text-4xl font-medium md:text-5xl">Visítanos en Sopocachi</h2>
          {salon ? (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <p className="font-medium">{salon.direccion}</p>
                  <p className="text-sm text-ink-muted">{salon.ciudad}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <p className="tabular font-medium">{salon.telefono}</p>
                  <p className="text-sm text-ink-muted">{salon.correo}</p>
                </div>
              </div>
              <div className="flex gap-3 sm:col-span-2">
                <Clock className="mt-0.5 size-5 shrink-0 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
                <dl className="grid flex-1 gap-1 text-sm">
                  {salon.horarios.map((h) => (
                    <div key={h.dias} className="flex justify-between gap-4 sm:justify-start sm:gap-6">
                      <dt className="text-ink-muted sm:w-36">{h.dias}</dt>
                      <dd className="tabular font-medium">{h.horas}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          ) : (
            <Skeleton className="h-32" />
          )}
          <div className="mt-auto flex flex-col gap-3 sm:flex-row">
            <Button
              href={salon ? `https://wa.me/${salon.whatsapp}?text=${encodeURIComponent('Hola Lumina, quisiera consultar por un servicio.')}` : undefined}
              target="_blank"
              rel="noreferrer"
              variant="dark"
              icon={MessageCircle}
            >
              Escribir por WhatsApp
            </Button>
            <Button to="/contacto" variant="secondary">
              Más formas de contacto
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
