BEGIN;

-- 1. Insertar Usuarios
-- (Usamos los IDs de tus mocks)
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
-- LA CORRECCIÓN ESTÁ EN ESTA LÍNEA (features en lugar de amenities)
INSERT INTO "RoomType" ("id", "name", "description", "maxGuests", "basePrice", "images", "features", "isActive", "includesBreakfast", "includesSpa", "quantity") VALUES
('1', 'Suite Ejecutiva', 'Amplia suite con vista panorámica, ideal para viajes de negocios o escapadas románticas.', 2, 15000, 
  ARRAY['/luxury-hotel-suite-bedroom.jpg', '/luxury-hotel-suite-bathroom.jpg', '/luxury-hotel-suite-living-room.jpg'], 
  ARRAY['Wi-Fi', 'TV 55"', 'Minibar', 'Caja fuerte', 'Aire acondicionado', 'Balcón privado'], 
  true, false, false, 3
),
('2', 'Habitación Doble Standard', 'Cómoda habitación con dos camas individuales, perfecta para amigos o colegas.', 2, 8000, 
  ARRAY['/hotel-double-room.png', '/hotel-bathroom.png'], 
  ARRAY['Wi-Fi', 'TV 42"', 'Aire acondicionado', 'Escritorio'], 
  true, false, false, 5
),
('3', 'Suite Familiar', 'Espaciosa suite con capacidad para 4 personas, ideal para familias.', 4, 20000, 
  ARRAY['/family-hotel-suite.png', '/hotel-suite-kids-room.jpg', '/hotel-suite-bathroom.jpg'], 
  ARRAY['Wi-Fi', 'TV 55"', 'Minibar', 'Caja fuerte', 'Aire acondicionado', 'Sala de estar', 'Cocina pequeña'], 
  true, false, false, 2
),
('4', 'Habitación Individual', 'Acogedora habitación perfecta para viajeros solitarios.', 1, 6000, 
  ARRAY['/single-hotel-room.png', '/compact-hotel-bathroom.jpg'], 
  ARRAY['Wi-Fi', 'TV 32"', 'Aire acondicionado', 'Escritorio'], 
  true, false, false, 4
),
('5', 'Suite Presidencial', 'La máxima expresión de lujo y confort, con servicios exclusivos.', 3, 35000, 
  ARRAY['/presidential-suite-bedroom.jpg', '/luxury-suite-living-room.jpg', '/luxury-suite-bathroom-jacuzzi.jpg', '/luxury-suite-terrace.jpg'], 
  ARRAY['Wi-Fi', 'TV 65"', 'Minibar premium', 'Caja fuerte', 'Aire acondicionado', 'Jacuzzi', 'Terraza privada', 'Servicio de mayordomo'], 
  true, false, false, 1
);

COMMIT;