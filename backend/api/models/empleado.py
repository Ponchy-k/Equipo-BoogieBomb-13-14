"""MODELO · Empleados, sus turnos y los servicios que realizan."""
from django.db import models

from .servicio import Servicio
from .usuario import Usuario


class Empleado(models.Model):
    ESTADOS = [('Disponible', 'Disponible'), ('Ocupado', 'Ocupado'), ('En descanso', 'En descanso')]

    usuario = models.OneToOneField(Usuario, models.SET_NULL, blank=True, null=True, related_name='empleado')
    nombre = models.CharField(max_length=120)
    especialidad = models.CharField(max_length=40)
    estado = models.CharField(max_length=15, choices=ESTADOS, default='Disponible')
    activo = models.BooleanField(default=True)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    correo = models.CharField(unique=True, max_length=120, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'empleado'

    def __str__(self):
        return self.nombre


class EmpleadoHorario(models.Model):
    empleado = models.ForeignKey(Empleado, models.CASCADE, related_name='horarios')
    dia_semana = models.SmallIntegerField()   # 0 = domingo … 6 = sábado
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()

    class Meta:
        managed = False
        db_table = 'empleado_horario'


class EmpleadoServicio(models.Model):
    pk = models.CompositePrimaryKey('empleado_id', 'servicio_id')
    empleado = models.ForeignKey(Empleado, models.CASCADE, related_name='servicios_asignados')
    servicio = models.ForeignKey(Servicio, models.CASCADE)

    class Meta:
        managed = False
        db_table = 'empleado_servicio'
