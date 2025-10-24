import { prisma } from '@/lib/prisma';
import type { RoomType, Amenity } from '@prisma/client';

// Definimos tipos específicos para los datos que enviaremos al cliente.
// Esto es una buena práctica para no exponer todo el modelo de la base de datos.
export type FeaturedRoom = Pick<
  RoomType,
  'id' | 'name' | 'description' | 'maxGuests' | 'basePrice' | 'images'
>;

export type FeaturedAmenity = Pick<
  Amenity,
  'id' | 'name' | 'description' | 'images'
>;

export interface HomePageData {
  featuredRooms: FeaturedRoom[];
  featuredAmenities: FeaturedAmenity[];
}

/**
 * Obtiene los datos necesarios para la página de inicio del cliente.
 * @returns Un objeto con 3 habitaciones activas y 4 instalaciones.
 */
export async function getHomePageData(): Promise<HomePageData> {
  try {
    // 1. Obtener las 3 primeras habitaciones activas
    const featuredRooms = await prisma.roomType.findMany({
      where: {
        isActive: true, // Solo mostrar habitaciones activas
      },
      take: 3, // Limitar a 3 resultados
      select: {
        id: true,
        name: true,
        description: true,
        maxGuests: true,
        basePrice: true,
        images: true,
      },
      orderBy: {
        basePrice: 'asc', // Opcional: ordenar por precio, por ejemplo
      },
    });

    // 2. Obtener las 4 primeras instalaciones
    const featuredAmenities = await prisma.amenity.findMany({
      take: 4, // Limitar a 4 resultados
      select: {
        id: true,
        name: true,
        description: true,
        images: true,
      },
    });

    return { featuredRooms, featuredAmenities };
  } catch (error) {
    console.error('Error al obtener los datos del Home:', error);
    // Devolver arrays vacíos en caso de error para que la página no se rompa
    return { featuredRooms: [], featuredAmenities: [] };
  }
}

