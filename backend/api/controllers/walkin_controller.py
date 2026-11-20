"""CONTROLADOR · Walk-ins (atenciones sin cita)."""
from rest_framework import viewsets
from ..models import Walkin
from ..serializers import WalkinSerializer
from .base import FiltrosMixin


class WalkinViewSet(FiltrosMixin, viewsets.ModelViewSet):
    queryset = Walkin.objects.all()
    serializer_class = WalkinSerializer
    filtros = {'fecha': 'fecha', 'empleadoId': 'empleado_id', 'desde': 'fecha__gte', 'hasta': 'fecha__lte'}
