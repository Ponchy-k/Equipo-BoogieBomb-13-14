import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CalendarCheck, Check, Clock, Shuffle, TriangleAlert } from 'lucide-react'
import { AsyncBoundary, Avatar, Button, Card, Field, Segmented, Skeleton, Textarea } from '../../components/ui'
import { SelectorFecha, SelectorHora } from '../../components/booking/SelectorHorario'
import { useAuth } from '../../context/AuthContext'
import { useAccion, useResource } from '../../hooks/useResource'
import { crearCita, getCliente, getEmpleados, getServicios } from '../../services'
import { diaSemana, hoy, sumarDias, sumarMinutos } from '../../utils/fecha'
import { cn, formatCurrency, formatDate, formatDuration } from '../../utils/format'

const PASOS = ['Servicio', 'Profesional', 'Fecha y hora', 'Confirmación']

function primeraFechaHabil() {
  const h = hoy()
  return diaSemana(h) === 0 ? sumarDias(h, 1) : h
}

export default function Reservar() {
  const [params] = useSearchParams()
  const { usuario } = useAuth()
  const servicios = useResource(() => getServicios(), [])
  const empleados = useResource(() => getEmpleados(), [])
  const cliente = useResource(() => getCliente(usuario.clienteId), [usuario.clienteId])
  const { ejecutar, pendiente } = useAccion()

  const inicial = params.get('servicio')
  const [paso, setPaso] = useState(inicial ? 1 : 0)
  const [servicioId, setServicioId] = useState(inicial)
  const [empleadoId, setEmpleadoId] = useState(null)
  const [fecha, setFecha] = useState(primeraFechaHabil)
  const [slot, setSlot] = useState(null)
  const [notas, setNotas] = useState('')
  const [cita, setCita] = useState(null)

  const servicio = servicios.data?.find((s) => s.id === servicioId)
  const empleado = empleados.data?.find((e) => e.id === empleadoId)
  const onSlot = useCallback((s) => setSlot(s), [])

  // Si el servicio de la URL no existe, se vuelve al primer paso.
  if (paso > 0 && servicios.data && !servicio) setPaso(0)
  const puedeAvanzar = [!!servicio, !!empleadoId, !!slot, true][paso]

  const ir = (n) => {
    setPaso(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const confirmar = async () => {
    const r = await ejecutar(
      () => crearCita({ clienteId: usuario.clienteId, empleadoId, servicioId, fecha, horaInicio: slot.hora, notas }),
      { exito: 'Tu cita quedó reservada.' },
    )
    if (r.ok) setCita(r.data)
    else {
      // El horario se ocupó mientras confirmaba: volver a elegir hora.
      setSlot(null)
      ir(2)
    }
  }

  if (cita) return <CitaReservada cita={cita} />

  return (
    <div className="container-page max-w-4xl py-10 md:py-14">
      <h1 className="text-4xl font-medium md:text-5xl">Reservar cita</h1>
      <Progreso paso={paso} onIr={(n) => n < paso && ir(n)} />

      <div className="mt-8 min-h-[360px]">
        {paso === 0 && (
          <PasoServicio servicios={servicios} value={servicioId} onChange={(id) => {
            setServicioId(id)
            setEmpleadoId(null)
            setSlot(null)
          }} />
        )}
        {paso === 1 && servicio && (
          <PasoProfesional
            empleados={empleados}
            servicio={servicio}
            value={empleadoId}
            onChange={(id) => {
              setEmpleadoId(id)
              setSlot(null)
            }}
          />
        )}
        {paso === 2 && (
          <section aria-labelledby="titulo-fecha" className="flex flex-col gap-8">
            <div>
              <h2 id="titulo-fecha" className="text-2xl font-medium">Elige el día</h2>
              <p className="mt-1 text-sm text-ink-muted">
                {servicio?.nombre} · {formatDuration(servicio?.duracion ?? 0)} · {empleado ? empleado.nombre : 'Cualquier profesional'}
              </p>
              <div className="mt-4">
                <SelectorFecha value={fecha} onChange={(f) => { setFecha(f); setSlot(null) }} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-medium">Horarios libres</h2>
              <p className="mt-1 mb-4 text-sm text-ink-muted">{formatDate(fecha)}. Solo mostramos horarios en los que el servicio completo cabe.</p>
              <SelectorHora empleadoId={empleadoId} servicioId={servicioId} fecha={fecha} value={slot} onChange={onSlot} />
            </div>
          </section>
        )}
        {paso === 3 && servicio && slot && (
          <PasoConfirmacion
            servicio={servicio}
            empleado={empleado}
            fecha={fecha}
            slot={slot}
            notas={notas}
            setNotas={setNotas}
            cliente={cliente.data}
          />
        )}
      </div>

      <div className="sticky bottom-0 -mx-4 mt-10 flex items-center justify-between gap-3 border-t border-line bg-bg/95 py-4 pl-16 pr-4 backdrop-blur md:static md:pl-0 md:mx-0 md:bg-transparent md:px-0">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => ir(paso - 1)} disabled={paso === 0} className={cn(paso === 0 && 'invisible')}>
          Atrás
        </Button>
        {paso < 3 ? (
          <Button onClick={() => ir(paso + 1)} disabled={!puedeAvanzar} icon={ArrowRight} className="flex-row-reverse" size="lg">
            Continuar
          </Button>
        ) : (
          <Button onClick={confirmar} loading={pendiente != null} icon={Check} size="lg">
            Confirmar reserva
          </Button>
        )}
      </div>
    </div>
  )
}

function Progreso({ paso, onIr }) {
  return (
    <nav aria-label="Progreso de la reserva" className="mt-6">
      <p className="text-sm text-ink-muted md:hidden">
        Paso {paso + 1} de {PASOS.length}: <span className="font-medium text-ink">{PASOS[paso]}</span>
      </p>
      <div className="mt-2 flex gap-1.5 md:hidden" aria-hidden="true">
        {PASOS.map((p, i) => <span key={p} className={cn('h-1 flex-1 rounded-full', i <= paso ? 'bg-ink' : 'bg-sand')} />)}
      </div>
      <ol className="hidden items-center gap-3 md:flex">
        {PASOS.map((p, i) => {
          const hecho = i < paso
          const actual = i === paso
          return (
            <li key={p} className="flex flex-1 items-center gap-3">
              <button
                onClick={() => onIr(i)}
                disabled={!hecho}
                aria-current={actual ? 'step' : undefined}
                className={cn('flex items-center gap-2.5 text-sm', hecho ? 'text-ink hover:underline hover:underline-offset-4' : actual ? 'font-medium text-ink' : 'text-ink-subtle')}
              >
                <span
                  className={cn(
                    'tabular flex size-7 items-center justify-center rounded-full border text-xs',
                    hecho ? 'border-ink bg-ink text-bg' : actual ? 'border-ink text-ink' : 'border-line-strong',
                  )}
                >
                  {hecho ? <Check className="size-3.5" /> : i + 1}
                </span>
                {p}
              </button>
              {i < PASOS.length - 1 && <span className={cn('h-px flex-1', hecho ? 'bg-ink' : 'bg-line-strong')} aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function PasoServicio({ servicios, value, onChange }) {
  const [elegida, setCategoria] = useState(null)
  const categoria = elegida ?? servicios.data?.find((s) => s.id === value)?.categoria ?? 'Salón'
  return (
    <section aria-labelledby="titulo-servicio">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="titulo-servicio" className="text-2xl font-medium">¿Qué servicio necesitas?</h2>
        <Segmented
          label="Categoría"
          options={[{ value: 'Salón', label: 'Salón' }, { value: 'Barbería', label: 'Barbería' }]}
          value={categoria}
          onChange={setCategoria}
        />
      </div>
      <AsyncBoundary resource={servicios} skeleton={<div className="mt-6 grid gap-3 sm:grid-cols-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        {(data) => (
          <div role="radiogroup" aria-labelledby="titulo-servicio" className="mt-6 grid gap-3 sm:grid-cols-2">
            {data.filter((s) => s.categoria === categoria).map((s) => {
              const activo = value === s.id
              return (
                <button
                  key={s.id}
                  role="radio"
                  aria-checked={activo}
                  onClick={() => onChange(s.id)}
                  className={cn(
                    'flex flex-col gap-1 rounded-card border p-4 text-left transition-colors',
                    activo ? 'border-ink bg-surface ring-1 ring-ink' : 'border-line bg-surface hover:border-line-strong',
                  )}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-medium text-ink">{s.nombre}</span>
                    <span className="tabular text-ink">{formatCurrency(s.precio)}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm text-ink-muted">
                    <Clock className="size-3.5" aria-hidden="true" /> {formatDuration(s.duracion)}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </AsyncBoundary>
    </section>
  )
}

function PasoProfesional({ empleados, servicio, value, onChange }) {
  const opciones = useMemo(() => (empleados.data ?? []).filter((e) => e.servicioIds.includes(servicio.id)), [empleados.data, servicio.id])
  return (
    <section aria-labelledby="titulo-prof">
      <h2 id="titulo-prof" className="text-2xl font-medium">¿Con quién?</h2>
      <p className="mt-1 text-sm text-ink-muted">Profesionales que realizan {servicio.nombre.toLowerCase()}.</p>
      {empleados.loading ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div role="radiogroup" aria-labelledby="titulo-prof" className="mt-6 grid gap-3 sm:grid-cols-2">
          <Opcion value={value} onChange={onChange} id="cualquiera" titulo="Cualquiera disponible" detalle="Te asignamos a quien tenga el horario libre">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-stone">
              <Shuffle className="size-4 text-ink-muted" aria-hidden="true" />
            </span>
          </Opcion>
          {opciones.map((e) => (
            <Opcion value={value} onChange={onChange} key={e.id} id={e.id} titulo={e.nombre} detalle={e.especialidad}>
              <Avatar nombre={e.nombre} />
            </Opcion>
          ))}
        </div>
      )}
    </section>
  )
}

function Opcion({ id, titulo, detalle, value, onChange, children }) {
  const activo = value === id
  return (
    <button
      role="radio"
      aria-checked={activo}
      onClick={() => onChange(id)}
      className={cn(
        'flex items-center gap-4 rounded-card border p-4 text-left transition-colors',
        activo ? 'border-ink bg-surface ring-1 ring-ink' : 'border-line bg-surface hover:border-line-strong',
      )}
    >
      {children}
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-ink">{titulo}</span>
        <span className="block text-sm text-ink-muted">{detalle}</span>
      </span>
      <span className={cn('flex size-5 items-center justify-center rounded-full border', activo ? 'border-ink bg-ink text-bg' : 'border-line-strong')} aria-hidden="true">
        {activo && <Check className="size-3" />}
      </span>
    </button>
  )
}

function PasoConfirmacion({ servicio, empleado, fecha, slot, notas, setNotas, cliente }) {
  return (
    <section aria-labelledby="titulo-conf" className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
      <div>
        <h2 id="titulo-conf" className="text-2xl font-medium">Revisa tu reserva</h2>
        <Card className="mt-5">
          <dl className="divide-y divide-line">
            {[
              ['Servicio', servicio.nombre],
              ['Profesional', empleado ? empleado.nombre : 'Cualquiera disponible (se asigna al confirmar)'],
              ['Fecha', formatDate(fecha)],
              ['Hora', `${slot.hora} a ${sumarMinutos(slot.hora, servicio.duracion)} (${formatDuration(servicio.duracion)})`],
              ['Precio', formatCurrency(servicio.precio)],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5 px-5 py-3.5 sm:flex-row sm:justify-between sm:gap-6">
                <dt className="text-sm text-ink-muted">{k}</dt>
                <dd className="tabular font-medium sm:text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <p className="mt-3 text-sm text-ink-muted">Pagas en el local al terminar. Puedes cancelar o reprogramar desde Mi cuenta.</p>
      </div>
      <div className="flex flex-col gap-4">
        {cliente?.notas && (
          <div className="flex gap-3 rounded-card border border-warning/25 bg-warning-soft p-4 text-sm">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
            <div>
              <p className="font-medium text-ink">Tus notas registradas</p>
              <p className="mt-0.5 text-ink-muted">{cliente.notas}</p>
            </div>
          </div>
        )}
        <Field label="Comentarios para el profesional" hint="Opcional. Ejemplo: referencia de corte o alergias nuevas.">
          <Textarea rows={4} value={notas} onChange={(e) => setNotas(e.target.value)} maxLength={300} />
        </Field>
      </div>
    </section>
  )
}

function CitaReservada({ cita }) {
  return (
    <div className="container-page flex max-w-xl flex-col items-center py-16 text-center md:py-24">
      <span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
        <CalendarCheck className="size-7" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-4xl font-medium md:text-5xl">Cita reservada</h1>
      <p className="mt-3 text-ink-muted">
        Te esperamos el <span className="font-medium text-ink">{formatDate(cita.fecha)}</span> a las{' '}
        <span className="tabular font-medium text-ink">{cita.horaInicio}</span> con {cita.empleado?.nombre}.
      </p>
      <Card className="mt-8 w-full p-5 text-left">
        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-ink-muted">Servicio</dt><dd className="font-medium">{cita.servicio?.nombre}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-ink-muted">Código</dt><dd className="tabular">{cita.id}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-ink-muted">Precio</dt><dd className="tabular">{formatCurrency(cita.precio)}</dd></div>
        </dl>
      </Card>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button to="/mi-cuenta">Ver mis citas</Button>
        <Button to="/" variant="secondary">Volver al inicio</Button>
      </div>
    </div>
  )
}
