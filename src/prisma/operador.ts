// src/prisma/operador.ts

import { prisma } from "@/lib/prisma"
import type { Room, RoomType, RoomStatus } from "@prisma/client"

// Tipo extendido para el panel de operador
export type FullRoomOperador = Room & {
  roomType: RoomType
  _count: {
    reservations: number
  }
}

/**
 * Obtiene todas las habitaciones para la vista del operador.
 * Incluye el tipo y el conteo de reservas activas.
 */
export async function getRoomsForOperator(): Promise<FullRoomOperador[]> {
  return prisma.room.findMany({
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
 * Actualiza el estado de una habitación siguiendo las reglas del Operador.
 *
 * REGLAS:
 * 1. Operador SÓLO puede cambiar a 'disponible' o 'mantenimiento'.
 * 2. Operador SÓLO puede cambiar habitaciones que estén en 'disponible', 'limpieza' o 'mantenimiento'.
 * 3. NO se puede poner en 'mantenimiento' si hay reservas activas.
 */
export async function setRoomStatusOperador(
  id: string,
  newStatus: RoomStatus
): Promise<FullRoomOperador> {
  // Regla 1: El nuevo estado debe ser válido para el operador
  if (newStatus !== "disponible" && newStatus !== "mantenimiento") {
    throw new Error(
      "Operación no permitida. El operador solo puede cambiar estados a 'disponible' o 'mantenimiento'."
    )
  }

  // Obtener estado actual y reservas
  const room = await prisma.room.findUnique({
    where: { id },
    select: {
      status: true,
      _count: {
        select: {
          reservations: {
            where: { status: { in: ["pendiente", "confirmada"] } },
          },
        },
      },
    },
  })

  if (!room) {
    throw new Error("Habitación no encontrada.")
  }

  const currentStatus = room.status
  const activeReservations = room._count.reservations

  // Regla 2: El estado actual debe ser modificable por el operador
  const allowedCurrentStatus: RoomStatus[] = [
    "disponible",
    "limpieza",
    "mantenimiento",
  ]
  if (!allowedCurrentStatus.includes(currentStatus)) {
    throw new Error(
      `Operación no permitida. No se puede cambiar el estado de una habitación '${currentStatus}'.`
    )
  }

  // Regla 3: No poner en mantenimiento si hay reservas
  if (newStatus === "mantenimiento" && activeReservations > 0) {
    throw new Error(
      "No se puede poner en mantenimiento. La habitación tiene reservas activas."
    )
  }

  // Si todas las reglas pasan, actualizar
  return prisma.room.update({
    where: { id },
    data: { status: newStatus },
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