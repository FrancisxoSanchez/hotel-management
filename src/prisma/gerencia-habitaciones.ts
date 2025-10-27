// src/prisma/gerencia-habitaciones.ts

import { prisma } from "@/lib/prisma"
import type { Room, RoomType, RoomStatus } from "@prisma/client"
import { z } from "zod"

// --- Esquemas de Validación (para RoomType) ---
export const roomTypeSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  basePrice: z.coerce.number().min(0, "El precio no puede ser negativo"),
  maxGuests: z.coerce.number().int().min(1, "Debe alojar al menos 1 huésped"),
  includesBreakfast: z.boolean().default(false),
  includesSpa: z.boolean().default(false),
  isActive: z.boolean().default(true),
  // features: z.array(z.string()).optional(), // Omitido por simplicidad
  // images: z.array(z.string()).optional(), // Omitido por simplicidad
})

export type RoomTypeInput = z.infer<typeof roomTypeSchema>

// --- Tipos Extendidos ---

// El tipo FullRoom ahora incluye el conteo de reservas activas
export type FullRoom = Room & {
  roomType: RoomType
  _count: {
    reservations: number
  }
}

interface RoomFilters {
  floor?: number
  roomTypeId?: string
}

/**
 * Obtiene todas las habitaciones físicas con su tipo y conteo de reservas.
 */
export async function getRooms(
  filters: RoomFilters = {}
): Promise<FullRoom[]> {
  const where: any = {}

  if (filters.floor) {
    where.floor = filters.floor
  }

  if (filters.roomTypeId) {
    where.roomTypeId = filters.roomTypeId
  }

  return prisma.room.findMany({
    where,
    include: {
      roomType: true, // Incluimos la info del tipo de habitación
      _count: {
        select: {
          // Contamos solo reservas que impiden el mantenimiento
          reservations: {
            where: {
              status: { in: ["pendiente", "confirmada"] },
            },
          },
        },
      },
    },
    orderBy: {
      id: "asc", // Ordenar por número de habitación
    },
  })
}

/**
 * Obtiene todos los tipos de habitación (para los dropdowns y la nueva pestaña)
 */
export async function getRoomTypes(): Promise<RoomType[]> {
  return prisma.roomType.findMany({
    orderBy: { name: "asc" },
  })
}

/**
 * Crea una nueva habitación física.
 */
export async function createRoom(data: {
  id: string // N° de Habitación, ej: "101"
  roomTypeId: string
}): Promise<Room> {
  const { id, roomTypeId } = data

  if (!/^\d+$/.test(id)) {
    throw new Error("El número de habitación (ID) solo debe contener números.")
  }

  const floor = parseInt(id.charAt(0), 10)
  if (isNaN(floor) || floor < 1) {
    throw new Error("El número de habitación es inválido para calcular el piso.")
  }

  return prisma.room.create({
    data: {
      id: id,
      floor: floor,
      roomTypeId: roomTypeId,
      status: "disponible",
    },
  })
}

/**
 * Actualiza el tipo (RoomType) de una habitación física.
 */
export async function updateRoomType(id: string, roomTypeId: string) {
  return prisma.room.update({
    where: { id },
    data: { roomTypeId },
    include: {
      roomType: true,
      _count: {
        select: {
          reservations: {
            where: { status: { in: ["pendiente", "confirmada"] } },
          },
        },
      },
    },
  })
}

/**
 * (REEMPLAZA updateRoomStatus)
 * Actualiza el estado de una habitación de forma segura.
 * No permite poner en 'mantenimiento' si tiene reservas activas.
 */
export async function setRoomStatusSafe(id: string, status: RoomStatus) {
  if (status === "mantenimiento") {
    const activeReservations = await prisma.reservation.count({
      where: {
        roomId: id,
        status: { in: ["pendiente", "confirmada"] },
      },
    })

    if (activeReservations > 0) {
      throw new Error(
        "No se puede poner en mantenimiento. La habitación tiene reservas activas."
      )
    }
  }

  return prisma.room.update({
    where: { id },
    data: { status },
    include: {
      roomType: true,
      _count: {
        select: {
          reservations: {
            where: { status: { in: ["pendiente", "confirmada"] } },
          },
        },
      },
    },
  })
}

/**
 * Elimina una habitación física.
 * Falla si tiene reservas asociadas (protegido por la DB).
 */
export async function deleteRoom(id: string): Promise<Room> {
  try {
    return await prisma.room.delete({
      where: { id },
    })
  } catch (error: any) {
    if (error.code === "P2003") {
      throw new Error(
        "No se puede eliminar. La habitación tiene reservas asociadas."
      )
    }
    throw error
  }
}

/**
 * (NUEVO) Actualiza los detalles de un RoomType (precio, etc.)
 */
export async function updateRoomTypeDetails(id: string, data: RoomTypeInput) {
  return prisma.roomType.update({
    where: { id },
    data: {
      ...data,
      // Zod coerce se encarga de la conversión, pero aseguramos
      basePrice: data.basePrice,
      maxGuests: data.maxGuests,
    },
  })
}