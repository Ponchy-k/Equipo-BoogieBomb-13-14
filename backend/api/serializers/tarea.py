"""Convierte el modelo Tarea a JSON (y valida lo que llega)."""
from rest_framework import serializers

from ..models import Empleado, Producto, Tarea


class TareaSerializer(serializers.ModelSerializer):
    responsableId = serializers.PrimaryKeyRelatedField(source='responsable', queryset=Empleado.objects.all())
    productoId = serializers.PrimaryKeyRelatedField(source='producto', queryset=Producto.objects.all(),
                                                    required=False, allow_null=True)
    fechaLimite = serializers.DateField(source='fecha_limite')
    completadaEn = serializers.DateField(source='completada_en', required=False, allow_null=True)

    class Meta:
        model = Tarea
        fields = ['id', 'titulo', 'categoria', 'responsableId', 'prioridad', 'fechaLimite',
                  'recurrencia', 'estado', 'observacion', 'productoId', 'completadaEn']
