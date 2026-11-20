"""Convierte el modelo Empleado a JSON (y valida lo que llega)."""
from rest_framework import serializers

from django.db import transaction

from ..models import Empleado, EmpleadoHorario, EmpleadoServicio
from .comun import HORA


class EmpleadoSerializer(serializers.ModelSerializer):
    # servicioIds: [9, 10, 11]  |  horario: {"1": [{"inicio": "09:00", "fin": "13:00"}, ...]}
    servicioIds = serializers.ListField(child=serializers.IntegerField(), required=False, write_only=True)
    horario = serializers.DictField(required=False, write_only=True)

    class Meta:
        model = Empleado
        fields = ['id', 'nombre', 'especialidad', 'estado', 'activo', 'telefono', 'correo',
                  'servicioIds', 'horario']

    def _horario_json(self, obj):
        horario = {}
        for h in obj.horarios.order_by('dia_semana', 'hora_inicio'):
            horario.setdefault(str(h.dia_semana), []).append(
                {'inicio': h.hora_inicio.strftime(HORA), 'fin': h.hora_fin.strftime(HORA)})
        return horario

    def to_representation(self, obj):
        data = super().to_representation(obj)
        data['servicioIds'] = list(obj.servicios_asignados.values_list('servicio_id', flat=True))
        data['horario'] = self._horario_json(obj)
        return data

    def _guardar_horario(self, empleado, horario):
        """horario = {"1": [{"inicio": "09:00", "fin": "13:00"}], ...}"""
        if horario is None:
            return
        EmpleadoHorario.objects.filter(empleado=empleado).delete()
        EmpleadoHorario.objects.bulk_create([
            EmpleadoHorario(empleado=empleado, dia_semana=int(dia), hora_inicio=t['inicio'], hora_fin=t['fin'])
            for dia, turnos in horario.items() for t in (turnos or [])
        ])

    def _guardar_servicios(self, empleado, ids):
        if ids is None:
            return
        EmpleadoServicio.objects.filter(empleado=empleado).delete()
        EmpleadoServicio.objects.bulk_create(
            [EmpleadoServicio(empleado=empleado, servicio_id=i) for i in ids])

    @transaction.atomic
    def create(self, data):
        ids = data.pop('servicioIds', None)
        horario = data.pop('horario', None)
        empleado = super().create(data)
        self._guardar_servicios(empleado, ids)
        self._guardar_horario(empleado, horario)
        return empleado

    @transaction.atomic
    def update(self, empleado, data):
        ids = data.pop('servicioIds', None)
        horario = data.pop('horario', None)
        empleado = super().update(empleado, data)
        self._guardar_servicios(empleado, ids)
        self._guardar_horario(empleado, horario)
        return empleado
