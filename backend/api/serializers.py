# Convierten los modelos a JSON con los MISMOS nombres de campo que usa el
# frontend en src/mocks (camelCase: clienteId, horaInicio, stockMinimo...),
# así React casi no tiene que cambiar.
from django.db import models, transaction
from rest_framework import serializers

from .models import (Cita, Cliente, Empleado, EmpleadoHorario, EmpleadoServicio, Pedido,
                     PedidoItem, Producto, Salon, SalonHorario, Servicio, Tarea, Walkin)

HORA = '%H:%M'


class SalonSerializer(serializers.ModelSerializer):
    horarios = serializers.SerializerMethodField()

    class Meta:
        model = Salon
        fields = ['nombre', 'eslogan', 'direccion', 'ciudad', 'telefono', 'whatsapp', 'correo', 'horarios']

    def get_horarios(self, obj):
        return [{'dias': h.dias, 'horas': h.horas} for h in SalonHorario.objects.order_by('id')]


class ServicioSerializer(serializers.ModelSerializer):
    duracion = serializers.IntegerField(source='duracion_min')

    class Meta:
        model = Servicio
        fields = ['id', 'nombre', 'categoria', 'duracion', 'precio', 'descripcion', 'destacado', 'activo']


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


class ClienteSerializer(serializers.ModelSerializer):
    registradoEn = serializers.DateField(source='registrado_en', read_only=True)

    class Meta:
        model = Cliente
        fields = ['id', 'nombre', 'telefono', 'correo', 'notas', 'inasistencias', 'registradoEn']


class CitaSerializer(serializers.ModelSerializer):
    clienteId = serializers.PrimaryKeyRelatedField(source='cliente', queryset=Cliente.objects.all())
    empleadoId = serializers.PrimaryKeyRelatedField(source='empleado', queryset=Empleado.objects.all())
    servicioId = serializers.PrimaryKeyRelatedField(source='servicio', queryset=Servicio.objects.all())
    horaInicio = serializers.TimeField(source='hora_inicio', format=HORA)
    horaFin = serializers.TimeField(source='hora_fin', format=HORA)
    creadaEn = serializers.DateTimeField(source='creada_en', read_only=True)

    class Meta:
        model = Cita
        fields = ['id', 'clienteId', 'empleadoId', 'servicioId', 'fecha', 'horaInicio', 'horaFin',
                  'precio', 'estado', 'notas', 'creadaEn']

    @transaction.atomic
    def update(self, cita, data):
        # Marcar "No asistió" suma una inasistencia al cliente (una sola vez).
        if data.get('estado') == 'No asistió' and cita.estado != 'No asistió':
            cliente = data.get('cliente', cita.cliente)
            cliente.inasistencias += 1
            cliente.save(update_fields=['inasistencias'])
        return super().update(cita, data)


class WalkinSerializer(serializers.ModelSerializer):
    empleadoId = serializers.PrimaryKeyRelatedField(source='empleado', queryset=Empleado.objects.all())
    servicioId = serializers.PrimaryKeyRelatedField(source='servicio', queryset=Servicio.objects.all())
    clienteNombre = serializers.CharField(source='cliente_nombre', required=False)
    horaInicio = serializers.TimeField(source='hora_inicio', format=HORA)
    horaFin = serializers.TimeField(source='hora_fin', format=HORA)

    class Meta:
        model = Walkin
        fields = ['id', 'empleadoId', 'servicioId', 'clienteNombre', 'fecha', 'horaInicio', 'horaFin', 'precio']


class ProductoSerializer(serializers.ModelSerializer):
    stockMinimo = serializers.IntegerField(source='stock_minimo', required=False)
    imagenUrl = serializers.CharField(source='imagen_url', required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'marca', 'categoria', 'precio', 'stock', 'stockMinimo',
                  'destacado', 'tono', 'imagenUrl', 'descripcion']


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
