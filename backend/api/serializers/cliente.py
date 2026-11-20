"""Convierte el modelo Cliente a JSON (y valida lo que llega)."""
from rest_framework import serializers

from ..models import Cliente


class ClienteSerializer(serializers.ModelSerializer):
    registradoEn = serializers.DateField(source='registrado_en', read_only=True)

    class Meta:
        model = Cliente
        fields = ['id', 'nombre', 'telefono', 'correo', 'notas', 'inasistencias', 'registradoEn']
