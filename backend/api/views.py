from datetime import date

from django.db import connection, transaction
from django.db.models import ProtectedError
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import EmpleadoServicio, Cita, Cliente, Empleado, Pedido, Producto, Salon, Servicio, Tarea, Usuario, Walkin
from .serializers import (ACTIVOS, liberar_stock, CitaSerializer, ClienteSerializer, EmpleadoSerializer, PedidoSerializer,
                          ProductoSerializer, SalonSerializer, ServicioSerializer, TareaSerializer,
                          WalkinSerializer)


class FiltrosMixin:
    """Permite filtrar con ?campo=valor, por ejemplo /api/citas/?fecha=2026-11-12&empleadoId=1"""
    filtros = {}   # nombre en la URL -> campo del modelo

    def get_queryset(self):
        qs = super().get_queryset()
        for param, campo in self.filtros.items():
            valor = self.request.query_params.get(param)
            if valor not in (None, ''):
                qs = qs.filter(**{campo: valor})
        return qs


class ServicioViewSet(FiltrosMixin, viewsets.ModelViewSet):
    queryset = Servicio.objects.order_by('id')
    serializer_class = ServicioSerializer
    filtros = {'categoria': 'categoria', 'activo': 'activo'}

    def perform_destroy(self, servicio):
        # Baja lógica: las citas antiguas lo siguen referenciando
        servicio.activo = False
        servicio.save(update_fields=['activo'])
        EmpleadoServicio.objects.filter(servicio=servicio).delete()


class EmpleadoViewSet(FiltrosMixin, viewsets.ModelViewSet):
    queryset = Empleado.objects.order_by('id').prefetch_related('horarios', 'servicios_asignados')
    serializer_class = EmpleadoSerializer
    filtros = {'activo': 'activo'}

    def perform_destroy(self, empleado):
        empleado.activo = False   # baja lógica
        empleado.save(update_fields=['activo'])


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.order_by('nombre')
    serializer_class = ClienteSerializer


class CitaViewSet(FiltrosMixin, viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer
    filtros = {'fecha': 'fecha', 'empleadoId': 'empleado_id', 'clienteId': 'cliente_id',
               'estado': 'estado', 'desde': 'fecha__gte', 'hasta': 'fecha__lte'}


class WalkinViewSet(FiltrosMixin, viewsets.ModelViewSet):
    queryset = Walkin.objects.all()
    serializer_class = WalkinSerializer
    filtros = {'fecha': 'fecha', 'empleadoId': 'empleado_id', 'desde': 'fecha__gte', 'hasta': 'fecha__lte'}


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


class TareaViewSet(FiltrosMixin, viewsets.ModelViewSet):
    queryset = Tarea.objects.all()
    serializer_class = TareaSerializer
    filtros = {'responsableId': 'responsable_id', 'estado': 'estado'}


@api_view(['GET'])
def salon(request):
    return Response(SalonSerializer(Salon.objects.get(pk=1)).data)


# ---------------------------------------------------------------------------
# Autenticación (sencilla, para la demo). Las contraseñas se guardan con
# pgcrypto (crypt + bcrypt) desde la base de datos.
# ---------------------------------------------------------------------------
def _usuario_json(u):
    data = {'id': u.id, 'nombre': u.nombre, 'correo': u.correo, 'rol': u.rol}
    if u.rol == 'cliente' and hasattr(u, 'cliente'):
        data['clienteId'] = u.cliente.id
    if u.rol == 'empleado' and hasattr(u, 'empleado'):
        data['empleadoId'] = u.empleado.id
    return data


@api_view(['POST'])
def login(request):
    correo = (request.data.get('correo') or '').strip().lower()
    password = request.data.get('password') or ''
    if not correo or not password:
        return Response({'detail': 'Ingresa tu correo y contraseña.'}, status=status.HTTP_400_BAD_REQUEST)

    with connection.cursor() as cur:
        cur.execute(
            "SELECT id FROM usuario WHERE lower(correo) = %s AND activo "
            "AND password_hash = crypt(%s, password_hash)",
            [correo, password])
        fila = cur.fetchone()
    if not fila:
        return Response({'detail': 'Correo o contraseña incorrectos.'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(_usuario_json(Usuario.objects.get(pk=fila[0])))


@api_view(['POST'])
def registro(request):
    nombre = (request.data.get('nombre') or '').strip()
    correo = (request.data.get('correo') or '').strip().lower()
    telefono = (request.data.get('telefono') or '').strip()
    password = request.data.get('password') or ''
    if not nombre or not correo or len(password) < 6:
        return Response({'detail': 'Nombre, correo y una contraseña de 6+ caracteres son obligatorios.'},
                        status=status.HTTP_400_BAD_REQUEST)
    if Usuario.objects.filter(correo__iexact=correo).exists():
        return Response({'detail': 'Ya existe una cuenta con ese correo.'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        with connection.cursor() as cur:
            cur.execute(
                "INSERT INTO usuario (nombre, correo, password_hash, rol) "
                "VALUES (%s, %s, crypt(%s, gen_salt('bf')), 'cliente') RETURNING id",
                [nombre, correo, password])
            usuario_id = cur.fetchone()[0]
        cliente = Cliente.objects.filter(correo__iexact=correo).first()
        if cliente:   # ya era cliente del salón sin cuenta: se vincula
            cliente.usuario_id = usuario_id
            cliente.save(update_fields=['usuario'])
        else:
            Cliente.objects.create(usuario_id=usuario_id, nombre=nombre, correo=correo, telefono=telefono)
    return Response(_usuario_json(Usuario.objects.get(pk=usuario_id)), status=status.HTTP_201_CREATED)
