BEGIN;

-- 1. Insertar Usuarios
INSERT INTO "User" ("id", "email", "password", "role", "name", "phone", "createdAt") VALUES
('1', 'cliente@hotel.com', 'cliente123', 'cliente', 'Juan Pérez', '+54 11 1234-5678', '2024-01-01'),
('2', 'operador@hotel.com', 'operador123', 'operador', 'María García', '+54 11 8765-4321', '2024-01-01'),
('3', 'gerente@hotel.com', 'gerente123', 'gerencia', 'Carlos Rodríguez', '+54 11 5555-5555', '2024-01-01');

-- 2. Insertar Amenidades (Servicios del Hotel)
INSERT INTO "Amenity" ("id", "name", "description", "images") VALUES
('1', 'Piscina Climatizada', 'Disfruta de nuestra piscina climatizada de 25 metros, disponible todo el año. Incluye área de hidromasaje y zona de descanso con reposeras.', ARRAY['/heated-hotel-pool.jpg', '/pool-lounge-area.jpg']),
('2', 'Spa & Wellness', 'Centro de bienestar completo con sauna, sala de masajes, y tratamientos de belleza. Reserva tu sesión de relajación.', ARRAY['/luxury-spa-massage-room.jpg', '/spa-sauna.jpg']),
('3', 'Gimnasio', 'Gimnasio equipado con máquinas de última generación, pesas libres y área de cardio. Abierto 24/7 para huéspedes.', ARRAY['/modern-hotel-gym.jpg']),
('4', 'Restaurante Gourmet', 'Experimenta la alta cocina en nuestro restaurante con chef ejecutivo. Menú internacional y opciones vegetarianas.', ARRAY['/elegant-hotel-restaurant.jpg', '/gourmet-food-plating.png']),
('5', 'Salón de Eventos', 'Espacios versátiles para reuniones, conferencias y celebraciones. Capacidad hasta 200 personas con equipamiento audiovisual completo.', ARRAY['/hotel-conference-room.jpg', '/hotel-ballroom.png']);

-- 3. Insertar Tipos de Habitación (RoomType)
INSERT INTO "RoomType" ("id", "name", "description", "maxGuests", "basePrice", "images", "features", "isActive", "includesBreakfast", "includesSpa") VALUES
('1', 'Suite Ejecutiva', 'Amplia suite con vista panorámica, ideal para viajes de negocios o escapadas románticas.', 2, 15000, 
  ARRAY['/luxury-hotel-suite-bedroom.jpg', '/luxury-hotel-suite-bathroom.jpg', '/luxury-hotel-suite-living-room.jpg'], 
  ARRAY['Wi-Fi', 'TV 55"', 'Minibar', 'Caja fuerte', 'Aire acondicionado', 'Balcón privado'], 
  true, false, false
),
('2', 'Habitación Doble Standard', 'Cómoda habitación con dos camas individuales, perfecta para amigos o colegas.', 2, 8000, 
  ARRAY['/hotel-double-room.png', '/hotel-bathroom.png'], 
  ARRAY['Wi-Fi', 'TV 42"', 'Aire acondicionado', 'Escritorio'], 
  true, false, false
),
('3', 'Suite Familiar', 'Espaciosa suite con capacidad para 4 personas, ideal para familias.', 4, 20000, 
  ARRAY['/family-hotel-suite.png', '/hotel-suite-kids-room.jpg', '/hotel-suite-bathroom.jpg'], 
  ARRAY['Wi-Fi', 'TV 55"', 'Minibar', 'Caja fuerte', 'Aire acondicionado', 'Sala de estar', 'Cocina pequeña'], 
  true, false, false
),
('4', 'Habitación Individual', 'Acogedora habitación perfecta para viajeros solitarios.', 1, 6000, 
  ARRAY['/single-hotel-room.png', '/compact-hotel-bathroom.jpg'], 
  ARRAY['Wi-Fi', 'TV 32"', 'Aire acondicionado', 'Escritorio'], 
  true, false, false
),
('5', 'Suite Presidencial', 'La máxima expresión de lujo y confort, con servicios exclusivos.', 3, 35000, 
  ARRAY['/presidential-suite-bedroom.jpg', '/luxury-suite-living-room.jpg', '/luxury-suite-bathroom-jacuzzi.jpg', '/luxury-suite-terrace.jpg'], 
  ARRAY['Wi-Fi', 'TV 65"', 'Minibar premium', 'Caja fuerte', 'Aire acondicionado', 'Jacuzzi', 'Terraza privada', 'Servicio de mayordomo'], 
  true, false, false
);

