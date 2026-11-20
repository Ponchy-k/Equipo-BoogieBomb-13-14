"""
RUTAS: qué URL atiende cada controlador.
Todas cuelgan de /api/ (ver config/urls.py).
"""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import controllers

router = DefaultRouter()
router.register('servicios', controllers.ServicioViewSet)    # /api/servicios/
router.register('empleados', controllers.EmpleadoViewSet)    # /api/empleados/
router.register('clientes', controllers.ClienteViewSet)      # /api/clientes/
router.register('citas', controllers.CitaViewSet)            # /api/citas/
router.register('walkins', controllers.WalkinViewSet)        # /api/walkins/
router.register('productos', controllers.ProductoViewSet)    # /api/productos/
router.register('pedidos', controllers.PedidoViewSet)        # /api/pedidos/
router.register('tareas', controllers.TareaViewSet)          # /api/tareas/

urlpatterns = [
    path('', include(router.urls)),
    path('salon/', controllers.salon),
    path('auth/login/', controllers.login),
    path('auth/registro/', controllers.registro),
]
