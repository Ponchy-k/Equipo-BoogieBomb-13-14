"""
MODELO (la "M" de MVC)
Cada archivo representa una tabla de la base de datos PostgreSQL "lumina".
managed = False: las tablas las crea database/01_schema.sql, no las migraciones.
"""
from .salon import Salon, SalonHorario
from .usuario import Usuario
from .servicio import Servicio
from .cliente import Cliente
from .empleado import Empleado, EmpleadoHorario, EmpleadoServicio
from .cita import Cita
from .walkin import Walkin
from .producto import Producto
from .pedido import Pedido, PedidoItem
from .tarea import Tarea

__all__ = [
    'Salon',
    'SalonHorario',
    'Usuario',
    'Servicio',
    'Cliente',
    'Empleado',
    'EmpleadoHorario',
    'EmpleadoServicio',
    'Cita',
    'Walkin',
    'Producto',
    'Pedido',
    'PedidoItem',
    'Tarea',
]
