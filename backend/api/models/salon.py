"""MODELO · Datos del local y su horario de atención."""
from django.db import models



class Salon(models.Model):
    id = models.SmallIntegerField(primary_key=True)
    nombre = models.CharField(max_length=80)
    eslogan = models.CharField(max_length=120, blank=True, null=True)
    direccion = models.CharField(max_length=200, blank=True, null=True)
    ciudad = models.CharField(max_length=80, blank=True, null=True)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    whatsapp = models.CharField(max_length=30, blank=True, null=True)
    correo = models.CharField(max_length=120, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'salon'


class SalonHorario(models.Model):
    dias = models.CharField(max_length=40)
    horas = models.CharField(max_length=40)

    class Meta:
        managed = False
        db_table = 'salon_horario'
