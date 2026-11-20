"""Convierte el modelo Servicio a JSON (y valida lo que llega)."""
from rest_framework import serializers

from ..models import Servicio


class ServicioSerializer(serializers.ModelSerializer):
    duracion = serializers.IntegerField(source='duracion_min')

    class Meta:
        model = Servicio
        fields = ['id', 'nombre', 'categoria', 'duracion', 'precio', 'descripcion', 'destacado', 'activo']
