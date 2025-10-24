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
('R1', '2025-10-24 15:00:00', '2025-10-26 11:00:00', 'pendiente', 12000, 0, false, false, '2025-10-20', '101', '4'),
-- R2: Mateo (User 5) reserva una Suite Familiar (203)
('R2', '2025-10-24 15:00:00', '2025-10-27 11:00:00', 'pendiente', 60000, 20000, false, false, '2025-10-21', '203', '5');

-- Reservas CONFIRMADAS (Check-out hoy 24/10/2025)
INSERT INTO "Reservation" ("id", "checkInDate", "checkOutDate", "status", "totalPrice", "depositPaid", "includesBreakfast", "includesSpa", "createdAt", "roomId", "userId") VALUES
-- R3: Juan (User 1) está en una Suite Ejecutiva (301) y se va hoy
('R3', '2025-10-21 15:00:00', '2025-10-24 11:00:00', 'confirmada', 45000, 45000, true, true, '2025-10-01', '301', '1'),
-- R4: Luisa (User 4) está en una Doble Standard (201) y se va hoy
('R4', '2025-10-22 15:00:00', '2025-10-24 11:00:00', 'confirmada', 16000, 16000, false, false, '2025-10-05', '201', '4');

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