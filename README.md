# Equipo-BoogieBomb-13-14
Repositorio para el proyecto de programación avanzada 2026-II

El proyecto es una pagina web para un salon de belleza para agendar citas y la venta de productos cosmeticos y self care
Integrantes
Matias Martinez
Matias Choque
Dieter Kollros

---

## Frontend: Lumina · Salón y barbería

Frontend navegable de Lumina, un salón de belleza y barbería en La Paz. Todo funciona con datos de prueba (mocks) y está preparado para conectarse a una API REST en Django.

**Stack:** React 19 + Vite 7, React Router 6, Tailwind CSS 4, lucide-react y date-fns (locale `es`).

### Cómo correrlo

Requisitos: Node.js 20 o superior.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de producción en dist/
npm run preview    # sirve el build
```

> **Nota sobre Vite 7:** el proyecto usa Vite 7 a propósito. En esta máquina, la política de Control de Aplicaciones de Windows bloquea el binario nativo de Vite 8 (`rolldown`). Si `npm install` muestra un aviso de `allow-scripts` para `esbuild`, se puede ignorar: el build funciona igual.

### Cómo entrar con cada rol

No hay autenticación real. Hay tres formas de entrar:

1. **Pantalla de Login → "Acceso de demostración"**: botones *Entrar como Cliente*, *Entrar como Empleado* y *Entrar como Administrador*.
2. **Formulario de login**: acepta cualquier contraseña.
   - Un correo que contenga `admin` entra como administrador.
   - Un correo de empleado (por ejemplo `rodrigo@lumina.bo`) o uno que contenga `empleado` entra como empleado.
   - Cualquier otro correo entra como cliente.
3. **Selector "Modo demo"** (esquina inferior izquierda, en todas las pantallas): cambia de rol al instante. También sirve para cerrar sesión y para **restablecer los datos demo**.

| Rol | Usuario de prueba | Inicio |
|---|---|---|
| Cliente | Valeria Quispe Mamani | `/mi-cuenta` |
| Empleado | Rodrigo Mamani Choque (barbero) | `/empleado` |
| Administrador | Carla Gutiérrez Rivero | `/admin` |

La sesión se guarda en `localStorage` (`lumina:sesion`), así que no se pierde al recargar. Las rutas están protegidas por rol: si un rol entra a un panel ajeno, se lo redirige a su propio inicio, y sin sesión se lo manda a `/login`.

### Rutas

| Público | Cliente | Empleado | Administrador |
|---|---|---|---|
| `/` landing | `/reservar` (wizard de 4 pasos) | `/empleado` agenda día/semana | `/admin` dashboard |
| `/servicios` | `/carrito/confirmar` | `/empleado/sin-cita` | `/admin/citas` |
| `/tienda`, `/tienda/:id` | `/mi-cuenta` (citas, pedidos, perfil) | `/empleado/tareas` | `/admin/empleados` |
| `/carrito` | | `/empleado/clientes[/:id]` | `/admin/servicios` |
| `/contacto` | | | `/admin/productos` |
| `/login`, `/registro` | | | `/admin/pedidos`, `/admin/tareas` |
| | | | `/admin/clientes[/:id]`, `/admin/caja` |

### Arquitectura de datos

```
src/
  mocks/          Datos de prueba (nombres bolivianos, precios en Bs). Las citas,
                  walk-ins, pedidos y tareas se generan relativos a "hoy".
  services/       Única puerta de acceso a datos. Funciones async con delay(300).
    api.js        "Base de datos" en memoria + request() listo para Django.
    index.js      Barrel: los componentes importan SOLO desde aquí.
  context/        AuthContext (sesión), DataContext (invalidación), CartContext.
  hooks/          useResource (carga, error, refresco) y useAccion (mutación + toast).
  utils/          formatCurrency, formatDate, fecha.js (zona La Paz), disponibilidad.js.
  components/ui/  Button, Field/Input/Select/Textarea, Card, Badge, Modal, Tabs,
                  Table, Skeleton, EmptyState, ErrorState, Toast, Segmented...
  components/layout/  PublicLayout, DashboardLayout (sidebar colapsable/drawer), RoleSwitcher.
```

- Los componentes **nunca** importan de `src/mocks/`; siempre usan `src/services/`.
- Las acciones (reservar, completar tarea, registrar walk-in, cambiar estado de pedido, etc.) modifican el estado en memoria. Después, `DataContext` incrementa una versión y todas las vistas montadas vuelven a pedir sus datos.
- El estado demo se guarda en `localStorage` (`lumina:db:v1`) y se regenera automáticamente al cambiar de día.
- La disponibilidad (`utils/disponibilidad.js`) solo ofrece horarios en los que el servicio completo cabe dentro del turno del profesional, sin cruzarse con citas activas ni walk-ins. Las citas canceladas o con "No asistió" liberan el horario.

### Conectar con Django REST

1. Crea un `.env` con la URL de la API:
   ```
   VITE_API_URL=http://localhost:8000/api
   ```
2. En cada archivo de `src/services/` reemplaza el cuerpo de la función por `request()`. Cada función ya tiene un comentario con el endpoint sugerido:
   ```js
   // Antes (mock)
   export async function getServicios({ categoria } = {}) {
     await delay()
     return clone(db.servicios.filter(...))
   }

   // Después (API)
   export async function getServicios({ categoria } = {}) {
     return request(`/servicios/?categoria=${categoria ?? ''}`)
   }
   ```
3. La forma de los objetos que devuelve cada servicio es la que espera la UI. Por ejemplo, `getCitas()` devuelve cada cita con `cliente`, `empleado` y `servicio` anidados, como lo haría un serializer anidado de DRF. Si el backend usa `snake_case`, conviértelo dentro de `services/`.
4. En `services/auth.js` cambia `login()` por `POST /api/auth/login/` (JWT o sesión) y guarda el token. `request()` ya acepta `{ token }`.
5. La lógica de `disponibilidad.js`, el vencimiento de pedidos a las 48 horas y la recurrencia de tareas deben pasar al backend. El frontend solo consume los endpoints.

### Sistema de diseño

Los tokens están en `src/index.css`, dentro de `@theme` (Tailwind 4).

- **Paleta neutra cálida:** fondo `#F6F5F1`, superficie `#FCFBF8`, piedra `#ECEAE4`, arena `#DDD8CC` y texto carbón `#23221F`.
- **Acento único:** oliva `#5F6B3A`. Los estados (éxito, aviso, error) usan tonos apagados y solo con significado semántico.
- **Tipografía:** Cormorant Garamond para títulos y Geist para el cuerpo, con números tabulares en montos y horas.
- **Forma:** 8 px en controles y 12 px en tarjetas y modales. Las sombras son mínimas y las capas (z-index) están documentadas en variables.
- **Formatos:** moneda `Bs 1.250,00`, fecha `jue 2 oct 2026`, horas en 24 h y zona `America/La_Paz`.
- **Accesibilidad y responsive:** foco visible, labels sobre los inputs, `prefers-reduced-motion` respetado y probado en 375, 768 y 1440 px.
