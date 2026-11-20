"""MODELO · Servicios que ofrece el salón."""
from django.db import models



class Servicio(models.Model):
    CATEGORIAS = [('Salón', 'Salón'), ('Barbería', 'Barbería')]

    nombre = models.CharField(max_length=80)
    categoria = models.CharField(max_length=20, choices=CATEGORIAS)
    duracion_min = models.IntegerField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    descripcion = models.TextField(blank=True, default='')
    destacado = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'servicio'

    def __str__(self):
        return self.nombre
