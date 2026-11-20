"""Convierte el modelo Walkin a JSON (y valida lo que llega)."""
from rest_framework import serializers

from ..models import Empleado, Servicio, Walkin
from .comun import HORA


class WalkinSerializer(serializers.ModelSerializer):
    empleadoId = serializers.PrimaryKeyRelatedField(source='empleado', queryset=Empleado.objects.all())
    servicioId = serializers.PrimaryKeyRelatedField(source='servicio', queryset=Servicio.objects.all())
    clienteNombre = serializers.CharField(source='cliente_nombre', required=False)
    horaInicio = serializers.TimeField(source='hora_inicio', format=HORA)
    horaFin = serializers.TimeField(source='hora_fin', format=HORA)

    class Meta:
        model = Walkin
        fields = ['id', 'empleadoId', 'servicioId', 'clienteNombre', 'fecha', 'horaInicio', 'horaFin', 'precio']
