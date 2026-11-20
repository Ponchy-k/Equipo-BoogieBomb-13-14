"""Convierte el modelo Cita a JSON (y valida lo que llega)."""
from rest_framework import serializers

from django.db import transaction

from ..models import Cita, Cliente, Empleado, Servicio
from .comun import HORA


class CitaSerializer(serializers.ModelSerializer):
    clienteId = serializers.PrimaryKeyRelatedField(source='cliente', queryset=Cliente.objects.all())
    empleadoId = serializers.PrimaryKeyRelatedField(source='empleado', queryset=Empleado.objects.all())
    servicioId = serializers.PrimaryKeyRelatedField(source='servicio', queryset=Servicio.objects.all())
    horaInicio = serializers.TimeField(source='hora_inicio', format=HORA)
    horaFin = serializers.TimeField(source='hora_fin', format=HORA)
    creadaEn = serializers.DateTimeField(source='creada_en', read_only=True)

    class Meta:
        model = Cita
        fields = ['id', 'clienteId', 'empleadoId', 'servicioId', 'fecha', 'horaInicio', 'horaFin',
                  'precio', 'estado', 'notas', 'creadaEn']

    @transaction.atomic
    def update(self, cita, data):
        # Marcar "No asistió" suma una inasistencia al cliente (una sola vez).
        if data.get('estado') == 'No asistió' and cita.estado != 'No asistió':
            cliente = data.get('cliente', cita.cliente)
            cliente.inasistencias += 1
            cliente.save(update_fields=['inasistencias'])
        return super().update(cita, data)
