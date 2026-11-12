# Base de datos de Lumina (PostgreSQL)

| Archivo | Qué hace |
|---|---|
| `01_schema.sql` | Crea las tablas (borra las anteriores si existen) |
| `02_datos.sql` | Carga los datos de prueba de `src/mocks` (fechas relativas a hoy) |

## Instalar y crear la base

1. Instala PostgreSQL desde https://www.postgresql.org/download/windows/ (incluye pgAdmin). Anota la contraseña del usuario `postgres`.
2. Crea la base y ejecuta los scripts. Puedes hacerlo de dos formas:

**Con pgAdmin:** clic derecho en *Databases → Create → Database…*, nombre `lumina`. Luego clic derecho en `lumina` → *Query Tool*, abre `01_schema.sql` y ejecútalo (F5). Repite con `02_datos.sql`.

**Con la terminal** (desde la carpeta del proyecto):

```powershell
psql -U postgres -c "CREATE DATABASE lumina"
psql -U postgres -d lumina -f database/01_schema.sql
psql -U postgres -d lumina -f database/02_datos.sql
```

Si `psql` no se reconoce, agrega `C:\Program Files\PostgreSQL\<versión>\bin` al PATH o usa pgAdmin.

## Tablas

- `salon`, `salon_horario`: datos del local
- `usuario`: login con rol `cliente` / `empleado` / `admin`. Usuarios demo con contraseña `demo123`
- `cliente`, `empleado`, `empleado_horario`
- `servicio`, `empleado_servicio` (qué servicios hace cada empleado)
- `cita`, `walkin`
- `producto`, `pedido`, `pedido_item`
- `tarea`

IDs: `c1` del mock pasa a ser `cliente.id = 1`, `e1` a `empleado.id = 1`, y así con el resto.

## Probar

```sql
SELECT c.fecha, c.hora_inicio, cl.nombre AS cliente, e.nombre AS empleado, s.nombre AS servicio, c.estado
FROM cita c
JOIN cliente  cl ON cl.id = c.cliente_id
JOIN empleado e  ON e.id  = c.empleado_id
JOIN servicio s  ON s.id  = c.servicio_id
WHERE c.fecha = CURRENT_DATE
ORDER BY c.hora_inicio;
```
