// src/prisma/operador-habitaciones.ts

import { prisma } from "@/lib/prisma"
import type { Room, RoomType, RoomStatus } from "@prisma/client"

// Definimos un tipo extendido que incluye la relación y el conteo
export type FullRoomOperador = Room & {
  roomType: RoomType
  _count: {
    reservations: number
  }
}

/**
 * Obtiene todas las habitaciones físicas con su tipo y conteo de reservas activas.
 */
export async function getRoomsWithTypes(): Promise<FullRoomOperador[]> {
  return prisma.room.findMany({
    include: {
      roomType: true,
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
      id: "asc",
    },
  })
}

/**
 * Actualiza el estado de una habitación con las reglas del Operador.
 * Si se cambia a 'mantenimiento', cancela automáticamente las reservas activas.
 */
export async function updateRoomStatus(
  id: string,
  newStatus: RoomStatus
): Promise<FullRoomOperador> {
  // Regla 1: Validar el estado de DESTINO (solo 'disponible' o 'mantenimiento')
  if (newStatus !== "disponible" && newStatus !== "mantenimiento") {
    throw new Error(
      "Operación no permitida. El operador solo puede cambiar estados a 'disponible' o 'mantenimiento'."
    )
  }

  // Obtener el estado actual
  const room = await prisma.room.findUnique({
    where: { id },
    select: { status: true },
  })

  if (!room) {
    throw new Error("Habitación no encontrada.")
  }

  const currentStatus = room.status

  // Regla 2: Validar el estado de ORIGEN (solo 'disponible', 'limpieza' o 'mantenimiento')
  const allowedSourceStatus: RoomStatus[] = [
    "disponible",
    "limpieza",
    "mantenimiento",
  ]
  if (!allowedSourceStatus.includes(currentStatus)) {
    throw new Error(
      `Operación no permitida. No se puede cambiar el estado de una habitación '${currentStatus}'.`
    )
  }

  // 🔥 NUEVA LÓGICA: Si se pone en mantenimiento, cancelar reservas activas
  if (newStatus === "mantenimiento") {
    const activeReservations = await prisma.reservation.findMany({
      where: {
        roomId: id,
        status: { in: ["pendiente", "confirmada"] },
      },
      select: { id: true },
    })

    if (activeReservations.length > 0) {
      // Cancelar todas las reservas activas en una transacción
      await prisma.reservation.updateMany({
        where: {
          roomId: id,
          status: { in: ["pendiente", "confirmada"] },
        },
        data: {
          status: "cancelada",
          cancelledAt: new Date(),
        },
      })

      console.log(
        `[OPERADOR] Se cancelaron ${activeReservations.length} reserva(s) de la habitación ${id} por mantenimiento.`
      )
    }
  }

  // Actualizar el estado de la habitación
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