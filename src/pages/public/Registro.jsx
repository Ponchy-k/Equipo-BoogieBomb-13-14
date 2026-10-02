import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Field, Input } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui'

export default function Registro() {
  const { registro } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ nombre: '', telefono: '', correo: '', password: '' })
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (form.nombre.trim().split(' ').length < 2) errs.nombre = 'Escribe tu nombre y apellido.'
    if (!/^[+\d\s]{8,}$/.test(form.telefono)) errs.telefono = 'Ingresa un número válido (ejemplo: 71234567).'
    if (!/^\S+@\S+\.\S+$/.test(form.correo)) errs.correo = 'Revisa el formato del correo.'
    if (form.password.length < 6) errs.password = 'Usa al menos 6 caracteres.'
    setErrores(errs)
    if (Object.keys(errs).length) return
    setEnviando(true)
    try {
      await registro({ nombre: form.nombre.trim(), telefono: form.telefono.trim(), correo: form.correo.trim() })
      toast.success('Cuenta creada. ¡Bienvenido a Lumina!')
      navigate(location.state?.desde ?? '/mi-cuenta', { replace: true })
    } catch (err) {
      setErrores({ correo: err.message })
      setEnviando(false)
    }
  }

  return (
    <div className="container-page flex justify-center py-10 md:py-16">
      <div className="flex w-full max-w-md flex-col gap-8">
        <div>
          <h1 className="text-4xl font-medium md:text-5xl">Crear cuenta</h1>
          <p className="mt-2 text-ink-muted">Reserva en segundos y guarda tus preferencias.</p>
        </div>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <Field label="Nombre completo" error={errores.nombre}>
            <Input autoComplete="name" value={form.nombre} onChange={set('nombre')} />
          </Field>
          <Field label="Teléfono / WhatsApp" error={errores.telefono} hint="Te avisaremos de tu cita por este número.">
            <Input type="tel" inputMode="tel" autoComplete="tel" value={form.telefono} onChange={set('telefono')} placeholder="71234567" />
          </Field>
          <Field label="Correo electrónico" error={errores.correo}>
            <Input type="email" autoComplete="email" value={form.correo} onChange={set('correo')} />
          </Field>
          <Field label="Contraseña" error={errores.password}>
            <Input type="password" autoComplete="new-password" value={form.password} onChange={set('password')} />
          </Field>
          <Button type="submit" size="lg" loading={enviando} className="mt-1">
            Crear cuenta
          </Button>
          <p className="text-center text-sm text-ink-muted">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" state={location.state} className="font-medium text-ink underline underline-offset-4 hover:text-accent">
              Ingresa
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
