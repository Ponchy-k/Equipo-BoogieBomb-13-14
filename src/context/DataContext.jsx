import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { restablecerDatos } from '../services'

/**
 * Coordina la actualización de la UI: cada mutación incrementa `version`
 * y todos los recursos montados (useResource) vuelven a pedir sus datos.
 * Con la API real, este mismo patrón sirve para invalidar caché.
 */
const DataContext = createContext({ version: 0, refrescar: () => {}, restablecer: () => {} })

export function DataProvider({ children }) {
  const [version, setVersion] = useState(0)
  const refrescar = useCallback(() => setVersion((v) => v + 1), [])
  const restablecer = useCallback(() => {
    restablecerDatos()
    setVersion((v) => v + 1)
  }, [])
  const value = useMemo(() => ({ version, refrescar, restablecer }), [version, refrescar, restablecer])
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => useContext(DataContext)
