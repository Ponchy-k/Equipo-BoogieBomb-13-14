import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from '../components/layout/PublicLayout'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { SkeletonList } from '../components/ui'

// Público
const Landing = lazy(() => import('../pages/public/Landing'))
const Servicios = lazy(() => import('../pages/public/Servicios'))
const Tienda = lazy(() => import('../pages/public/Tienda'))
const ProductoDetalle = lazy(() => import('../pages/public/ProductoDetalle'))
const Carrito = lazy(() => import('../pages/public/Carrito'))
const Contacto = lazy(() => import('../pages/public/Contacto'))
const Login = lazy(() => import('../pages/public/Login'))
const Registro = lazy(() => import('../pages/public/Registro'))
const NoEncontrado = lazy(() => import('../pages/public/NoEncontrado'))

// Cliente
const Reservar = lazy(() => import('../pages/cliente/Reservar'))
const ConfirmarPedido = lazy(() => import('../pages/cliente/ConfirmarPedido'))
const MiCuenta = lazy(() => import('../pages/cliente/MiCuenta'))

// Empleado
const Agenda = lazy(() => import('../pages/empleado/Agenda'))
const SinCita = lazy(() => import('../pages/empleado/SinCita'))
const MisTareas = lazy(() => import('../pages/empleado/MisTareas'))
const ClientesLista = lazy(() => import('../pages/shared/ClientesLista'))
const FichaCliente = lazy(() => import('../pages/shared/FichaCliente'))

// Admin
const Dashboard = lazy(() => import('../pages/admin/Dashboard'))
const AdminCitas = lazy(() => import('../pages/admin/Citas'))
const AdminEmpleados = lazy(() => import('../pages/admin/Empleados'))
const AdminServicios = lazy(() => import('../pages/admin/ServiciosAdmin'))
const AdminProductos = lazy(() => import('../pages/admin/Productos'))
const AdminPedidos = lazy(() => import('../pages/admin/Pedidos'))
const AdminTareas = lazy(() => import('../pages/admin/Tareas'))
const Caja = lazy(() => import('../pages/admin/Caja'))

const Cargando = () => (
  <div className="container-page py-10">
    <SkeletonList rows={3} />
  </div>
)

export function AppRouter() {
  return (
    <Suspense fallback={<Cargando />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="tienda" element={<Tienda />} />
          <Route path="tienda/:id" element={<ProductoDetalle />} />
          <Route path="carrito" element={<Carrito />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Registro />} />

          <Route element={<ProtectedRoute roles={['cliente']} />}>
            <Route path="reservar" element={<Reservar />} />
            <Route path="carrito/confirmar" element={<ConfirmarPedido />} />
            <Route path="mi-cuenta" element={<MiCuenta />} />
          </Route>
          <Route path="*" element={<NoEncontrado />} />
        </Route>

        <Route element={<ProtectedRoute roles={['empleado']} />}>
          <Route path="empleado" element={<DashboardLayout />}>
            <Route index element={<Agenda />} />
            <Route path="sin-cita" element={<SinCita />} />
            <Route path="tareas" element={<MisTareas />} />
            <Route path="clientes" element={<ClientesLista base="/empleado/clientes" />} />
            <Route path="clientes/:id" element={<FichaCliente base="/empleado/clientes" />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="admin" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="citas" element={<AdminCitas />} />
            <Route path="empleados" element={<AdminEmpleados />} />
            <Route path="servicios" element={<AdminServicios />} />
            <Route path="productos" element={<AdminProductos />} />
            <Route path="pedidos" element={<AdminPedidos />} />
            <Route path="tareas" element={<AdminTareas />} />
            <Route path="clientes" element={<ClientesLista base="/admin/clientes" />} />
            <Route path="clientes/:id" element={<FichaCliente base="/admin/clientes" />} />
            <Route path="caja" element={<Caja />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
