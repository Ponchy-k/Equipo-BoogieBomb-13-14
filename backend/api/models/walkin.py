"""MODELO · Atenciones sin cita."""
from django.db import models

from .empleado import Empleado
from .servicio import Servicio


class Walkin(models.Model):
    empleado = models.ForeignKey(Empleado, models.PROTECT, related_name='walkins')
    servicio = models.ForeignKey(Servicio, models.PROTECT)
    cliente_nombre = models.CharField(max_length=120, default='Cliente ocasional')
    fecha = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'walkin'
        ordering = ['-fecha', '-hora_inicio']