-- 4. Insertar Habitaciones Físicas (Room)
-- 2 habitaciones por cada tipo de habitación

-- Suite Ejecutiva (Tipo 1) - Piso 3
INSERT INTO "Room" ("id", "floor", "status", "roomTypeId") VALUES
('301', 3, 'disponible', '1'),
('302', 3, 'disponible', '1');

-- Habitación Doble Standard (Tipo 2) - Piso 2
INSERT INTO "Room" ("id", "floor", "status", "roomTypeId") VALUES
('201', 2, 'disponible', '2'),
('202', 2, 'disponible', '2');

-- Suite Familiar (Tipo 3) - Piso 2
INSERT INTO "Room" ("id", "floor", "status", "roomTypeId") VALUES
('203', 2, 'disponible', '3'),
('204', 2, 'disponible', '3');

-- Habitación Individual (Tipo 4) - Piso 1
INSERT INTO "Room" ("id", "floor", "status", "roomTypeId") VALUES
('101', 1, 'disponible', '4'),
('102', 1, 'disponible', '4');

-- Suite Presidencial (Tipo 5) - Piso 3
INSERT INTO "Room" ("id", "floor", "status", "roomTypeId") VALUES
('303', 3, 'disponible', '5'),
('304', 3, 'disponible', '5');

-- ==================================================
-- NUEVOS DATOS SOLICITADOS (24/10/2025)
-- ==================================================

-- 5. Insertar Nuevos Clientes
INSERT INTO "User" ("id", "email", "password", "role", "name", "phone", "createdAt") VALUES
('4', 'cliente2@hotel.com', 'cliente123', 'cliente', 'Luisa Gonzalez', '+54 11 2222-3333', '2025-10-24'),
('5', 'cliente3@hotel.com', 'cliente123', 'cliente', 'Mateo Fernandez', '+54 11 4444-5555', '2025-10-24');

-- 6. Insertar Huéspedes (Guest)
INSERT INTO "Guest" ("id", "name", "dni", "email", "phone") VALUES
('G1', 'Juan Pérez', '30123456', 'cliente@hotel.com', '+54 11 1234-5678'),
('G2', 'Luisa Gonzalez', '32987654', 'cliente2@hotel.com', '+54 11 2222-3333'),
('G3', 'Mateo Fernandez', '31555444', 'cliente3@hotel.com', '+54 11 4444-5555'),
('G4', 'Ana Torres', '33111222', 'ana.torres@guest.com', '+54 11 6666-7777'),
('G5', 'Diego Silva', '29888999', 'diego.silva@guest.com', '+54 11 8888-9999');

-- 7. Insertar Reservas (Reservation)

-- Reservas PENDIENTES (Check-in hoy 24/10/2025)
INSERT INTO "Reservation" ("id", "checkInDate", "checkOutDate", "status", "totalPrice", "depositPaid", "includesBreakfast", "includesSpa", "createdAt", "roomId", "userId") VALUES
-- R1: Luisa (User 4) reserva una Habitación Individual (101)
('R1', '2025-10-24 15:00:00', '2025-10-26 11:00:00', 'confirmada', 12000, 20000, false, false, '2025-10-20', '101', '4'),
-- R2: Mateo (User 5) reserva una Suite Familiar (203)
('R2', '2025-10-24 15:00:00', '2025-10-27 11:00:00', 'confirmada', 60000, 20000, false, false, '2025-10-21', '203', '5');

