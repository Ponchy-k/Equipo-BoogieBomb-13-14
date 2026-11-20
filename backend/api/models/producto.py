"""MODELO · Productos de la tienda."""
from django.db import models



class Producto(models.Model):
    nombre = models.CharField(max_length=120)
    marca = models.CharField(max_length=80, blank=True, null=True)
    categoria = models.CharField(max_length=40)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    stock_minimo = models.IntegerField(default=0)
    destacado = models.BooleanField(default=False)
    tono = models.SmallIntegerField(default=0)
    imagen_url = models.TextField(blank=True, null=True)
    descripcion = models.TextField(blank=True, default='')

    class Meta:
        managed = False
        db_table = 'producto'

    def __str__(self):
        return self.nombre
