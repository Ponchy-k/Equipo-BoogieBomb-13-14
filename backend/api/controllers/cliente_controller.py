"""CONTROLADOR · Clientes: CRUD."""
from rest_framework import viewsets
from ..models import Cliente
from ..serializers import ClienteSerializer


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.order_by('nombre')
    serializer_class = ClienteSerializer