-- Reservas CONFIRMADAS (Check-out hoy 24/10/2025)
INSERT INTO "Reservation" ("id", "checkInDate", "checkOutDate", "status", "totalPrice", "depositPaid", "includesBreakfast", "includesSpa", "createdAt", "roomId", "userId") VALUES
-- R3: Juan (User 1) está en una Suite Ejecutiva (301) y se va hoy
('R3', '2025-10-21 15:00:00', '2025-10-24 11:00:00', 'finalizada', 45000, 45000, true, true, '2025-10-01', '301', '1'),
-- R4: Luisa (User 4) está en una Doble Standard (201) y se va hoy
('R4', '2025-10-22 15:00:00', '2025-10-24 11:00:00', 'finalizada', 16000, 16000, false, false, '2025-10-05', '201', '4');

-- 8. Relacionar Huéspedes con Reservas (M2M - Tabla _GuestToReservation)
INSERT INTO "_GuestToReservation" ("A", "B") VALUES
-- R1 (Luisa sola)
('G2', 'R1'),
-- R2 (Mateo, Ana, Diego)
('G3', 'R2'),
('G4', 'R2'),
('G5', 'R2'),
-- R3 (Juan, Ana)
('G1', 'R3'),
('G4', 'R3'),
-- R4 (Luisa, Diego)
('G2', 'R4'),
('G5', 'R4');

-- 9. Lógica de Negocio: Comprobación de estado
-- Si una reserva está 'confirmada' y activa hoy (check-out hoy),
-- la habitación física debe figurar como 'ocupada'.
UPDATE "Room" SET "status" = 'ocupada' WHERE "id" = '301';
UPDATE "Room" SET "status" = 'ocupada' WHERE "id" = '201';


COMMIT;


BEGIN;

UPDATE "Reservation"
SET "status" = 'finalizada'
WHERE "id" IN ('R1', 'R2', 'R3', 'R4');

UPDATE "Room"
SET "status" = 'disponible'
WHERE "id" IN ('301', '201', '101', '203');


-- =================================================================
-- 3. Insertar reservas ACTIVAS
-- =================================================================

INSERT INTO "Reservation" ("id", "checkInDate", "checkOutDate", "status", "totalPrice", "depositPaid", "includesBreakfast", "includesSpa", "createdAt", "roomId", "userId") VALUES
-- R5: (Suite Exec, 3 noches, B+S)
('R5', '2025-10-25 15:00:00', '2025-10-28 11:00:00', 'confirmada', 45000, 45000, true, true, '2025-10-10', '302', '1'),
-- R6: (Doble Std, 2 noches)
('R6', '2025-10-26 15:00:00', '2025-10-28 11:00:00', 'confirmada', 16000, 16000, false, false, '2025-10-11', '202', '4'),
-- R7: (Suite Fam, 5 noches, B)
('R7', '2025-10-26 15:00:00', '2025-10-31 11:00:00', 'confirmada', 100000, 50000, true, false, '2025-10-12', '204', '5'),
-- R8: (Individual, 7 noches)
('R8', '2025-10-27 15:00:00', '2025-11-03 11:00:00', 'confirmada', 42000, 42000, false, false, '2025-10-15', '102', '1'),
-- R9: (Suite Pres, 2 noches, B+S)
('R9', '2025-10-27 15:00:00', '2025-10-29 11:00:00', 'confirmada', 70000, 70000, true, true, '2025-10-20', '303', '4');

-- 4. Marcar habitaciones de reservas activas como 'ocupada'
UPDATE "Room"
SET "status" = 'ocupada'
WHERE "id" IN ('302', '202', '204', '102', '303');


