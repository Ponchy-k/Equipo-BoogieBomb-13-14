"""CONTROLADOR · Empleados: CRUD con horario y servicios asignados."""
from rest_framework import viewsets
from ..models import Empleado
from ..serializers import EmpleadoSerializer
from .base import FiltrosMixin


class EmpleadoViewSet(FiltrosMixin, viewsets.ModelViewSet):
    queryset = Empleado.objects.order_by('id').prefetch_related('horarios', 'servicios_asignados')
    serializer_class = EmpleadoSerializer
    filtros = {'activo': 'activo'}

    def perform_destroy(self, empleado):
        empleado.activo = False   # baja lógica
        empleado.save(update_fields=['activo'])
