"""MODELO · Pedidos de la tienda y su detalle."""
from django.db import models

from .cliente import Cliente
from .producto import Producto


class Pedido(models.Model):
    ESTADOS = [(e, e) for e in ('Pendiente', 'Listo para recoger', 'Entregado y pagado', 'Cancelado', 'Expirado')]

    cliente = models.ForeignKey(Cliente, models.PROTECT, related_name='pedidos')
    estado = models.CharField(max_length=20, choices=ESTADOS, default='Pendiente')
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    creado_en = models.DateTimeField(auto_now_add=True)
    expira_el = models.DateField()
    fecha_pago = models.DateField(blank=True, null=True)
    metodo_pago = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'pedido'
        ordering = ['-creado_en']


class PedidoItem(models.Model):
    pedido = models.ForeignKey(Pedido, models.CASCADE, related_name='items')
    producto = models.ForeignKey(Producto, models.PROTECT)
    nombre = models.CharField(max_length=120)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'pedido_item'
