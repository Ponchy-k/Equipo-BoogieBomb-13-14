from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('servicios', views.ServicioViewSet)
router.register('empleados', views.EmpleadoViewSet)
router.register('clientes', views.ClienteViewSet)
router.register('citas', views.CitaViewSet)
router.register('walkins', views.WalkinViewSet)
router.register('productos', views.ProductoViewSet)
router.register('pedidos', views.PedidoViewSet)
router.register('tareas', views.TareaViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('salon/', views.salon),
    path('auth/login/', views.login),
    path('auth/registro/', views.registro),
]
