import { useState } from 'react'
import { CalendarClock, Check, Package, Play, Repeat } from 'lucide-react'
import { Badge, Button, Field, Modal, StatusBadge, Textarea } from '../ui'
import { useAccion } from '../../hooks/useResource'
import { actualizarTarea, completarTarea } from '../../services'
import { hoy } from '../../utils/fecha'
import { cn, formatDate } from '../../utils/format'

export function TareaItem({ tarea: t, mostrarResponsable = false }) {
  const [completando, setCompletando] = useState(false)
  const { ejecutar, pendiente } = useAccion()
  const hecha = t.estado === 'Completada'

  return (
    <li className={cn('flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center', hecha && 'opacity-70')}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn('font-medium', hecha && 'line-through decoration-ink-subtle')}>{t.titulo}</p>
          <StatusBadge estado={t.prioridad} />
          {t.vencida && <Badge tone="danger" icon={CalendarClock}>Vencida</Badge>}
          {t.recurrencia !== 'Única' && <Badge tone="neutral" icon={Repeat}>{t.recurrencia}</Badge>}
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          {t.categoria} · {hecha ? `Completada el ${formatDate(t.completadaEn)}` : t.fechaLimite === hoy() ? 'Vence hoy' : `Límite ${formatDate(t.fechaLimite)}`}
          {mostrarResponsable && t.responsable && ` · ${t.responsable.nombre}`}
        </p>
        {t.producto && (
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-muted">
            <Package className="size-3.5" aria-hidden="true" /> {t.producto.nombre} (stock: {t.producto.stock})
          </p>
        )}
        {hecha && t.observacion && <p className="mt-1 text-sm italic text-ink-muted">“{t.observacion}”</p>}
      </div>
      {!hecha && (
        <div className="flex gap-2">
          {t.estado === 'Pendiente' && (
            <Button
              variant="ghost"
              size="sm"
              icon={Play}
              loading={pendiente === 'iniciar'}
              onClick={() => ejecutar(() => actualizarTarea(t.id, { estado: 'En progreso' }), { clave: 'iniciar', exito: 'Tarea en progreso.' })}
            >
              Empezar
            </Button>
          )}
          <Button variant="secondary" size="sm" icon={Check} onClick={() => setCompletando(true)}>
            Completar
          </Button>
        </div>
      )}
      <CompletarModal tarea={completando ? t : null} onClose={() => setCompletando(false)} />
    </li>
  )
}

function CompletarModal({ tarea, onClose }) {
  const [observacion, setObservacion] = useState('')
  const { ejecutar, pendiente } = useAccion()

  const completar = async () => {
    const r = await ejecutar(() => completarTarea(tarea.id, observacion.trim()), {
      exito: ({ siguiente }) =>
        siguiente ? `Tarea completada. Próxima: ${formatDate(siguiente.fechaLimite)}.` : 'Tarea completada.',
    })
    if (r.ok) {
      setObservacion('')
      onClose()
    }
  }

  return (
    <Modal
      open={!!tarea}
      onClose={onClose}
      size="sm"
      title="Completar tarea"
      description={tarea?.titulo}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Volver</Button>
          <Button icon={Check} onClick={completar} loading={pendiente != null}>Marcar completada</Button>
        </>
      }
    >
      <Field label="Observación" hint="Opcional. Ejemplo: faltan toallas grandes, se usó el último frasco.">
        <Textarea data-autofocus rows={3} value={observacion} onChange={(e) => setObservacion(e.target.value)} maxLength={240} />
      </Field>
      {tarea?.recurrencia && tarea.recurrencia !== 'Única' && (
        <p className="mt-3 flex items-center gap-2 text-sm text-ink-muted">
          <Repeat className="size-4" aria-hidden="true" /> Tarea {tarea.recurrencia.toLowerCase()}: se creará la siguiente automáticamente.
        </p>
      )}
    </Modal>
  )
}
