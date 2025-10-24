// src/prisma/gerencia-habitaciones.ts

import { prisma } from "@/lib/prisma"
import type { Room, RoomType, RoomStatus } from "@prisma/client"

// Definimos un tipo extendido que incluye la relación
export type FullRoom = Room & {
  roomType: RoomType
}

interface RoomFilters {
  floor?: number
  roomTypeId?: string
}

/**
 * Obtiene todas las habitaciones físicas con su tipo, aplicando filtros.
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
    },
    orderBy: {
      id: "asc", // Ordenar por número de habitación
    },
  })
}

/**
 * Obtiene todos los tipos de habitación (para los dropdowns de filtros y modales)
 */
export async function getRoomTypes(): Promise<RoomType[]> {
  return prisma.roomType.findMany({
    where: { isActive: true },
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

  // Validar que el ID sea numérico (aunque sea string)
  if (!/^\d+$/.test(id)) {
    throw new Error("El número de habitación (ID) solo debe contener números.")
  }

  // Calcular el piso desde el ID
  const floor = parseInt(id.charAt(0), 10)
  if (isNaN(floor) || floor < 1) {
    throw new Error("El número de habitación es inválido para calcular el piso.")
  }

  return prisma.room.create({
    data: {
      id: id,
      floor: floor,
      roomTypeId: roomTypeId,
      status: "disponible", // Por defecto
    },
  })
}

export async function updateRoomType(id: string, roomTypeId: string) {
  return prisma.room.update({
    where: { id },
    data: { roomTypeId },
    include: { roomType: true },
  })
}

export async function updateRoomStatus(id: string, status: RoomStatus) {
  return prisma.room.update({
    where: { id },
    data: { status },
    include: { roomType: true },
  })
}


/**
 * Elimina una habitación física.
 * Advertencia: fallará si tiene reservas asociadas.
 */
export async function deleteRoom(id: string): Promise<Room> {
  try {
    return await prisma.room.delete({
      where: { id },
    })
  } catch (error: any) {
    if (error.code === "P2003") {
      // Error de foreign key
      throw new Error(
        "No se puede eliminar. La habitación tiene reservas asociadas."
      )
    }
    throw error
  }
}
