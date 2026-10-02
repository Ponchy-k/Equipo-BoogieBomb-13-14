import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  CalendarDays, ClipboardList, Contact, ExternalLink, LayoutDashboard, ListChecks, LogOut, Menu,
  Package, PanelLeftClose, PanelLeftOpen, Scissors, ShoppingBag, UserPlus, Users, Wallet, X,
} from 'lucide-react'
import { Logo } from './Logo'
import { Avatar, Badge, Button } from '../ui'
import { NOMBRE_ROL, useAuth } from '../../context/AuthContext'
import { EstadoEmpleado } from '../../pages/empleado/EstadoEmpleado'
import { cn } from '../../utils/format'

export const NAV = {
  empleado: [
    { to: '/empleado', label: 'Mi agenda', icon: CalendarDays, end: true },
    { to: '/empleado/sin-cita', label: 'Registrar sin cita', icon: UserPlus },
    { to: '/empleado/tareas', label: 'Mis tareas', icon: ListChecks },
    { to: '/empleado/clientes', label: 'Clientes', icon: Users },
  ],
  admin: [
    { to: '/admin', label: 'Resumen', icon: LayoutDashboard, end: true },
    { to: '/admin/citas', label: 'Citas', icon: CalendarDays },
    { to: '/admin/empleados', label: 'Empleados', icon: Contact },
    { to: '/admin/servicios', label: 'Servicios', icon: Scissors },
    { to: '/admin/productos', label: 'Productos', icon: Package },
    { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
    { to: '/admin/tareas', label: 'Tareas', icon: ClipboardList },
    { to: '/admin/clientes', label: 'Clientes', icon: Users },
    { to: '/admin/caja', label: 'Caja del día', icon: Wallet },
  ],
}

const COLAPSO_KEY = 'lumina:sidebar-colapsado'

function SidebarNav({ items, colapsado, onNavigate }) {
  return (
    <nav aria-label="Panel" className="flex flex-col gap-0.5">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          title={colapsado ? label : undefined}
          className={({ isActive }) =>
            cn(
              'group flex h-10 items-center gap-3 rounded-control px-3 text-[15px] transition-colors',
              colapsado && 'justify-center px-0',
              isActive ? 'bg-ink text-bg' : 'text-ink-muted hover:bg-stone hover:text-ink',
            )
          }
        >
          <Icon className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span className={cn(colapsado && 'sr-only')}>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export function DashboardLayout() {
  const { usuario, rol, logout } = useAuth()
  const location = useLocation()
  const [drawer, setDrawer] = useState(false)
  const [colapsado, setColapsado] = useState(() => {
    try {
      return localStorage.getItem(COLAPSO_KEY) === '1'
    } catch {
      return false
    }
  })
  const items = NAV[rol] ?? []

  useEffect(() => {
    try {
      localStorage.setItem(COLAPSO_KEY, colapsado ? '1' : '0')
    } catch {
      /* preferencia solo en memoria */
    }
  }, [colapsado])

  useEffect(() => {
    setDrawer(false)
    document.getElementById('panel-contenido')?.focus({ preventScroll: true })
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    if (!drawer) return
    const esc = (e) => e.key === 'Escape' && setDrawer(false)
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [drawer])

  const pie = (compacto) => (
    <div className={cn('flex flex-col gap-0.5 border-t border-line pt-3', compacto && 'items-center')}>
      <Link
        to="/"
        title={compacto ? 'Ver sitio público' : undefined}
        className={cn('flex h-10 items-center gap-3 rounded-control px-3 text-sm text-ink-muted hover:bg-stone hover:text-ink', compacto && 'w-10 justify-center px-0')}
      >
        <ExternalLink className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        <span className={cn(compacto && 'sr-only')}>Ver sitio público</span>
      </Link>
      <button
        onClick={logout}
        title={compacto ? 'Cerrar sesión' : undefined}
        className={cn('flex h-10 items-center gap-3 rounded-control px-3 text-sm text-ink-muted hover:bg-stone hover:text-ink', compacto && 'w-10 justify-center px-0')}
      >
        <LogOut className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        <span className={cn(compacto && 'sr-only')}>Cerrar sesión</span>
      </button>
    </div>
  )

  return (
    <div className="min-h-[100dvh] bg-bg lg:flex">
      {/* Sidebar escritorio */}
      <aside
        className={cn(
          'sticky top-0 hidden h-[100dvh] shrink-0 flex-col border-r border-line bg-surface px-3 py-4 transition-[width] duration-300 ease-out-soft lg:flex',
          colapsado ? 'w-[76px]' : 'w-64',
        )}
      >
        <div className={cn('mb-6 flex items-center px-1', colapsado ? 'justify-center' : 'justify-between')}>
          <Logo to={rol === 'admin' ? '/admin' : '/empleado'} compact={colapsado} />
          {!colapsado && (
            <Button variant="ghost" size="icon-sm" onClick={() => setColapsado(true)} aria-label="Contraer menú lateral">
              <PanelLeftClose className="size-4" strokeWidth={1.75} />
            </Button>
          )}
        </div>
        {colapsado && (
          <Button variant="ghost" size="icon-sm" onClick={() => setColapsado(false)} aria-label="Expandir menú lateral" className="mx-auto mb-3">
            <PanelLeftOpen className="size-4" strokeWidth={1.75} />
          </Button>
        )}
        <div className="flex-1 overflow-y-auto">
          <SidebarNav items={items} colapsado={colapsado} />
        </div>
        {pie(colapsado)}
      </aside>

      {/* Drawer móvil / tablet */}
      {drawer && (
        <div className="fixed inset-0 z-[var(--z-drawer)] lg:hidden" role="dialog" aria-modal="true" aria-label="Menú del panel">
          <div className="absolute inset-0 animate-fade-in bg-ink/35" onClick={() => setDrawer(false)} aria-hidden="true" />
          <aside className="relative flex h-full w-72 max-w-[85vw] animate-rise-in flex-col bg-surface px-3 py-4 shadow-raised">
            <div className="mb-6 flex items-center justify-between px-1">
              <Logo to={rol === 'admin' ? '/admin' : '/empleado'} />
              <Button variant="ghost" size="icon-sm" onClick={() => setDrawer(false)} aria-label="Cerrar menú">
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav items={items} onNavigate={() => setDrawer(false)} />
            </div>
            {pie(false)}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-[var(--z-header)] flex h-16 items-center gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur md:px-8">
          <Button variant="ghost" size="icon" className="-ml-2 lg:hidden" onClick={() => setDrawer(true)} aria-label="Abrir menú">
            <Menu className="size-5" />
          </Button>
          <div className="flex-1" />
          {rol === 'empleado' && (
            <div className="hidden md:block">
              <EstadoEmpleado compacto />
            </div>
          )}
          <div className="flex items-center gap-3 border-l border-line pl-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-ink">{usuario?.nombre}</p>
              <p className="text-xs text-ink-muted">{NOMBRE_ROL[rol]}</p>
            </div>
            <Avatar nombre={usuario?.nombre} size="sm" />
            <Badge tone="accent" className="sm:hidden">{NOMBRE_ROL[rol]}</Badge>
          </div>
        </header>
        <main id="panel-contenido" tabIndex={-1} className="flex-1 px-4 pb-24 pt-6 outline-none md:px-8 md:pt-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
