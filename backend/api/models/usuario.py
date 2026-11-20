"""MODELO · Cuentas para iniciar sesión (cliente, empleado o admin)."""
from django.db import models



class Usuario(models.Model):
    ROLES = [('cliente', 'Cliente'), ('empleado', 'Empleado'), ('admin', 'Administrador')]

    nombre = models.CharField(max_length=120)
    correo = models.CharField(unique=True, max_length=120)
    password_hash = models.TextField()
    rol = models.CharField(max_length=10, choices=ROLES)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'usuario'

    def __str__(self):
        return self.correo