-- =================================================================
-- 5. Insertar reservas PASADAS
-- =================================================================
INSERT INTO "Reservation" ("id", "checkInDate", "checkOutDate", "status", "totalPrice", "depositPaid", "includesBreakfast", "includesSpa", "createdAt", "roomId", "userId") VALUES
('R10', '2025-09-20 15:00:00', '2025-09-22 11:00:00', 'finalizada', 12000, 12000, false, false, '2025-09-01', '101', '1'),
('R11', '2025-09-21 15:00:00', '2025-09-24 11:00:00', 'finalizada', 24000, 24000, true, false, '2025-09-02', '201', '4'),
('R12', '2025-09-22 15:00:00', '2025-09-26 11:00:00', 'finalizada', 60000, 60000, true, true, '2025-09-03', '301', '5'),
('R13', '2025-09-23 15:00:00', '2025-09-25 11:00:00', 'finalizada', 40000, 40000, false, false, '2025-09-04', '203', '1'),
('R14', '2025-09-24 15:00:00', '2025-09-25 11:00:00', 'finalizada', 35000, 35000, true, true, '2025-09-05', '304', '4'),

-- Semana 2 (27 Sep - 03 Oct)
('R15', '2025-09-27 15:00:00', '2025-09-30 11:00:00', 'finalizada', 18000, 18000, true, false, '2025-09-10', '102', '5'),
('R16', '2025-09-28 15:00:00', '2025-10-02 11:00:00', 'finalizada', 32000, 32000, false, false, '2025-09-11', '202', '1'),
('R17', '2025-09-30 15:00:00', '2025-10-05 11:00:00', 'finalizada', 75000, 75000, true, true, '2025-09-12', '302', '4'),
('R18', '2025-10-01 15:00:00', '2025-10-03 11:00:00', 'finalizada', 12000, 12000, false, false, '2025-09-13', '101', '5'),
('R19', '2025-10-02 15:00:00', '2025-10-04 11:00:00', 'finalizada', 16000, 16000, true, false, '2025-09-14', '201', '1'),

-- Semana 3 (04 Oct - 10 Oct)
('R20', '2025-10-04 15:00:00', '2025-10-06 11:00:00', 'finalizada', 30000, 30000, false, true, '2025-09-20', '301', '4'),
('R21', '2025-10-05 15:00:00', '2025-10-10 11:00:00', 'finalizada', 100000, 100000, true, false, '2025-09-21', '203', '5'),
('R22', '2025-10-06 15:00:00', '2025-10-09 11:00:00', 'finalizada', 105000, 105000, true, true, '2025-09-22', '304', '1'),
('R23', '2025-10-07 15:00:00', '2025-10-10 11:00:00', 'finalizada', 18000, 18000, false, false, '2025-09-23', '102', '4'),
('R24', '2025-10-08 15:00:00', '2025-10-09 11:00:00', 'finalizada', 8000, 8000, true, false, '2025-09-24', '202', '5'),

-- Semana 4 (11 Oct - 17 Oct)
('R25', '2025-10-11 15:00:00', '2025-10-18 11:00:00', 'finalizada', 42000, 42000, false, true, '2025-10-01', '101', '1'),
('R26', '2025-10-12 15:00:00', '2025-10-15 11:00:00', 'finalizada', 45000, 45000, true, true, '2025-10-02', '302', '4'),
('R27', '2025-10-13 15:00:00', '2025-10-17 11:00:00', 'finalizada', 32000, 32000, true, false, '2025-10-03', '201', '5'),
('R28', '2025-10-15 15:00:00', '2025-10-20 11:00:00', 'finalizada', 100000, 100000, false, false, '2025-10-04', '204', '1'),
('R29', '2025-10-16 15:00:00', '2025-10-19 11:00:00', 'finalizada', 105000, 105000, true, true, '2025-10-05', '303', '4');


