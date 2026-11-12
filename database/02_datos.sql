-- =====================================================================
--  Lumina - Datos de prueba (los mismos de src/mocks/*.js)
--  Ejecutar DESPUÉS de 01_schema.sql:
--      psql -U postgres -d lumina -f 02_datos.sql
--
--  Las citas, walk-ins, pedidos y tareas usan fechas relativas a
--  CURRENT_DATE, así que siempre hay datos de "hoy".
--  IDs: c1 → cliente 1, e1 → empleado 1, s1 → servicio 1, p1 → producto 1.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- Salón
-- ---------------------------------------------------------------------
INSERT INTO salon (nombre, eslogan, direccion, ciudad, telefono, whatsapp, correo) VALUES
('Lumina', 'Salón y barbería', 'Av. 20 de Octubre 2318, Sopocachi', 'La Paz, Bolivia',
 '+591 2 241 7730', '59171248391', 'hola@lumina.bo');

INSERT INTO salon_horario (dias, horas) VALUES
('Lunes a viernes', '09:00 - 20:00'),
('Sábado',          '09:00 - 16:00'),
('Domingo',         'Cerrado');

-- ---------------------------------------------------------------------
-- Usuarios de demostración (contraseña de todos: demo123)
-- ---------------------------------------------------------------------
INSERT INTO usuario (id, nombre, correo, password_hash, rol) VALUES
(1, 'Carla Gutiérrez Rivero', 'carla@lumina.bo',          crypt('demo123', gen_salt('bf')), 'admin'),
(2, 'Rodrigo Mamani Choque',  'rodrigo@lumina.bo',        crypt('demo123', gen_salt('bf')), 'empleado'),
(3, 'Valeria Quispe Mamani',  'valeria.quispe@gmail.com', crypt('demo123', gen_salt('bf')), 'cliente');

-- ---------------------------------------------------------------------
-- Clientes
-- ---------------------------------------------------------------------
INSERT INTO cliente (id, usuario_id, nombre, telefono, correo, notas, inasistencias, registrado_en) VALUES
(1,  3,    'Valeria Quispe Mamani',    '+591 714 25 830', 'valeria.quispe@gmail.com',
     'Alergia a la parafenilendiamina (PPD). Usar tintes sin amoníaco y hacer prueba de sensibilidad.', 0, '2025-03-14'),
(2,  NULL, 'Jorge Luis Aliaga',        '+591 769 11 402', 'jl.aliaga@hotmail.com',
     'Prefiere degradado bajo. Piel sensible a la navaja.', 0, '2025-06-02'),
(3,  NULL, 'Paola Mendoza Cruz',       '+591 722 90 617', 'paomendoza@gmail.com',
     'Cuero cabelludo sensible. Agua tibia, no caliente.', 1, '2024-11-20'),
(4,  NULL, 'Mauricio Guzmán Vela',     '+591 780 54 239', 'mguzman.vela@gmail.com', '', 3, '2025-01-09'),
(5,  NULL, 'Daniela Zeballos Ortiz',   '+591 731 68 045', 'dani.zeballos@outlook.com',
     'Alergia al látex. Usar guantes de nitrilo.', 0, '2025-08-17'),
(6,  NULL, 'Sergio Callisaya Limachi', '+591 762 37 184', 'scallisaya@gmail.com', '', 1, '2025-02-28'),
(7,  NULL, 'Natalia Arce Paz',         '+591 715 83 926', 'natalia.arcepaz@gmail.com',
     'Embarazada (6 meses). Evitar productos con formol.', 0, '2025-05-11'),
(8,  NULL, 'Fabián Laura Ramos',       '+591 795 42 671', 'fabian.laura@gmail.com', '', 0, '2025-09-03'),
(9,  NULL, 'Camila Villca Torrez',     '+591 728 16 553', 'camivillca@gmail.com',
     'Uñas frágiles. No usar torno.', 2, '2024-12-15'),
(10, NULL, 'Ernesto Poma Quiroga',     '+591 773 05 448', 'ernesto.poma@yahoo.com',
     'Barba larga, solo perfilar contornos.', 0, '2025-07-21');

-- ---------------------------------------------------------------------
-- Empleados
-- ---------------------------------------------------------------------
INSERT INTO empleado (id, usuario_id, nombre, especialidad, estado, telefono, correo) VALUES
(1, 2,    'Rodrigo Mamani Choque',  'Barbero',   'Disponible',  '+591 712 48 391', 'rodrigo@lumina.bo'),
(2, NULL, 'Andrea Flores Vargas',   'Estilista', 'Ocupado',     '+591 768 20 154', 'andrea@lumina.bo'),
(3, NULL, 'Luis Fernando Condori',  'Barbero',   'Disponible',  '+591 791 33 027', 'luisfernando@lumina.bo'),
(4, NULL, 'Gabriela Rojas Salazar', 'Estilista', 'En descanso', '+591 725 61 908', 'gabriela@lumina.bo'),
(5, NULL, 'Marcela Ticona Huanca',  'Estilista', 'Disponible',  '+591 776 04 512', 'marcela@lumina.bo'),
(6, NULL, 'Diego Quisbert Apaza',   'Barbero',   'Ocupado',     '+591 708 87 263', 'diego@lumina.bo');

-- Horarios
-- Turno partido (e1, e2, e4, e6): L-V 09-13 y 14-19, sábado 09-15
INSERT INTO empleado_horario (empleado_id, dia_semana, hora_inicio, hora_fin)
SELECT e, d, t.ini::time, t.fin::time
FROM unnest(ARRAY[1, 2, 4, 6]) AS e,
     generate_series(1, 5)     AS d,
     (VALUES ('09:00', '13:00'), ('14:00', '19:00')) AS t(ini, fin);

INSERT INTO empleado_horario (empleado_id, dia_semana, hora_inicio, hora_fin)
SELECT e, 6, '09:00', '15:00' FROM unnest(ARRAY[1, 2, 4, 5, 6]) AS e;

-- Turno tarde (e3, e5): L-V 12-20
INSERT INTO empleado_horario (empleado_id, dia_semana, hora_inicio, hora_fin)
SELECT e, d, '12:00', '20:00'
FROM unnest(ARRAY[3, 5]) AS e, generate_series(1, 5) AS d;

-- e3 sábado 10-16
INSERT INTO empleado_horario (empleado_id, dia_semana, hora_inicio, hora_fin) VALUES (3, 6, '10:00', '16:00');

-- ---------------------------------------------------------------------
-- Servicios
-- ---------------------------------------------------------------------
INSERT INTO servicio (id, nombre, categoria, duracion_min, precio, destacado, descripcion) VALUES
(1,  'Corte y peinado',               'Salón',    60,  120, TRUE,  'Diagnóstico, lavado, corte a medida y peinado final según tu tipo de cabello.'),
(2,  'Brushing',                      'Salón',    45,   80, FALSE, 'Lavado y secado con cepillo para un acabado liso o con volumen.'),
(3,  'Coloración completa',           'Salón',    120, 350, TRUE,  'Color de raíz a puntas con prueba de sensibilidad previa y tratamiento sellador.'),
(4,  'Balayage',                      'Salón',    180, 520, TRUE,  'Aclarado a mano alzada con matiz personalizado y acabado natural.'),
(5,  'Tratamiento de keratina',       'Salón',    150, 450, FALSE, 'Alisado progresivo que reduce el frizz hasta por tres meses.'),
(6,  'Manicure clásica',              'Salón',    45,   60, FALSE, 'Limado, cutícula, hidratación y esmaltado tradicional.'),
(7,  'Pedicure spa',                  'Salón',    60,   90, FALSE, 'Baño de pies, exfoliación, hidratación profunda y esmaltado.'),
(8,  'Peinado para evento',           'Salón',    60,  150, FALSE, 'Recogidos, ondas o trenzas para bodas, graduaciones y fiestas.'),
(9,  'Corte clásico',                 'Barbería', 40,   70, TRUE,  'Corte a tijera o máquina, lavado y peinado con producto.'),
(10, 'Corte y barba',                 'Barbería', 60,  110, TRUE,  'Corte completo más perfilado de barba con navaja y aceite.'),
(11, 'Perfilado de barba',            'Barbería', 30,   50, FALSE, 'Diseño y contorno de barba con navaja, toalla tibia y bálsamo.'),
(12, 'Afeitado con toalla caliente',  'Barbería', 45,   80, TRUE,  'Afeitado tradicional en tres pasos con toallas calientes y aceite preafeitado.'),
(13, 'Corte infantil',                'Barbería', 30,   50, FALSE, 'Corte para menores de 12 años, con paciencia y sin apuro.');

INSERT INTO empleado_servicio (empleado_id, servicio_id) VALUES
(1, 9), (1, 10), (1, 11), (1, 12), (1, 13),
(2, 1), (2, 2),  (2, 3),  (2, 8),
(3, 9), (3, 10), (3, 11), (3, 13),
(4, 1), (4, 3),  (4, 4),  (4, 5),  (4, 8),
(5, 2), (5, 6),  (5, 7),
(6, 9), (6, 10), (6, 11), (6, 12);

-- ---------------------------------------------------------------------
-- Productos
-- ---------------------------------------------------------------------
INSERT INTO producto (id, nombre, marca, categoria, precio, stock, stock_minimo, destacado, tono, descripcion) VALUES
(1,  'Shampoo reparador 300 ml',         'Wella',                 'Cuidado capilar', 145, 18, 6, TRUE,  0, 'Limpieza suave para cabello dañado o con color. Sin sulfatos agresivos.'),
(2,  'Acondicionador hidratante 200 ml', 'Wella',                 'Cuidado capilar', 138,  4, 6, FALSE, 1, 'Desenreda y aporta brillo sin apelmazar. Uso diario.'),
(3,  'Mascarilla Absolut Repair 250 ml', 'L''Oréal Professionnel', 'Cuidado capilar', 230,  9, 4, TRUE,  2, 'Tratamiento intensivo semanal para puntas abiertas y cabello quebradizo.'),
(4,  'Aceite capilar 100 ml',            'Moroccanoil',           'Cuidado capilar', 320,  6, 3, TRUE,  3, 'Aceite de argán ligero para controlar el frizz y proteger del calor.'),
(5,  'Protector térmico 150 ml',         'Schwarzkopf',           'Cuidado capilar', 120,  2, 5, FALSE, 4, 'Protección hasta 230 °C para plancha y secador.'),
(6,  'Pomada mate 113 g',                'Reuzel',                'Styling',         165, 14, 5, TRUE,  5, 'Fijación media, acabado sin brillo. Se lava fácilmente con agua.'),
(7,  'Cera fibrosa 85 g',                'American Crew',         'Styling',         150, 11, 4, FALSE, 0, 'Textura flexible para peinados con movimiento.'),
(8,  'Spray texturizante 200 ml',        'Schwarzkopf',           'Styling',         135,  7, 3, FALSE, 1, 'Volumen y cuerpo instantáneo para cabello fino.'),
(9,  'Aceite para barba 30 ml',          'Proraso',               'Barba',           110,  3, 5, TRUE,  2, 'Suaviza el vello y calma la piel. Aroma a madera y especias.'),
(10, 'Bálsamo para barba 100 ml',        'Proraso',               'Barba',           125,  8, 4, FALSE, 3, 'Hidrata y ayuda a dar forma sin dejar sensación grasa.'),
(11, 'Crema de afeitar 150 ml',          'Proraso',               'Barba',            85, 12, 4, FALSE, 4, 'Espuma densa con eucalipto y mentol para un afeitado al ras.'),
(12, 'Esmalte fortalecedor 15 ml',       'OPI',                   'Uñas',             95, 10, 4, FALSE, 5, 'Base y brillo en uno. Ayuda a reducir el quiebre de las uñas.'),
(13, 'Aceite de cutícula 8,6 ml',        'OPI',                   'Uñas',             70,  5, 3, FALSE, 0, 'Nutre e hidrata la cutícula entre manicuras.'),
(14, 'Cepillo desenredante',             'Tangle Teezer',         'Accesorios',      160,  6, 2, FALSE, 1, 'Desenreda en seco o en húmedo sin tirones.');

-- ---------------------------------------------------------------------
-- Citas  (días desde hoy, empleado, servicio, cliente, hora, estado forzado)
-- hora_fin y precio se calculan desde el servicio. Se omiten los domingos.
-- ---------------------------------------------------------------------
INSERT INTO cita (cliente_id, empleado_id, servicio_id, fecha, hora_inicio, hora_fin, precio, estado, creada_en)
SELECT x.cli, x.emp, x.srv,
       CURRENT_DATE + x.dias,
       x.hora::time,
       x.hora::time + s.duracion_min * INTERVAL '1 minute',
       s.precio,
       COALESCE(x.forzado,
                CASE WHEN x.dias < 0 THEN 'Completada'
                     WHEN x.dias = 0 THEN 'Confirmada'
                     WHEN x.dias % 2 = 0 THEN 'Pendiente'
                     ELSE 'Confirmada' END),
       CURRENT_DATE + x.dias - 3
FROM (VALUES
  -- pasado
  (-6,1,10,2,'10:00',NULL), (-6,2,1,3,'09:30',NULL), (-6,4,3,7,'14:00',NULL),
  (-5,1,9,4,'09:00','No asistió'), (-5,3,10,6,'15:00',NULL), (-5,5,6,9,'12:30',NULL),
  (-4,2,4,5,'09:00',NULL), (-4,1,12,10,'16:00',NULL), (-4,6,9,8,'11:00','Cancelada'),
  (-3,1,9,1,'10:00',NULL), (-3,5,7,1,'15:00',NULL), (-3,4,5,3,'09:00',NULL),
  (-2,1,10,6,'09:00',NULL), (-2,2,2,7,'11:00',NULL), (-2,3,9,4,'13:00','No asistió'),
  (-1,1,11,10,'12:00',NULL), (-1,2,1,1,'14:00',NULL), (-1,6,10,2,'15:00',NULL), (-1,5,6,9,'16:00',NULL),
  -- hoy
  (0,1,10,2,'09:00',NULL), (0,1,9,4,'10:15',NULL), (0,1,11,6,'11:00',NULL),
  (0,1,10,8,'14:00',NULL), (0,1,12,10,'15:30',NULL), (0,1,9,1,'17:00',NULL),
  (0,2,1,3,'09:30',NULL), (0,2,3,5,'11:00',NULL), (0,2,2,7,'15:00',NULL),
  (0,3,13,9,'12:30',NULL), (0,3,10,2,'16:00',NULL),
  (0,4,4,7,'09:00',NULL), (0,5,6,1,'12:00',NULL), (0,5,7,9,'14:00',NULL), (0,6,11,4,'14:30',NULL),
  -- futuro
  (1,1,10,6,'09:00',NULL), (1,1,9,8,'11:00',NULL), (1,2,3,1,'10:00',NULL),
  (1,4,5,5,'14:00',NULL), (1,5,7,3,'15:00',NULL),
  (2,1,12,2,'10:00',NULL), (2,3,10,10,'13:00',NULL), (2,2,8,7,'12:00',NULL),
  (3,1,9,1,'15:00',NULL), (3,6,10,4,'09:30',NULL), (3,4,4,9,'09:00',NULL),
  (5,1,10,10,'11:00',NULL), (5,2,1,5,'09:00',NULL),
  (6,5,6,1,'12:30',NULL), (6,1,11,6,'16:00',NULL)
) AS x(dias, emp, srv, cli, hora, forzado)
JOIN servicio s ON s.id = x.srv
WHERE EXTRACT(DOW FROM CURRENT_DATE + x.dias) <> 0;   -- domingo cerrado

-- ---------------------------------------------------------------------
-- Walk-ins (solo días pasados para no chocar con la hora actual)
-- ---------------------------------------------------------------------
INSERT INTO walkin (empleado_id, servicio_id, cliente_nombre, fecha, hora_inicio, hora_fin, precio)
SELECT x.emp, x.srv, x.nombre, CURRENT_DATE + x.dias, x.hora::time,
       x.hora::time + s.duracion_min * INTERVAL '1 minute', s.precio
FROM (VALUES
  (-6,3,9,'Cliente ocasional','17:00'), (-5,1,11,'Marco Antonio','12:00'),
  (-4,6,9,'Cliente ocasional','10:00'), (-3,3,10,'Óscar Mamani','18:00'),
  (-2,1,9,'Cliente ocasional','15:00'), (-2,5,6,'Rocío','18:00'),
  (-1,3,11,'Cliente ocasional','13:00'), (-1,1,9,'Cliente ocasional','17:30')
) AS x(dias, emp, srv, nombre, hora)
JOIN servicio s ON s.id = x.srv
WHERE EXTRACT(DOW FROM CURRENT_DATE + x.dias) <> 0;

-- ---------------------------------------------------------------------
-- Pedidos y sus ítems (el total se calcula al final)
-- ---------------------------------------------------------------------
INSERT INTO pedido (id, cliente_id, estado, creado_en, expira_el, fecha_pago, metodo_pago) VALUES
(2041, 1,  'Listo para recoger', CURRENT_DATE     + TIME '10:30', CURRENT_DATE + 2, NULL, NULL),
(2040, 2,  'Pendiente',          CURRENT_DATE     + TIME '10:30', CURRENT_DATE + 2, NULL, NULL),
(2039, 10, 'Pendiente',          CURRENT_DATE - 1 + TIME '10:30', CURRENT_DATE + 1, NULL, NULL),
(2038, 5,  'Entregado y pagado', CURRENT_DATE     + TIME '10:30', CURRENT_DATE + 2, CURRENT_DATE,     'QR en caja'),
(2037, 8,  'Entregado y pagado', CURRENT_DATE - 2 + TIME '10:30', CURRENT_DATE,     CURRENT_DATE - 2, 'Efectivo'),
(2036, 1,  'Entregado y pagado', CURRENT_DATE - 4 + TIME '10:30', CURRENT_DATE - 2, CURRENT_DATE - 4, 'Efectivo'),
(2035, 4,  'Expirado',           CURRENT_DATE - 5 + TIME '10:30', CURRENT_DATE - 3, NULL, NULL),
(2034, 7,  'Cancelado',          CURRENT_DATE - 6 + TIME '10:30', CURRENT_DATE - 4, NULL, NULL),
(2033, 3,  'Entregado y pagado', CURRENT_DATE - 1 + TIME '10:30', CURRENT_DATE + 1, CURRENT_DATE - 1, 'QR en caja');

INSERT INTO pedido_item (pedido_id, producto_id, nombre, precio_unitario, cantidad)
SELECT x.ped, p.id, p.nombre, p.precio, x.cant
FROM (VALUES
  (2041, 3, 1), (2041, 4, 1),
  (2040, 6, 2),
  (2039, 9, 1), (2039, 10, 1),
  (2038, 1, 1), (2038, 2, 1),
  (2037, 7, 1),
  (2036, 12, 2), (2036, 13, 1),
  (2035, 6, 1),
  (2034, 14, 1),
  (2033, 5, 1), (2033, 8, 1)
) AS x(ped, prod, cant)
JOIN producto p ON p.id = x.prod;

UPDATE pedido pe
SET total = (SELECT SUM(precio_unitario * cantidad) FROM pedido_item WHERE pedido_id = pe.id);

-- ---------------------------------------------------------------------
-- Tareas
-- ---------------------------------------------------------------------
INSERT INTO tarea (titulo, categoria, responsable_id, prioridad, fecha_limite, recurrencia, estado, observacion, producto_id, completada_en) VALUES
('Limpiar y desinfectar sillones de barbería', 'Limpieza',                      1, 'Alta',  CURRENT_DATE,     'Diaria',  'Pendiente',   '',               NULL, NULL),
('Esterilizar navajas y peines',               'Mantenimiento de herramientas', 1, 'Alta',  CURRENT_DATE - 1, 'Diaria',  'Pendiente',   '',               NULL, NULL),
('Lavar y doblar toallas',                     'Toallas',                       1, 'Media', CURRENT_DATE,     'Diaria',  'En progreso', '',               NULL, NULL),
('Reponer aceite para barba en vitrina',       'Reposición de stock',           1, 'Media', CURRENT_DATE + 1, 'Única',   'Pendiente',   '',               9,    NULL),
('Afilar tijeras de corte',                    'Mantenimiento de herramientas', 1, 'Baja',  CURRENT_DATE + 4, 'Semanal', 'Pendiente',   '',               NULL, NULL),
('Limpiar espejos y estaciones',               'Limpieza',                      1, 'Baja',  CURRENT_DATE - 1, 'Diaria',  'Completada',  'Sin novedades.', NULL, CURRENT_DATE - 1),
('Reponer protector térmico',                  'Reposición de stock',           2, 'Alta',  CURRENT_DATE - 2, 'Única',   'Pendiente',   '',               5,    NULL),
('Lavar capas y toallas de color',             'Toallas',                       2, 'Media', CURRENT_DATE,     'Diaria',  'Completada',  '',               NULL, CURRENT_DATE),
('Limpiar lavacabezas',                        'Limpieza',                      4, 'Media', CURRENT_DATE,     'Diaria',  'Pendiente',   '',               NULL, NULL),
('Revisar y limpiar secadores',                'Mantenimiento de herramientas', 5, 'Baja',  CURRENT_DATE + 2, 'Semanal', 'Pendiente',   '',               NULL, NULL),
('Desinfectar herramientas de manicure',       'Limpieza',                      5, 'Alta',  CURRENT_DATE,     'Diaria',  'Completada',  '',               NULL, CURRENT_DATE),
('Aceitar máquinas de corte',                  'Mantenimiento de herramientas', 3, 'Media', CURRENT_DATE - 1, 'Semanal', 'Pendiente',   '',               NULL, NULL),
('Barrer y trapear zona de barbería',          'Limpieza',                      6, 'Media', CURRENT_DATE,     'Diaria',  'Pendiente',   '',               NULL, NULL);

-- ---------------------------------------------------------------------
-- Ajustar los contadores SERIAL después de insertar IDs a mano
-- ---------------------------------------------------------------------
SELECT setval('usuario_id_seq',  (SELECT MAX(id) FROM usuario));
SELECT setval('cliente_id_seq',  (SELECT MAX(id) FROM cliente));
SELECT setval('empleado_id_seq', (SELECT MAX(id) FROM empleado));
SELECT setval('servicio_id_seq', (SELECT MAX(id) FROM servicio));
SELECT setval('producto_id_seq', (SELECT MAX(id) FROM producto));
SELECT setval('pedido_id_seq',   (SELECT MAX(id) FROM pedido));

COMMIT;
