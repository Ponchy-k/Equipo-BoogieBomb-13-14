"""CONTROLADOR · Pedidos: crear (reserva stock), cambiar estado, cobrar, vencer a las 48 h."""
from rest_framework import viewsets
from datetime import date

from django.db import transaction

from ..models import Pedido
from ..serializers import ACTIVOS, PedidoSerializer, liberar_stock
from .base import FiltrosMixin


class PedidoViewSet(FiltrosMixin, viewsets.ModelViewSet):
    queryset = Pedido.objects.prefetch_related('items')
    serializer_class = PedidoSerializer
    filtros = {'clienteId': 'cliente_id', 'estado': 'estado'}

    def get_queryset(self):
        vencer_pedidos()
        return super().get_queryset()


@transaction.atomic
def vencer_pedidos():
    """Los pedidos no retirados en 48 h pasan a 'Expirado' y devuelven su stock."""
    for pedido in Pedido.objects.filter(estado__in=ACTIVOS, expira_el__lt=date.today()):
        liberar_stock(pedido)
        pedido.estado = 'Expirado'
        pedido.save(update_fields=['estado'])
