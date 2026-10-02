import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as api from '../services'

const STORAGE_KEY = 'lumina:sesion'
const AuthContext = createContext(null)

/** Inicio de cada rol después de iniciar sesión. */
export const INICIO_ROL = { cliente: '/mi-cuenta', empleado: '/empleado', admin: '/admin' }
export const NOMBRE_ROL = { cliente: 'Cliente', empleado: 'Empleado', admin: 'Administrador' }

function leerSesion() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null
  } catch {
    return null
  }
}

function guardarSesion(usuario) {
  try {
    if (usuario) localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* modo privado: la sesión vive solo en memoria */
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerSesion)

  const aplicar = useCallback((u) => {
    guardarSesion(u)
    setUsuario(u)
    return u
  }, [])

  const login = useCallback(async (correo, password) => aplicar(await api.login(correo, password)), [aplicar])
  const loginDemo = useCallback(async (rol) => aplicar(await api.loginDemo(rol)), [aplicar])
  const registro = useCallback(async (datos) => aplicar(await api.registro(datos)), [aplicar])
  const logout = useCallback(() => aplicar(null), [aplicar])
  const actualizarUsuario = useCallback(
    (cambios) =>
      setUsuario((u) => {
        const nuevo = { ...u, ...cambios }
        guardarSesion(nuevo)
        return nuevo
      }),
    [],
  )

  const value = useMemo(
    () => ({ usuario, rol: usuario?.rol ?? null, login, loginDemo, registro, logout, actualizarUsuario }),
    [usuario, login, loginDemo, registro, logout, actualizarUsuario],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
