"""CONTROLADOR · Servicios: listar, ver, crear, editar y dar de baja."""
from rest_framework import viewsets
from ..models import EmpleadoServicio, Servicio
from ..serializers import ServicioSerializer
from .base import FiltrosMixin


class ServicioViewSet(FiltrosMixin, viewsets.ModelViewSet):
    queryset = Servicio.objects.order_by('id')
    serializer_class = ServicioSerializer
    filtros = {'categoria': 'categoria', 'activo': 'activo'}

    def perform_destroy(self, servicio):
        # Baja lógica: las citas antiguas lo siguen referenciando
        servicio.activo = False
        servicio.save(update_fields=['activo'])
        EmpleadoServicio.objects.filter(servicio=servicio).delete()
