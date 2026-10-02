import { Coffee, CircleCheck, Hourglass } from 'lucide-react'
import { Segmented, Skeleton } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useAccion, useResource } from '../../hooks/useResource'
import { actualizarEstadoEmpleado, getEmpleado } from '../../services'

const opciones = [
  { value: 'Disponible', label: 'Disponible', icon: CircleCheck },
  { value: 'Ocupado', label: 'Ocupado', icon: Hourglass },
  { value: 'En descanso', label: 'En descanso', icon: Coffee },
]

/** Toggle "Mi estado" del empleado. Se refleja en la sección "Disponibles ahora" de la landing. */
export function EstadoEmpleado({ compacto = false }) {
  const { usuario } = useAuth()
  const empleado = useResource(() => getEmpleado(usuario.empleadoId), [usuario?.empleadoId])
  const { ejecutar } = useAccion()

  if (empleado.loading || !empleado.data) return <Skeleton className={compacto ? 'h-10 w-80' : 'h-11 w-full'} />

  return (
    <Segmented
      label="Mi estado"
      size={compacto ? 'sm' : 'md'}
      options={opciones}
      value={empleado.data.estado}
      className={compacto ? '' : 'w-full'}
      onChange={(estado) =>
        ejecutar(() => actualizarEstadoEmpleado(usuario.empleadoId, estado), { exito: `Tu estado ahora es "${estado}".` })
      }
    />
  )
}
