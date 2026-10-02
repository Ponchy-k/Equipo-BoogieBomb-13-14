import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { INICIO_ROL, useAuth } from '../context/AuthContext'

/**
 * Protege rutas por rol.
 * - Sin sesión: redirige a /login y recuerda a dónde quería ir.
 * - Rol incorrecto: redirige al inicio de su propio rol.
 */
export function ProtectedRoute({ roles }) {
  const { usuario, rol } = useAuth()
  const location = useLocation()

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname + location.search }} />
  }
  if (roles && !roles.includes(rol)) {
    return <Navigate to={INICIO_ROL[rol]} replace />
  }
  return <Outlet />
}
