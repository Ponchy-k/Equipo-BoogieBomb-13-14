"""MODELO · Reservas de clientes."""
from django.db import models

from .cliente import Cliente
from .empleado import Empleado
from .servicio import Servicio


class Cita(models.Model):
    ESTADOS = [(e, e) for e in ('Pendiente', 'Confirmada', 'En atención', 'Completada', 'Cancelada', 'No asistió')]

    cliente = models.ForeignKey(Cliente, models.PROTECT, related_name='citas')
    empleado = models.ForeignKey(Empleado, models.PROTECT, related_name='citas')
    servicio = models.ForeignKey(Servicio, models.PROTECT, related_name='citas')
    fecha = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=15, choices=ESTADOS, default='Pendiente')
    notas = models.TextField(blank=True, default='')
    creada_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'cita'
        ordering = ['fecha', 'hora_inicio']
