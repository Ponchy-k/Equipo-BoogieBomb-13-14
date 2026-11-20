"""CONTROLADOR · Autenticación: login y registro de clientes."""
from django.db import connection, transaction
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ..models import Cliente, Usuario


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
