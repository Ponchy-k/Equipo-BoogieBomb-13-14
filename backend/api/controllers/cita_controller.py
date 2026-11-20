"""CONTROLADOR · Citas: CRUD y filtros por fecha, empleado, cliente y estado."""
from rest_framework import viewsets
from ..models import Cita
from ..serializers import CitaSerializer
from .base import FiltrosMixin


class CitaViewSet(FiltrosMixin, viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer
    filtros = {'fecha': 'fecha', 'empleadoId': 'empleado_id', 'clienteId': 'cliente_id',
               'estado': 'estado', 'desde': 'fecha__gte', 'hasta': 'fecha__lte'}
