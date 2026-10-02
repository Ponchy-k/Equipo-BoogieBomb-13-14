import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, ShoppingBag, UserRound, X, MapPin, Phone, Mail, MessageCircle } from 'lucide-react'
import { Logo } from './Logo'
import { Button } from '../ui'
import { INICIO_ROL, useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useResource } from '../../hooks/useResource'
import { getSalon } from '../../services'
import { cn } from '../../utils/format'

const enlaces = [
  { to: '/servicios', label: 'Servicios' },
  { to: '/tienda', label: 'Tienda' },
  { to: '/contacto', label: 'Contacto' },
]

function CuentaLink({ className, onClick }) {
  const { usuario, rol } = useAuth()
  const etiqueta = !usuario ? 'Ingresar' : rol === 'cliente' ? 'Mi cuenta' : 'Mi panel'
  return (
    <Button
      to={usuario ? INICIO_ROL[rol] : '/login'}
      variant="ghost"
      icon={UserRound}
      className={className}
      onClick={onClick}
    >
      {etiqueta}
    </Button>
  )
}

export function PublicLayout() {
  const [menu, setMenu] = useState(false)
  const { cantidad } = useCart()
  const location = useLocation()

  useEffect(() => {
    setMenu(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-control focus:bg-ink focus:px-4 focus:py-2 focus:text-bg">
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-[var(--z-header)] border-b border-line bg-bg/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Logo />
          <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
            {enlaces.map((e) => (
              <NavLink
                key={e.to}
                to={e.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-control px-3 py-2 text-[15px] transition-colors',
                    isActive ? 'text-ink font-medium' : 'text-ink-muted hover:text-ink',
                  )
                }
              >
                {e.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <Link
              to="/carrito"
              className="relative flex size-11 items-center justify-center rounded-control text-ink hover:bg-stone"
              aria-label={`Carrito, ${cantidad} ${cantidad === 1 ? 'producto' : 'productos'}`}
            >
              <ShoppingBag className="size-5" strokeWidth={1.5} />
              {cantidad > 0 && (
                <span className="tabular absolute right-1 top-1 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold leading-5 text-on-accent">
                  {cantidad}
                </span>
              )}
            </Link>
            <CuentaLink className="max-md:hidden" />
            <Button to="/reservar" className="max-sm:hidden">
              Reservar cita
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenu((v) => !v)}
              aria-expanded={menu}
              aria-controls="menu-movil"
              aria-label={menu ? 'Cerrar menú' : 'Abrir menú'}
            >
              {menu ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
        {menu && (
          <nav id="menu-movil" aria-label="Principal" className="animate-fade-in border-t border-line bg-bg md:hidden">
            <div className="container-page flex flex-col gap-1 py-4">
              {enlaces.map((e) => (
                <NavLink
                  key={e.to}
                  to={e.to}
                  className={({ isActive }) =>
                    cn('flex h-12 items-center rounded-control px-3 text-lg', isActive ? 'bg-stone font-medium' : 'text-ink')
                  }
                >
                  {e.label}
                </NavLink>
              ))}
              <CuentaLink className="h-12 justify-start px-3 text-lg" />
              <Button to="/reservar" size="lg" className="mt-2">
                Reservar cita
              </Button>
            </div>
          </nav>
        )}
      </header>

      <main id="contenido" className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

function Footer() {
  const { data: salon } = useResource(getSalon)
  return (
    <footer className="mt-24 border-t border-line bg-stone/50">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-xs text-sm text-ink-muted">Salón y barbería en Sopocachi. Cortes, color, barba y cuidado de manos.</p>
        </div>
        <div>
          <h2 className="font-sans text-sm font-medium text-ink">Visítanos</h2>
          {salon && (
            <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-muted">
              <li className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />{salon.direccion}, {salon.ciudad}</li>
              <li className="flex gap-2"><Phone className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />{salon.telefono}</li>
              <li className="flex gap-2"><Mail className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />{salon.correo}</li>
            </ul>
          )}
        </div>
        <div>
          <h2 className="font-sans text-sm font-medium text-ink">Horarios</h2>
          {salon && (
            <dl className="mt-3 flex flex-col gap-2 text-sm">
              {salon.horarios.map((h) => (
                <div key={h.dias} className="flex justify-between gap-4 md:block">
                  <dt className="text-ink-muted">{h.dias}</dt>
                  <dd className="tabular text-ink">{h.horas}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div>
          <h2 className="font-sans text-sm font-medium text-ink">Lumina</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li><Link to="/servicios" className="text-ink-muted hover:text-ink">Servicios y precios</Link></li>
            <li><Link to="/tienda" className="text-ink-muted hover:text-ink">Tienda</Link></li>
            <li><Link to="/reservar" className="text-ink-muted hover:text-ink">Reservar cita</Link></li>
            <li>
              {salon && (
                <a href={`https://wa.me/${salon.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-ink-muted hover:text-ink">
                  <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden="true" /> WhatsApp
                </a>
              )}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="container-page py-5 text-xs text-ink-muted">© {new Date().getFullYear()} Lumina Salón y Barbería · La Paz, Bolivia</p>
      </div>
    </footer>
  )
}
