"""CONTROLADOR · Productos: CRUD (no se borra un producto con pedidos)."""
from rest_framework import viewsets
from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.response import Response

from ..models import Producto
from ..serializers import ProductoSerializer
from .base import FiltrosMixin


class ProductoViewSet(FiltrosMixin, viewsets.ModelViewSet):
    queryset = Producto.objects.order_by('id')
    serializer_class = ProductoSerializer
    filtros = {'categoria': 'categoria', 'destacado': 'destacado'}

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response({'detail': 'No se puede eliminar: el producto aparece en pedidos. '
                                       'Pon su stock en 0 para dejar de venderlo.'},
                            status=status.HTTP_409_CONFLICT)
