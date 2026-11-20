"""CONTROLADOR · Tareas del personal."""
from rest_framework import viewsets
from ..models import Tarea
from ..serializers import TareaSerializer
from .base import FiltrosMixin


class TareaViewSet(FiltrosMixin, viewsets.ModelViewSet):
    queryset = Tarea.objects.all()
    serializer_class = TareaSerializer
    filtros = {'responsableId': 'responsable_id', 'estado': 'estado'}
