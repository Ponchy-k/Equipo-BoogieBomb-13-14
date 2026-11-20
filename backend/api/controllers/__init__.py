"""
CONTROLADOR (la "C" de MVC)
Reciben la petición HTTP de la Vista, usan el Modelo y devuelven la respuesta en JSON.
(En Django estas clases se llaman "views", pero cumplen el rol de controlador.)
"""
from .servicio_controller import ServicioViewSet
from .empleado_controller import EmpleadoViewSet
from .cliente_controller import ClienteViewSet
from .cita_controller import CitaViewSet
from .walkin_controller import WalkinViewSet
from .producto_controller import ProductoViewSet
from .pedido_controller import PedidoViewSet
from .tarea_controller import TareaViewSet
from .salon_controller import salon
from .auth_controller import login, registro


__all__ = [
    'ServicioViewSet',
    'EmpleadoViewSet',
    'ClienteViewSet',
    'CitaViewSet',
    'WalkinViewSet',
    'ProductoViewSet',
    'PedidoViewSet',
    'TareaViewSet',
    'salon',
    'login',
    'registro',
]
