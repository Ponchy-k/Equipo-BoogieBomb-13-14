-- =====================================================================
--  Lumina - Salón y barbería
--  Esquema de base de datos para PostgreSQL (14 o superior)
--  Basado en los mocks de src/mocks/*.js del frontend.
--
--  Uso:  psql -U postgres -d lumina -f 01_schema.sql
--  Ojo: este script BORRA y vuelve a crear todas las tablas.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- para guardar contraseñas con hash

DROP TABLE IF EXISTS tarea, pedido_item, pedido, walkin, cita,
                     empleado_horario, empleado_servicio,
                     producto, servicio, empleado, cliente, usuario,
                     salon_horario, salon CASCADE;

-- ---------------------------------------------------------------------
--  Información del local (una sola fila)
-- ---------------------------------------------------------------------
CREATE TABLE salon (
    id         SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    nombre     VARCHAR(80)  NOT NULL,
    eslogan    VARCHAR(120),
    direccion  VARCHAR(200),
    ciudad     VARCHAR(80),
    telefono   VARCHAR(30),
    whatsapp   VARCHAR(30),
    correo     VARCHAR(120)
);

CREATE TABLE salon_horario (
    id     SERIAL PRIMARY KEY,
    dias   VARCHAR(40) NOT NULL,          -- 'Lunes a viernes'
    horas  VARCHAR(40) NOT NULL           -- '09:00 - 20:00' o 'Cerrado'
);

-- ---------------------------------------------------------------------
--  Usuarios (login). Un usuario tiene un rol y, según el rol,
--  está ligado a un cliente o a un empleado.
-- ---------------------------------------------------------------------
CREATE TABLE usuario (
    id             SERIAL PRIMARY KEY,
    nombre         VARCHAR(120) NOT NULL,
    correo         VARCHAR(120) NOT NULL UNIQUE,
    password_hash  TEXT         NOT NULL,
    rol            VARCHAR(10)  NOT NULL CHECK (rol IN ('cliente', 'empleado', 'admin')),
    activo         BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
--  Clientes
-- ---------------------------------------------------------------------
CREATE TABLE cliente (
    id              SERIAL PRIMARY KEY,
    usuario_id      INT UNIQUE REFERENCES usuario(id) ON DELETE SET NULL,
    nombre          VARCHAR(120) NOT NULL,
    telefono        VARCHAR(30),
    correo          VARCHAR(120) UNIQUE,
    notas           TEXT         NOT NULL DEFAULT '',   -- alergias, preferencias
    inasistencias   INT          NOT NULL DEFAULT 0 CHECK (inasistencias >= 0),
    registrado_en   DATE         NOT NULL DEFAULT CURRENT_DATE
);

-- ---------------------------------------------------------------------
--  Empleados
-- ---------------------------------------------------------------------
CREATE TABLE empleado (
    id             SERIAL PRIMARY KEY,
    usuario_id     INT UNIQUE REFERENCES usuario(id) ON DELETE SET NULL,
    nombre         VARCHAR(120) NOT NULL,
    especialidad   VARCHAR(40)  NOT NULL,              -- 'Barbero', 'Estilista'
    estado         VARCHAR(15)  NOT NULL DEFAULT 'Disponible'
                   CHECK (estado IN ('Disponible', 'Ocupado', 'En descanso')),
    activo         BOOLEAN      NOT NULL DEFAULT TRUE,
    telefono       VARCHAR(30),
    correo         VARCHAR(120) UNIQUE
);

-- Turnos de trabajo. dia_semana: 0 = domingo … 6 = sábado (igual que JS).
-- Un empleado puede tener varios turnos el mismo día (turno partido).
CREATE TABLE empleado_horario (
    id           SERIAL PRIMARY KEY,
    empleado_id  INT      NOT NULL REFERENCES empleado(id) ON DELETE CASCADE,
    dia_semana   SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_inicio  TIME     NOT NULL,
    hora_fin     TIME     NOT NULL,
    CHECK (hora_fin > hora_inicio)
);

-- ---------------------------------------------------------------------
--  Servicios y qué empleado puede hacer cada uno (N a N)
-- ---------------------------------------------------------------------
CREATE TABLE servicio (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(80)   NOT NULL,
    categoria     VARCHAR(20)   NOT NULL CHECK (categoria IN ('Salón', 'Barbería')),
    duracion_min  INT           NOT NULL CHECK (duracion_min > 0),
    precio        NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    descripcion   TEXT          NOT NULL DEFAULT '',
    destacado     BOOLEAN       NOT NULL DEFAULT FALSE,
    activo        BOOLEAN       NOT NULL DEFAULT TRUE
);

CREATE TABLE empleado_servicio (
    empleado_id  INT NOT NULL REFERENCES empleado(id) ON DELETE CASCADE,
    servicio_id  INT NOT NULL REFERENCES servicio(id) ON DELETE CASCADE,
    PRIMARY KEY (empleado_id, servicio_id)
);

-- ---------------------------------------------------------------------
--  Citas (reservas de clientes registrados)
-- ---------------------------------------------------------------------
CREATE TABLE cita (
    id           SERIAL PRIMARY KEY,
    cliente_id   INT           NOT NULL REFERENCES cliente(id),
    empleado_id  INT           NOT NULL REFERENCES empleado(id),
    servicio_id  INT           NOT NULL REFERENCES servicio(id),
    fecha        DATE          NOT NULL,
    hora_inicio  TIME          NOT NULL,
    hora_fin     TIME          NOT NULL,
    precio       NUMERIC(10,2) NOT NULL,              -- precio al momento de reservar
    estado       VARCHAR(15)   NOT NULL DEFAULT 'Pendiente'
                 CHECK (estado IN ('Pendiente', 'Confirmada', 'En atención',
                                   'Completada', 'Cancelada', 'No asistió')),
    notas        TEXT          NOT NULL DEFAULT '',
    creada_en    TIMESTAMP     NOT NULL DEFAULT NOW(),
    CHECK (hora_fin > hora_inicio)
);
CREATE INDEX idx_cita_empleado_fecha ON cita (empleado_id, fecha);
CREATE INDEX idx_cita_cliente        ON cita (cliente_id);

-- ---------------------------------------------------------------------
--  Walk-ins (atenciones sin cita, cliente puede no estar registrado)
-- ---------------------------------------------------------------------
CREATE TABLE walkin (
    id              SERIAL PRIMARY KEY,
    empleado_id     INT           NOT NULL REFERENCES empleado(id),
    servicio_id     INT           NOT NULL REFERENCES servicio(id),
    cliente_nombre  VARCHAR(120)  NOT NULL DEFAULT 'Cliente ocasional',
    fecha           DATE          NOT NULL,
    hora_inicio     TIME          NOT NULL,
    hora_fin        TIME          NOT NULL,
    precio          NUMERIC(10,2) NOT NULL
);
CREATE INDEX idx_walkin_fecha ON walkin (fecha);

-- ---------------------------------------------------------------------
--  Tienda: productos, pedidos y detalle de pedido
-- ---------------------------------------------------------------------
CREATE TABLE producto (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(120)  NOT NULL,
    marca         VARCHAR(80),
    categoria     VARCHAR(40)   NOT NULL,   -- 'Cuidado capilar', 'Styling', 'Barba', 'Uñas', 'Accesorios'
    precio        NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    stock         INT           NOT NULL DEFAULT 0 CHECK (stock >= 0),
    stock_minimo  INT           NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    destacado     BOOLEAN       NOT NULL DEFAULT FALSE,
    tono          SMALLINT      NOT NULL DEFAULT 0,  -- color del placeholder de imagen
    imagen_url    TEXT,
    descripcion   TEXT          NOT NULL DEFAULT ''
);

CREATE TABLE pedido (
    id              SERIAL PRIMARY KEY,
    cliente_id      INT           NOT NULL REFERENCES cliente(id),
    estado          VARCHAR(20)   NOT NULL DEFAULT 'Pendiente'
                    CHECK (estado IN ('Pendiente', 'Listo para recoger',
                                      'Entregado y pagado', 'Cancelado', 'Expirado')),
    total           NUMERIC(10,2) NOT NULL DEFAULT 0,
    creado_en       TIMESTAMP     NOT NULL DEFAULT NOW(),
    expira_el       DATE          NOT NULL DEFAULT (CURRENT_DATE + 2),
    fecha_pago      DATE,
    metodo_pago     VARCHAR(20)   CHECK (metodo_pago IN ('Efectivo', 'QR en caja')),
    -- si está pagado debe tener fecha y método
    CHECK (estado <> 'Entregado y pagado' OR (fecha_pago IS NOT NULL AND metodo_pago IS NOT NULL))
);
CREATE INDEX idx_pedido_cliente ON pedido (cliente_id);

CREATE TABLE pedido_item (
    id               SERIAL PRIMARY KEY,
    pedido_id        INT           NOT NULL REFERENCES pedido(id) ON DELETE CASCADE,
    producto_id      INT           NOT NULL REFERENCES producto(id),
    nombre           VARCHAR(120)  NOT NULL,          -- copia del nombre al comprar
    precio_unitario  NUMERIC(10,2) NOT NULL,          -- copia del precio al comprar
    cantidad         INT           NOT NULL CHECK (cantidad > 0)
);

-- ---------------------------------------------------------------------
--  Tareas internas del personal
-- ---------------------------------------------------------------------
CREATE TABLE tarea (
    id              SERIAL PRIMARY KEY,
    titulo          VARCHAR(150) NOT NULL,
    categoria       VARCHAR(40)  NOT NULL
                    CHECK (categoria IN ('Limpieza', 'Mantenimiento de herramientas',
                                         'Toallas', 'Reposición de stock')),
    responsable_id  INT          NOT NULL REFERENCES empleado(id),
    prioridad       VARCHAR(5)   NOT NULL CHECK (prioridad IN ('Alta', 'Media', 'Baja')),
    fecha_limite    DATE         NOT NULL,
    recurrencia     VARCHAR(10)  NOT NULL DEFAULT 'Única'
                    CHECK (recurrencia IN ('Única', 'Diaria', 'Semanal')),
    estado          VARCHAR(15)  NOT NULL DEFAULT 'Pendiente'
                    CHECK (estado IN ('Pendiente', 'En progreso', 'Completada')),
    observacion     TEXT         NOT NULL DEFAULT '',
    producto_id     INT          REFERENCES producto(id),   -- solo para reposición de stock
    completada_en   DATE
);
CREATE INDEX idx_tarea_responsable ON tarea (responsable_id, estado);
