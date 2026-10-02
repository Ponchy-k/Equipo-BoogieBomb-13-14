import { useCallback, useEffect, useState } from 'react'
import { Button, Modal } from '../ui'
import { SelectorFecha, SelectorHora } from './SelectorHorario'
import { useAccion } from '../../hooks/useResource'
import { actualizarCita } from '../../services'
import { diaSemana, hoy, sumarDias } from '../../utils/fecha'
import { formatDate } from '../../utils/format'

/** Cambia fecha y hora de una cita manteniendo servicio y profesional. */
export function ReprogramarModal({ cita, onClose }) {
  const inicial = () => {
    const h = hoy()
    if (cita && cita.fecha >= h) return cita.fecha
    return diaSemana(h) === 0 ? sumarDias(h, 1) : h
  }
  const [fecha, setFecha] = useState(inicial)
  const [slot, setSlot] = useState(null)
  const { ejecutar, pendiente } = useAccion()
  const onSlot = useCallback((s) => setSlot(s), [])

  useEffect(() => {
    if (cita) {
      setFecha(inicial())
      setSlot(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cita?.id])

  const guardar = async () => {
    const r = await ejecutar(() => actualizarCita(cita.id, { fecha, horaInicio: slot.hora }), {
      exito: `Cita movida al ${formatDate(fecha)} a las ${slot.hora}.`,
    })
    if (r.ok) onClose()
  }

  return (
    <Modal
      open={!!cita}
      onClose={onClose}
      size="lg"
      title="Reprogramar cita"
      description={cita ? `${cita.servicio?.nombre} con ${cita.empleado?.nombre}` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={guardar} disabled={!slot} loading={pendiente != null}>
            {slot ? `Mover a las ${slot.hora}` : 'Elige un horario'}
          </Button>
        </>
      }
    >
      {cita && (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-ink-muted">
            Actual: <span className="font-medium text-ink">{formatDate(cita.fecha)}, {cita.horaInicio}</span>
          </p>
          <SelectorFecha value={fecha} onChange={(f) => { setFecha(f); setSlot(null) }} />
          <SelectorHora
            empleadoId={cita.empleadoId}
            servicioId={cita.servicioId}
            fecha={fecha}
            value={slot}
            onChange={onSlot}
            excluirCitaId={cita.id}
          />
        </div>
      )}
    </Modal>
  )
}
