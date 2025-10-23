import type { Room, Amenity, User, Reservation } from "./types"

// Mock users
export const mockUsers: User[] = [
  {
    id: "1",
    email: "cliente@hotel.com",
    password: "cliente123",
    role: "cliente",
    name: "Juan Pérez",
    phone: "+54 11 1234-5678",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "operador@hotel.com",
    password: "operador123",
    role: "operador",
    name: "María García",
    phone: "+54 11 8765-4321",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    email: "gerente@hotel.com",
    password: "gerente123",
    role: "gerencia",
    name: "Carlos Rodríguez",
    phone: "+54 11 5555-5555",
    createdAt: new Date("2024-01-01"),
  },
]

// Mock rooms
export const mockRooms: Room[] = [
  {
    id: "1",
    name: "Suite Ejecutiva",
    description: "Amplia suite con vista panorámica, ideal para viajes de negocios o escapadas románticas.",
    maxGuests: 2,
    basePrice: 15000,
    images: [
      "/luxury-hotel-suite-bedroom.jpg",
      "/luxury-hotel-suite-bathroom.jpg",
      "/luxury-hotel-suite-living-room.jpg",
    ],
    amenities: ["Wi-Fi", 'TV 55"', "Minibar", "Caja fuerte", "Aire acondicionado", "Balcón privado"],
    isActive: true,
    includesBreakfast: false,
    includesSpa: false,
    quantity: 3,
  },
  {
    id: "2",
    name: "Habitación Doble Standard",
    description: "Cómoda habitación con dos camas individuales, perfecta para amigos o colegas.",
    maxGuests: 2,
    basePrice: 8000,
    images: ["/hotel-double-room.png", "/hotel-bathroom.png"],
    amenities: ["Wi-Fi", 'TV 42"', "Aire acondicionado", "Escritorio"],
    isActive: true,
    includesBreakfast: false,
    includesSpa: false,
    quantity: 5,
  },
  {
    id: "3",
    name: "Suite Familiar",
    description: "Espaciosa suite con capacidad para 4 personas, ideal para familias.",
    maxGuests: 4,
    basePrice: 20000,
    images: ["/family-hotel-suite.png", "/hotel-suite-kids-room.jpg", "/hotel-suite-bathroom.jpg"],
    amenities: ["Wi-Fi", 'TV 55"', "Minibar", "Caja fuerte", "Aire acondicionado", "Sala de estar", "Cocina pequeña"],
    isActive: true,
    includesBreakfast: false,
    includesSpa: false,
    quantity: 2,
  },
  {
    id: "4",
    name: "Habitación Individual",
    description: "Acogedora habitación perfecta para viajeros solitarios.",
    maxGuests: 1,
    basePrice: 6000,
    images: ["/single-hotel-room.png", "/compact-hotel-bathroom.jpg"],
    amenities: ["Wi-Fi", 'TV 32"', "Aire acondicionado", "Escritorio"],
    isActive: true,
    includesBreakfast: false,
    includesSpa: false,
    quantity: 4,
  },
  {
    id: "5",
    name: "Suite Presidencial",
    description: "La máxima expresión de lujo y confort, con servicios exclusivos.",
    maxGuests: 3,
    basePrice: 35000,
    images: [
      "/presidential-suite-bedroom.jpg",
      "/luxury-suite-living-room.jpg",
      "/luxury-suite-bathroom-jacuzzi.jpg",
      "/luxury-suite-terrace.jpg",
    ],
    amenities: [
      "Wi-Fi",
      'TV 65"',
      "Minibar premium",
      "Caja fuerte",
      "Aire acondicionado",
      "Jacuzzi",
      "Terraza privada",
      "Servicio de mayordomo",
    ],
    isActive: true,
    includesBreakfast: false,
    includesSpa: false,
    quantity: 1,
  },
]

// Mock amenities
export const mockAmenities: Amenity[] = [
  {
    id: "1",
    name: "Piscina Climatizada",
    description:
      "Disfruta de nuestra piscina climatizada de 25 metros, disponible todo el año. Incluye área de hidromasaje y zona de descanso con reposeras.",
    images: ["/heated-hotel-pool.jpg", "/pool-lounge-area.jpg"],
  },
  {
    id: "2",
    name: "Spa & Wellness",
    description:
      "Centro de bienestar completo con sauna, sala de masajes, y tratamientos de belleza. Reserva tu sesión de relajación.",
    images: ["/luxury-spa-massage-room.jpg", "/spa-sauna.jpg"],
  },
  {
    id: "3",
    name: "Gimnasio",
    description:
      "Gimnasio equipado con máquinas de última generación, pesas libres y área de cardio. Abierto 24/7 para huéspedes.",
    images: ["/modern-hotel-gym.jpg"],
  },
  {
    id: "4",
    name: "Restaurante Gourmet",
    description:
      "Experimenta la alta cocina en nuestro restaurante con chef ejecutivo. Menú internacional y opciones vegetarianas.",
    images: ["/elegant-hotel-restaurant.jpg", "/gourmet-food-plating.png"],
  },
  {
    id: "5",
    name: "Salón de Eventos",
    description:
      "Espacios versátiles para reuniones, conferencias y celebraciones. Capacidad hasta 200 personas con equipamiento audiovisual completo.",
    images: ["/hotel-conference-room.jpg", "/hotel-ballroom.png"],
  },
]

// Mock reservations
export const mockReservations: Reservation[] = []
