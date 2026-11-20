# Backend Lumina: arquitectura MVC (Django + PostgreSQL)

El proyecto sigue el patrón **Modelo, Vista, Controlador**:

| Capa | Qué hace | Dónde está |
|---|---|---|
| **Modelo** | Representa las tablas de PostgreSQL y sus reglas | `backend/api/models/` |
| **Vista** | Lo que ve el usuario (páginas, formularios) | Frontend React: `src/pages/` y `src/components/` |
| **Controlador** | Recibe la petición, usa el modelo y responde en JSON | `backend/api/controllers/` |

Piezas de apoyo:

- `backend/api/serializers/`: convierten el Modelo a JSON para la Vista y validan los datos que llegan.
- `backend/api/routes.py`: define qué URL atiende cada controlador.

## Flujo de una petición

Ejemplo: editar un producto.

```
Vista (React / Postman)
   │  PATCH /api/productos/1/   {"precio": 150}
   ▼
routes.py ──► controllers/producto_controller.py  (ProductoViewSet)
                  │ valida con serializers/producto.py
                  ▼
              models/producto.py  (Producto)  ──►  PostgreSQL: tabla producto
                  │
                  ▼
Respuesta JSON 200 OK  ──►  la Vista muestra el precio nuevo
```

## Estructura

```
backend/
├── config/                 configuración de Django (settings, urls)
├── api/
│   ├── models/             MODELO
│   │   ├── cliente.py  empleado.py  servicio.py  cita.py  walkin.py
│   │   ├── producto.py  pedido.py  tarea.py  usuario.py  salon.py
│   ├── controllers/        CONTROLADOR
│   │   ├── producto_controller.py  servicio_controller.py  cita_controller.py ...
│   │   └── auth_controller.py      (login y registro)
│   ├── serializers/        Modelo ⇄ JSON
│   └── routes.py           URLs de la API
└── manage.py
```

## Endpoints

| Recurso | URL | Métodos |
|---|---|---|
| Servicios | `/api/servicios/` | GET, POST, PUT, PATCH, DELETE |
| Productos | `/api/productos/` | GET, POST, PUT, PATCH, DELETE |
| Empleados | `/api/empleados/` | GET, POST, PUT, PATCH, DELETE |
| Clientes | `/api/clientes/` | GET, POST, PUT, PATCH, DELETE |
| Citas | `/api/citas/` | GET, POST, PUT, PATCH, DELETE |
| Walk-ins | `/api/walkins/` | GET, POST, PUT, PATCH, DELETE |
| Pedidos | `/api/pedidos/` | GET, POST, PATCH |
| Tareas | `/api/tareas/` | GET, POST, PUT, PATCH, DELETE |
| Salón | `/api/salon/` | GET |
| Login | `/api/auth/login/` | POST |
| Registro | `/api/auth/registro/` | POST |

Las pruebas de todos los endpoints están en `postman/Lumina.postman_collection.json`.

## Cómo correrlo

```powershell
cd backend
.\venv\Scripts\activate
python manage.py runserver
```

Se necesita el archivo `backend/.env` con los datos de conexión a PostgreSQL. Ese archivo no se sube a GitHub.
