import { useCallback, useEffect, useRef, useState } from 'react'
import { useData } from '../context/DataContext'
import { useToast } from '../components/ui'

/**
 * Carga datos desde services/ con estados de carga y error.
 * - `loading` solo es true en la primera carga (para mostrar skeletons).
 * - Se vuelve a pedir cuando cambian `deps` o cuando una acción llama a refrescar().
 */
export function useResource(fetcher, deps = []) {
  const { version } = useData()
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [nonce, setNonce] = useState(0)
  const depsKey = JSON.stringify(deps)
  const ultimaClave = useRef(depsKey)

  useEffect(() => {
    let vivo = true
    // Si cambian los filtros, mostramos skeleton; si solo se refresca, mantenemos los datos.
    const cambioFiltros = ultimaClave.current !== depsKey
    ultimaClave.current = depsKey
    setState((s) => ({ data: cambioFiltros ? null : s.data, loading: cambioFiltros || s.data == null, error: null }))
    fetcher()
      .then((data) => vivo && setState({ data, loading: false, error: null }))
      .catch((error) => vivo && setState({ data: null, loading: false, error }))
    return () => {
      vivo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey, version, nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])
  return { ...state, reload }
}

/**
 * Ejecuta una mutación, muestra un toast y refresca los recursos.
 * `pendiente` guarda la clave de la acción en curso para mostrar loading en el botón correcto.
 */
export function useAccion() {
  const { refrescar } = useData()
  const toast = useToast()
  const [pendiente, setPendiente] = useState(null)

  const ejecutar = useCallback(
    async (fn, { exito, clave = true } = {}) => {
      setPendiente(clave)
      try {
        const r = await fn()
        refrescar()
        if (exito) toast.success(typeof exito === 'function' ? exito(r) : exito)
        return { ok: true, data: r }
      } catch (e) {
        toast.error(e.message ?? 'Ocurrió un error inesperado.')
        return { ok: false, error: e }
      } finally {
        setPendiente(null)
      }
    },
    [refrescar, toast],
  )

  return { ejecutar, pendiente }
}
