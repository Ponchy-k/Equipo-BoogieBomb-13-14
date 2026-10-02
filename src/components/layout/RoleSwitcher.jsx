import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskConical, LogOut, RotateCcw, ShieldCheck, Scissors, UserRound, X } from 'lucide-react'
import { INICIO_ROL, NOMBRE_ROL, useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useToast } from '../ui'
import { cn } from '../../utils/format'

const roles = [
  { rol: 'cliente', icon: UserRound },
  { rol: 'empleado', icon: Scissors },
  { rol: 'admin', icon: ShieldCheck },
]

/** Selector flotante para cambiar de rol durante la presentación. */
export function RoleSwitcher() {
  const [abierto, setAbierto] = useState(false)
  const [cambiando, setCambiando] = useState(null)
  const { rol, loginDemo, logout } = useAuth()
  const { restablecer } = useData()
  const toast = useToast()
  const navigate = useNavigate()
  const ref = useRef(null)

  useEffect(() => {
    if (!abierto) return
    const fuera = (e) => !ref.current?.contains(e.target) && setAbierto(false)
    const esc = (e) => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('pointerdown', fuera)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', fuera)
      document.removeEventListener('keydown', esc)
    }
  }, [abierto])

  const cambiar = async (nuevo) => {
    setCambiando(nuevo)
    await loginDemo(nuevo)
    setCambiando(null)
    setAbierto(false)
    navigate(INICIO_ROL[nuevo])
  }

  return (
    <div ref={ref} className="fixed bottom-4 left-4 z-[var(--z-switcher)] print:hidden">
      {abierto && (
        <div
          role="dialog"
          aria-label="Modo demo: cambiar de rol"
          className="mb-2 w-64 animate-rise-in rounded-card border border-line bg-surface p-2 shadow-raised"
        >
          <div className="flex items-center justify-between px-2 pb-2 pt-1">
            <p className="text-xs font-medium text-ink-muted">Ver la app como</p>
            <button onClick={() => setAbierto(false)} className="rounded p-1 text-ink-subtle hover:text-ink" aria-label="Cerrar">
              <X className="size-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-0.5">
            {roles.map(({ rol: r, icon: Icon }) => (
              <button
                key={r}
                onClick={() => cambiar(r)}
                disabled={cambiando != null}
                aria-current={rol === r ? 'true' : undefined}
                className={cn(
                  'flex h-10 items-center gap-2.5 rounded-control px-2.5 text-left text-sm transition-colors',
                  rol === r ? 'bg-accent-soft text-accent-hover font-medium' : 'text-ink hover:bg-stone',
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                <span className="flex-1">{NOMBRE_ROL[r]}</span>
                {rol === r && <span className="text-xs">Actual</span>}
                {cambiando === r && <span className="text-xs text-ink-muted">Entrando…</span>}
              </button>
            ))}
          </div>
          <div className="mt-2 flex flex-col gap-0.5 border-t border-line pt-2">
            {rol && (
              <button
                onClick={() => {
                  logout()
                  setAbierto(false)
                  navigate('/')
                }}
                className="flex h-9 items-center gap-2.5 rounded-control px-2.5 text-sm text-ink-muted hover:bg-stone hover:text-ink"
              >
                <LogOut className="size-4" strokeWidth={1.75} aria-hidden="true" />
                Cerrar sesión
              </button>
            )}
            <button
              onClick={() => {
                restablecer()
                toast.success('Datos de prueba restablecidos.')
                setAbierto(false)
              }}
              className="flex h-9 items-center gap-2.5 rounded-control px-2.5 text-sm text-ink-muted hover:bg-stone hover:text-ink"
            >
              <RotateCcw className="size-4" strokeWidth={1.75} aria-hidden="true" />
              Restablecer datos demo
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-label={`Modo demo${rol ? `, ${NOMBRE_ROL[rol]}` : ''}`}
        className="flex h-10 items-center justify-center gap-2 rounded-full border border-line-strong bg-surface/95 text-xs font-medium text-ink-muted shadow-soft backdrop-blur transition-colors hover:text-ink max-md:w-10 md:h-9 md:pl-3 md:pr-3.5"
      >
        <FlaskConical className="size-4 md:size-3.5" strokeWidth={1.75} aria-hidden="true" />
        <span className="max-md:hidden">Modo demo</span>
        {rol && <span className="text-ink max-md:hidden">· {NOMBRE_ROL[rol]}</span>}
      </button>
    </div>
  )
}
