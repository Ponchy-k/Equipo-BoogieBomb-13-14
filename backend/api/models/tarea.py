"""MODELO · Tareas internas del personal."""
from django.db import models

from .empleado import Empleado
from .producto import Producto


class Tarea(models.Model):
    titulo = models.CharField(max_length=150)
    categoria = models.CharField(max_length=40)
    responsable = models.ForeignKey(Empleado, models.PROTECT, related_name='tareas')
    prioridad = models.CharField(max_length=5)
    fecha_limite = models.DateField()
    recurrencia = models.CharField(max_length=10, default='Única')
    estado = models.CharField(max_length=15, default='Pendiente')
    observacion = models.TextField(blank=True, default='')
    producto = models.ForeignKey(Producto, models.SET_NULL, blank=True, null=True)
    completada_en = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tarea'
        ordering = ['fecha_limite']
