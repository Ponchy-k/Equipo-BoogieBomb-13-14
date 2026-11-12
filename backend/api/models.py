# Modelos de la base "lumina" (generados con inspectdb y ordenados a mano).
# managed = False: las tablas las crea database/01_schema.sql, no las migraciones de Django.
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


class EmpleadoServicio(models.Model):
    pk = models.CompositePrimaryKey('empleado_id', 'servicio_id')
    empleado = models.ForeignKey(Empleado, models.CASCADE, related_name='servicios_asignados')
    servicio = models.ForeignKey(Servicio, models.CASCADE)

    class Meta:
        managed = False
        db_table = 'empleado_servicio'


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


class Pedido(models.Model):
    ESTADOS = [(e, e) for e in ('Pendiente', 'Listo para recoger', 'Entregado y pagado', 'Cancelado', 'Expirado')]

    cliente = models.ForeignKey(Cliente, models.PROTECT, related_name='pedidos')
    estado = models.CharField(max_length=20, choices=ESTADOS, default='Pendiente')
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    creado_en = models.DateTimeField(auto_now_add=True)
    expira_el = models.DateField()
    fecha_pago = models.DateField(blank=True, null=True)
    metodo_pago = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'pedido'
        ordering = ['-creado_en']


class PedidoItem(models.Model):
    pedido = models.ForeignKey(Pedido, models.CASCADE, related_name='items')
    producto = models.ForeignKey(Producto, models.PROTECT)
    nombre = models.CharField(max_length=120)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'pedido_item'


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
