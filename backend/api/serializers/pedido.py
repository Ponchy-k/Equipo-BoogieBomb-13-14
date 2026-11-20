"""Convierte el modelo Pedido a JSON (y valida lo que llega)."""
from rest_framework import serializers

from django.db import models, transaction

from ..models import Cliente, Pedido, PedidoItem, Producto
from .comun import HORA


class PedidoItemSerializer(serializers.ModelSerializer):
    productoId = serializers.PrimaryKeyRelatedField(source='producto', queryset=Producto.objects.all())
    precio = serializers.DecimalField(source='precio_unitario', max_digits=10, decimal_places=2, read_only=True)
    nombre = serializers.CharField(read_only=True)

    class Meta:
        model = PedidoItem
        fields = ['productoId', 'nombre', 'precio', 'cantidad']


class PedidoSerializer(serializers.ModelSerializer):
    clienteId = serializers.PrimaryKeyRelatedField(source='cliente', queryset=Cliente.objects.all())
    items = PedidoItemSerializer(many=True)
    fechaCreacion = serializers.SerializerMethodField()
    horaCreacion = serializers.SerializerMethodField()
    expiraEl = serializers.DateField(source='expira_el', read_only=True)
    fechaPago = serializers.DateField(source='fecha_pago', required=False, allow_null=True)
    metodoPago = serializers.CharField(source='metodo_pago', required=False, allow_null=True)

    class Meta:
        model = Pedido
        fields = ['id', 'clienteId', 'items', 'estado', 'total', 'fechaCreacion', 'horaCreacion',
                  'expiraEl', 'fechaPago', 'metodoPago']
        read_only_fields = ['total']

    def get_fechaCreacion(self, obj):
        return obj.creado_en.date().isoformat()

    def get_horaCreacion(self, obj):
        return obj.creado_en.strftime(HORA)

    @transaction.atomic
    def create(self, data):
        """Crea el pedido, copia nombre y precio de cada producto y calcula el total."""
        from datetime import date, timedelta
        items = data.pop('items')
        if not items:
            raise serializers.ValidationError({'detail': 'El carrito está vacío.'})
        # Reservar stock (con bloqueo de fila para evitar vender de más)
        for it in items:
            p = Producto.objects.select_for_update().get(pk=it['producto'].pk)
            if p.stock < it['cantidad']:
                raise serializers.ValidationError({'detail': f'No hay stock suficiente de "{p.nombre}".'})
            p.stock -= it['cantidad']
            p.save(update_fields=['stock'])
            it['producto'] = p
        pedido = Pedido.objects.create(expira_el=date.today() + timedelta(days=2), **data)
        total = 0
        for it in items:
            p = it['producto']
            PedidoItem.objects.create(pedido=pedido, producto=p, nombre=p.nombre,
                                      precio_unitario=p.precio, cantidad=it['cantidad'])
            total += p.precio * it['cantidad']
        pedido.total = total
        pedido.save(update_fields=['total'])
        return pedido

    @transaction.atomic
    def update(self, pedido, data):
        data.pop('items', None)   # los ítems no se editan, solo estado / pago
        nuevo = data.get('estado', pedido.estado)
        if nuevo in ('Cancelado', 'Expirado') and pedido.estado in ACTIVOS:
            liberar_stock(pedido)
        if nuevo == 'Entregado y pagado' and pedido.estado != nuevo:
            from datetime import date
            if not data.get('metodo_pago') and not pedido.metodo_pago:
                raise serializers.ValidationError({'detail': 'Indica el método de pago.'})
            data.setdefault('fecha_pago', date.today())
        return super().update(pedido, data)


ACTIVOS = ('Pendiente', 'Listo para recoger')


def liberar_stock(pedido):
    """Devuelve al inventario lo que el pedido tenía reservado."""
    for it in pedido.items.all():
        Producto.objects.filter(pk=it.producto_id).update(stock=models.F('stock') + it.cantidad)
