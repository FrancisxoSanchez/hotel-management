// src/prisma/detallehabitacion.ts

import { prisma } from "@/lib/prisma";

export interface RoomDetailData {
  id: string;
  name: string;
  description: string;
  maxGuests: number;
  basePrice: number;
  images: string[];
  isActive: boolean;
  includesBreakfast: boolean;
  includesSpa: boolean;
  features: string[];
  totalRooms?: number;
  rooms?: Array<{
    id: string;
    floor: number;
    status: string;
  }>;
}

/**
 * Obtiene los detalles completos de un tipo de habitación
 */
export async function getRoomTypeDetail(id: string): Promise<RoomDetailData | null> {
  const roomType = await prisma.roomType.findFirst({
    where: {
      id: id,
      isActive: true,
    },
    include: {
      rooms: {
        where: {
          status: {
            in: ['disponible', 'limpieza'],
          },
        },
        select: {
          id: true,
          floor: true,
          status: true,
        },
      },
    },
  });

  if (!roomType) {
    return null;
  }

  return {
    ...roomType,
    totalRooms: roomType.rooms.length,
  };
}