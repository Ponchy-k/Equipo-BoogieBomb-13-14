"""Convierte el modelo Producto a JSON (y valida lo que llega)."""
from rest_framework import serializers

from ..models import Producto


class ProductoSerializer(serializers.ModelSerializer):
    stockMinimo = serializers.IntegerField(source='stock_minimo', required=False)
    imagenUrl = serializers.CharField(source='imagen_url', required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'marca', 'categoria', 'precio', 'stock', 'stockMinimo',
                  'destacado', 'tono', 'imagenUrl', 'descripcion']
