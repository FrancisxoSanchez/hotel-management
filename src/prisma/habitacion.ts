// src/prisma/habitacion.ts

import { prisma } from "@/lib/prisma";
import { RoomType, Room } from "@prisma/client";

export type RoomTypeWithAvailability = RoomType & {
  availableCount: number;
  availableRoomIds: string[];
};

/**
 * Busca tipos de habitación con disponibilidad real basada en habitaciones físicas
 */
export async function findAvailableRooms(
  guestCount: number,
  checkIn?: Date,
  checkOut?: Date
): Promise<RoomTypeWithAvailability[]> {
  
  // 1. Obtener tipos de habitación activos con capacidad suficiente
  const roomTypes = await prisma.roomType.findMany({
    where: {
      isActive: true,
      maxGuests: {
        gte: guestCount,
      },
    },
    include: {
      rooms: {
        where: {
          status: {
            in: ['disponible', 'limpieza'], // Habitaciones potencialmente disponibles
          },
        },
      },
    },
    orderBy: [
      { basePrice: 'asc' },
      { name: 'asc' },
    ],
  });

  // 2. Si no hay fechas, contar todas las habitaciones disponibles
  if (!checkIn || !checkOut) {
    return roomTypes.map((roomType) => ({
      ...roomType,
      availableCount: roomType.rooms.length,
      availableRoomIds: roomType.rooms.map(r => r.id),
      rooms: undefined as any, // Remover para limpieza
    }));
  }

  // 3. Con fechas: filtrar habitaciones que NO tienen reservas superpuestas
  const roomTypesWithAvailability: RoomTypeWithAvailability[] = [];

  for (const roomType of roomTypes) {
    // Obtener IDs de todas las habitaciones de este tipo
    const allRoomIds = roomType.rooms.map(r => r.id);

    if (allRoomIds.length === 0) {
      continue; // Este tipo no tiene habitaciones físicas
    }

    // Buscar reservas que se superponen con el período solicitado
    const reservedRoomIds = await prisma.reservation.findMany({
      where: {
        roomId: {
          in: allRoomIds,
        },
        status: {
          in: ['pendiente', 'confirmada'],
        },
        checkInDate: {
          lt: checkOut,
        },
        checkOutDate: {
          gt: checkIn,
        },
      },
      select: {
        roomId: true,
      },
    });

    // Extraer los IDs de habitaciones reservadas
    const reservedIds = new Set(reservedRoomIds.map(r => r.roomId));

    // Habitaciones disponibles = todas - reservadas
    const availableRoomIds = allRoomIds.filter(id => !reservedIds.has(id));

    // Solo incluir tipos con al menos una habitación disponible
    if (availableRoomIds.length > 0) {
      const { rooms, ...roomTypeData } = roomType;
      roomTypesWithAvailability.push({
        ...roomTypeData,
        availableCount: availableRoomIds.length,
        availableRoomIds,
      });
    }
  }

  return roomTypesWithAvailability;
}

/**
 * Obtiene una habitación individual por ID con su tipo
 */
export async function getRoomById(roomId: string) {
  return await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      roomType: true,
    },
  });
}

/**
 * Encuentra una habitación disponible específica para reservar
 */
export async function findAvailableRoomForType(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date
): Promise<string | null> {
  // 1. Obtener todas las habitaciones de este tipo
  const rooms = await prisma.room.findMany({
    where: {
      roomTypeId: roomTypeId,
      status: {
        in: ['disponible', 'limpieza'],
      },
    },
    select: {
      id: true,
    },
  });

  if (rooms.length === 0) {
    return null;
  }

  const roomIds = rooms.map(r => r.id);

  // 2. Encontrar habitaciones con reservas superpuestas
  const reservedRooms = await prisma.reservation.findMany({
    where: {
      roomId: {
        in: roomIds,
      },
      status: {
        in: ['pendiente', 'confirmada'],
      },
      checkInDate: {
        lt: checkOut,
      },
      checkOutDate: {
        gt: checkIn,
      },
    },
    select: {
      roomId: true,
    },
  });

  const reservedIds = new Set(reservedRooms.map(r => r.roomId));

  // 3. Retornar la primera habitación disponible
  const availableRoom = roomIds.find(id => !reservedIds.has(id));
  
  return availableRoom || null;
}

/**
 * Obtiene los detalles de un tipo de habitación por ID
 * (usado para la página de detalle)
 */
export async function getRoomTypeById(id: string) {
  return await prisma.roomType.findFirst({
    where: {
      id: id,
      isActive: true,
    },
  });
}