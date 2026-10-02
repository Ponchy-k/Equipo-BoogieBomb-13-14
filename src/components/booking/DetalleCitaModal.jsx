import { Link } from 'react-router-dom'
import { CircleCheck, Play, TriangleAlert, UserX } from 'lucide-react'
import { Button, Modal, StatusBadge } from '../ui'
import { useAccion } from '../../hooks/useResource'
import { cambiarEstadoCita } from '../../services'
import { formatCurrency, formatDate, formatRange } from '../../utils/format'

/** Acciones de una cita desde la agenda: Iniciar atención, Finalizar, Marcar no asistió. */
export function DetalleCitaModal({ cita, onClose, fichaBase = '/empleado/clientes' }) {
  const { ejecutar, pendiente } = useAccion()

  const cambiar = async (estado, mensaje) => {
    const r = await ejecutar(() => cambiarEstadoCita(cita.id, estado), { exito: mensaje, clave: estado })
    if (r.ok) onClose()
  }

  const esperando = cita && ['Pendiente', 'Confirmada'].includes(cita.estado)
  const enAtencion = cita?.estado === 'En atención'

  return (
    <Modal
      open={!!cita}
      onClose={onClose}
      title={cita?.servicio?.nombre ?? 'Cita'}
      description={cita ? `${formatDate(cita.fecha)} · ${formatRange(cita.horaInicio, cita.horaFin)}` : ''}
      footer={
        cita && (esperando || enAtencion) ? (
          <>
            {esperando && (
              <>
                <Button variant="danger" icon={UserX} loading={pendiente === 'No asistió'} onClick={() => cambiar('No asistió', 'Se registró la inasistencia.')}>
                  Marcar no asistió
                </Button>
                <Button icon={Play} loading={pendiente === 'En atención'} onClick={() => cambiar('En atención', 'Atención iniciada.')}>
                  Iniciar atención
                </Button>
              </>
            )}
            {enAtencion && (
              <Button icon={CircleCheck} loading={pendiente === 'Completada'} onClick={() => cambiar('Completada', 'Servicio finalizado.')}>
                Finalizar
              </Button>
            )}
          </>
        ) : null
      }
    >
      {cita && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3">
            <StatusBadge estado={cita.estado} />
            <span className="tabular text-sm text-ink-muted">{cita.id}</span>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-ink-muted">Cliente</dt>
              <dd className="font-medium">
                <Link to={`${fichaBase}/${cita.clienteId}`} className="underline underline-offset-4 hover:text-accent">
                  {cita.cliente?.nombre}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted">Teléfono</dt>
              <dd className="tabular font-medium">{cita.cliente?.telefono}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Profesional</dt>
              <dd className="font-medium">{cita.empleado?.nombre}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Precio</dt>
              <dd className="tabular font-medium">{formatCurrency(cita.precio)}</dd>
            </div>
          </dl>
          {cita.cliente?.notas && (
            <div className="flex gap-3 rounded-control border border-warning/25 bg-warning-soft p-3 text-sm">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
              <p><span className="font-medium">Notas del cliente: </span>{cita.cliente.notas}</p>
            </div>
          )}
          {cita.notas && <p className="text-sm text-ink-muted">Comentario de la reserva: {cita.notas}</p>}
        </div>
      )}
    </Modal>
  )
}
