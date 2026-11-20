"""MODELO · Clientes del salón."""
from django.db import models

from .usuario import Usuario


class Cliente(models.Model):
    usuario = models.OneToOneField(Usuario, models.SET_NULL, blank=True, null=True, related_name='cliente')
    nombre = models.CharField(max_length=120)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    correo = models.CharField(unique=True, max_length=120, blank=True, null=True)
    notas = models.TextField(blank=True, default='')
    inasistencias = models.IntegerField(default=0)
    registrado_en = models.DateField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'cliente'

    def __str__(self):
        return self.nombre
