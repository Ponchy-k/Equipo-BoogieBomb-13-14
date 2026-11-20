"""
SERIALIZERS: traducen entre el MODELO (Python) y el JSON que recibe la VISTA (React).
Usan los mismos nombres de campo que el frontend (clienteId, horaInicio, ...).
"""
from .salon import SalonSerializer
from .servicio import ServicioSerializer
from .empleado import EmpleadoSerializer
from .cliente import ClienteSerializer
from .cita import CitaSerializer
from .walkin import WalkinSerializer
from .producto import ProductoSerializer
from .pedido import PedidoItemSerializer, PedidoSerializer, ACTIVOS, liberar_stock
from .tarea import TareaSerializer


__all__ = [
    'SalonSerializer',
    'ServicioSerializer',
    'EmpleadoSerializer',
    'ClienteSerializer',
    'CitaSerializer',
    'WalkinSerializer',
    'ProductoSerializer',
    'PedidoItemSerializer',
    'PedidoSerializer',
    'ACTIVOS',
    'liberar_stock',
    'TareaSerializer',
]
