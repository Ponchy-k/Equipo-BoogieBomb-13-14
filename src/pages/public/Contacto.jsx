import { useState } from 'react'
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import { Button, Card, Field, Input, PageHeader, Placeholder, Skeleton, Textarea, useToast } from '../../components/ui'
import { useResource } from '../../hooks/useResource'
import { getSalon } from '../../services'

export default function Contacto() {
  const { data: salon } = useResource(getSalon, [])
  const toast = useToast()
  const [form, setForm] = useState({ nombre: '', telefono: '', mensaje: '' })
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.nombre.trim()) errs.nombre = 'Escribe tu nombre.'
    if (!/^[+\d\s]{8,}$/.test(form.telefono)) errs.telefono = 'Ingresa un número válido para responderte.'
    if (form.mensaje.trim().length < 10) errs.mensaje = 'Cuéntanos un poco más (mínimo 10 caracteres).'
    setErrores(errs)
    if (Object.keys(errs).length) return
    setEnviando(true)
    // API: POST /api/contacto/
    await new Promise((r) => setTimeout(r, 500))
    setEnviando(false)
    setForm({ nombre: '', telefono: '', mensaje: '' })
    toast.success('Mensaje enviado. Te responderemos hoy mismo.')
  }

  const items = salon
    ? [
        { icon: MapPin, titulo: 'Dirección', texto: `${salon.direccion}, ${salon.ciudad}` },
        { icon: Phone, titulo: 'Teléfono', texto: salon.telefono, href: `tel:${salon.telefono.replace(/\s/g, '')}` },
        { icon: Mail, titulo: 'Correo', texto: salon.correo, href: `mailto:${salon.correo}` },
      ]
    : []

  return (
    <div className="container-page py-10 md:py-16">
      <PageHeader title="Contacto" description="Escríbenos para consultas, eventos o reservas de grupo." />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <div className="flex flex-col gap-8">
          {salon ? (
            <ul className="flex flex-col gap-5">
              {items.map(({ icon: Icon, titulo, texto, href }) => (
                <li key={titulo} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-control border border-line bg-surface">
                    <Icon className="size-4 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm text-ink-muted">{titulo}</p>
                    {href ? <a href={href} className="font-medium hover:underline hover:underline-offset-4">{texto}</a> : <p className="font-medium">{texto}</p>}
                  </div>
                </li>
              ))}
              <li className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-control border border-line bg-surface">
                  <Clock className="size-4 text-ink-muted" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <dl className="grid gap-1">
                  {salon.horarios.map((h) => (
                    <div key={h.dias} className="flex gap-3">
                      <dt className="w-32 text-ink-muted">{h.dias}</dt>
                      <dd className="tabular font-medium">{h.horas}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            </ul>
          ) : (
            <Skeleton className="h-56" />
          )}
          <Button
            href={salon ? `https://wa.me/${salon.whatsapp}` : undefined}
            target="_blank"
            rel="noreferrer"
            variant="dark"
            size="lg"
            icon={MessageCircle}
            className="self-start"
          >
            Escribir por WhatsApp
          </Button>
          <Placeholder tono={3} icon={MapPin} label="Mapa de ubicación (placeholder)" className="aspect-[16/9] rounded-card border border-line" iconClassName="size-10" />
        </div>

        <Card className="p-6 md:p-8">
          <h2 className="text-3xl font-medium">Envíanos un mensaje</h2>
          <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
            <Field label="Nombre" error={errores.nombre}>
              <Input autoComplete="name" value={form.nombre} onChange={set('nombre')} />
            </Field>
            <Field label="Teléfono" error={errores.telefono}>
              <Input type="tel" inputMode="tel" autoComplete="tel" value={form.telefono} onChange={set('telefono')} />
            </Field>
            <Field label="Mensaje" error={errores.mensaje}>
              <Textarea rows={5} value={form.mensaje} onChange={set('mensaje')} />
            </Field>
            <Button type="submit" size="lg" icon={Send} loading={enviando} className="mt-2 sm:self-start">
              Enviar mensaje
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