-- =================================================================
-- 6. Insertar reservas FUTURAS 
-- =================================================================
INSERT INTO "Reservation" ("id", "checkInDate", "checkOutDate", "status", "totalPrice", "depositPaid", "includesBreakfast", "includesSpa", "createdAt", "roomId", "userId") VALUES
('R30', '2025-10-28 15:00:00', '2025-10-30 11:00:00', 'pendiente', 12000, 12000, true, false, '2025-10-25', '101', '1'),
('R31', '2025-10-29 15:00:00', '2025-11-01 11:00:00', 'pendiente', 24000, 24000, true, false, '2025-10-25', '201', '4'),
('R32', '2025-10-30 15:00:00', '2025-11-02 11:00:00', 'pendiente', 45000, 45000, true, true, '2025-10-26', '301', '5'),
('R33', '2025-11-01 15:00:00', '2025-11-04 11:00:00', 'pendiente', 60000, 60000, true, false, '2025-10-26', '203', '1'),
('R34', '2025-11-02 15:00:00', '2025-11-03 11:00:00', 'pendiente', 35000, 35000, true, true, '2025-10-27', '304', '4'),
-- (Habitaciones 102, 202, 204, 302, 303 están libres después del 03/11)
('R35', '2025-11-04 15:00:00', '2025-11-06 11:00:00', 'pendiente', 12000, 12000, true, false, '2025-10-27', '102', '5'),
('R36', '2025-11-05 15:00:00', '2025-11-08 11:00:00', 'pendiente', 24000, 24000, true, false, '2025-10-27', '202', '1'),
('R37', '2025-11-06 15:00:00', '2025-11-10 11:00:00', 'pendiente', 80000, 80000, true, false, '2025-10-27', '204', '4'),
('R38', '2025-11-07 15:00:00', '2025-11-09 11:00:00', 'pendiente', 30000, 30000, true, true, '2025-10-27', '302', '5'),
('R39', '2025-11-10 15:00:00', '2025-11-15 11:00:00', 'pendiente', 175000, 175000, true, true, '2025-10-27', '303', '1');


-- =================================================================
-- 7. Asignar huéspedes a TODAS las nuevas reservas (R5 a R39)
-- =================================================================
INSERT INTO "_GuestToReservation" ("A", "B") VALUES
-- Activas (R5-R9)
('G1', 'R5'), ('G4', 'R5'),
('G2', 'R6'),
('G3', 'R7'), ('G4', 'R7'), ('G5', 'R7'),
('G1', 'R8'),
('G2', 'R9'), ('G5', 'R9'),
-- Pasadas (R10-R29)
('G1', 'R10'),
('G2', 'R11'),
('G3', 'R12'), ('G4', 'R12'),
('G1', 'R13'), ('G4', 'R13'), ('G5', 'R13'),
('G2', 'R14'),
('G3', 'R15'),
('G1', 'R16'),
('G2', 'R17'), ('G5', 'R17'),
('G3', 'R18'),
('G1', 'R19'),
('G2', 'R20'),
('G3', 'R21'), ('G4', 'R21'), ('G5', 'R21'),
('G1', 'R22'), ('G4', 'R22'),
('G2', 'R23'),
('G3', 'R24'),
('G1', 'R25'),
('G2', 'R26'), ('G5', 'R26'),
('G3', 'R27'),
('G1', 'R28'), ('G4', 'R28'),
('G2', 'R29'), ('G4', 'R29'), ('G5', 'R29'),
-- Futuras (R30-R39)
('G1', 'R30'),
('G2', 'R31'), ('G5', 'R31'),
('G3', 'R32'),
('G1', 'R33'), ('G4', 'R33'),
('G2', 'R34'),
('G3', 'R35'),
('G1', 'R36'), ('G5', 'R36'),
('G2', 'R37'), ('G4', 'R37'), ('G5', 'R37'),
('G3', 'R38'),
('G1', 'R39'), ('G4', 'R39'), ('G5', 'R39');

COMMIT;
