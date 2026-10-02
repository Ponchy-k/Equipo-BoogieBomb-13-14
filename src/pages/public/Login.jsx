import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Scissors, ShieldCheck, UserRound } from 'lucide-react'
import { Button, Card, Field, Input, Placeholder } from '../../components/ui'
import { INICIO_ROL, useAuth } from '../../context/AuthContext'

const demo = [
  { rol: 'cliente', label: 'Entrar como Cliente', detalle: 'Reservar citas, ver pedidos', icon: UserRound },
  { rol: 'empleado', label: 'Entrar como Empleado', detalle: 'Agenda, tareas y walk-ins', icon: Scissors },
  { rol: 'admin', label: 'Entrar como Administrador', detalle: 'Gestión completa del local', icon: ShieldCheck },
]

export default function Login() {
  const { login, loginDemo } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ correo: '', password: '' })
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(null)

  const destino = (rol) => {
    const desde = location.state?.desde
    // Solo el cliente vuelve a la página pública que pidió (por ejemplo /reservar).
    return rol === 'cliente' && desde ? desde : INICIO_ROL[rol]
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.correo.trim()) errs.correo = 'Ingresa tu correo electrónico.'
    else if (!/^\S+@\S+\.\S+$/.test(form.correo)) errs.correo = 'Revisa el formato del correo (ejemplo: nombre@correo.com).'
    if (!form.password) errs.password = 'Ingresa tu contraseña.'
    setErrores(errs)
    if (Object.keys(errs).length) return
    setEnviando('form')
    const u = await login(form.correo, form.password)
    navigate(destino(u.rol), { replace: true })
  }

  const entrarDemo = async (rol) => {
    setEnviando(rol)
    await loginDemo(rol)
    navigate(destino(rol), { replace: true })
  }

  return (
    <div className="container-page grid gap-10 py-10 md:py-16 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
      <Placeholder tono={5} className="hidden min-h-[560px] rounded-card lg:flex" icon={Scissors} iconClassName="size-14" />

      <div className="mx-auto flex w-full max-w-md flex-col gap-8 lg:mx-0 lg:py-6">
        <div>
          <h1 className="text-4xl font-medium md:text-5xl">Ingresar</h1>
          <p className="mt-2 text-ink-muted">Accede para reservar y seguir tus pedidos.</p>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <Field label="Correo electrónico" error={errores.correo}>
            <Input
              type="email"
              autoComplete="email"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
              placeholder="nombre@correo.com"
            />
          </Field>
          <Field label="Contraseña" error={errores.password} hint={!errores.password ? 'En la demo se acepta cualquier contraseña.' : undefined}>
            <Input
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>
          <Button type="submit" size="lg" loading={enviando === 'form'} className="mt-1">
            Ingresar
          </Button>
          <p className="text-center text-sm text-ink-muted">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" state={location.state} className="font-medium text-ink underline underline-offset-4 hover:text-accent">
              Regístrate
            </Link>
          </p>
        </form>

        <Card className="p-5">
          <h2 className="font-sans text-base font-medium">Acceso de demostración</h2>
          <p className="mt-1 text-sm text-ink-muted">Entra directo con un usuario de prueba.</p>
          <div className="mt-4 flex flex-col gap-2">
            {demo.map(({ rol, label, detalle, icon: Icon }) => (
              <button
                key={rol}
                onClick={() => entrarDemo(rol)}
                disabled={enviando != null}
                className="group flex min-h-14 items-center gap-3 rounded-control border border-line bg-bg px-3.5 py-2.5 text-left transition-colors hover:border-accent-line hover:bg-accent-soft/50 disabled:opacity-60"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-surface text-ink border border-line">
                  <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <span className="block text-[15px] font-medium text-ink">{label}</span>
                  <span className="block text-sm text-ink-muted">{detalle}</span>
                </span>
                <ArrowRight
                  className="size-4 text-ink-subtle transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
