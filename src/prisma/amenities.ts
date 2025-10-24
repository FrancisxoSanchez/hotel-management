import { prisma } from '@/lib/prisma';
import type { Amenity } from '@prisma/client';

// Definimos el tipo de dato que devolverá esta consulta.
// En este caso, coincide con los campos del modelo.
export type FullAmenity = Pick<
  Amenity,
  'id' | 'name' | 'description' | 'images'
>;

/**
 * Obtiene la lista completa de instalaciones.
 * @returns Un array con todas las instalaciones.
 */
export async function getAllAmenities(): Promise<FullAmenity[]> {
  try {
    const amenities = await prisma.amenity.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        images: true,
      },
      orderBy: {
        name: 'asc', // Ordenar alfabéticamente por nombre
      },
    });
    return amenities;
  } catch (error) {
    console.error('Error al obtener las instalaciones:', error);
    return []; // Devolver array vacío en caso de error
  }
}
