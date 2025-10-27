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
 * (Esta función no necesita cambios)
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
 * (MODIFICADA) Actualiza el estado de una habitación con las reglas del Operador.
 */
export async function updateRoomStatus(
  id: string,
  newStatus: RoomStatus
): Promise<FullRoomOperador> {
  // --- INICIO DE NUEVA LÓGICA ---

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

  // --- FIN DE NUEVA LÓGICA ---

  // Regla 3: Lógica de negocio (la que ya tenías)
  if (newStatus === "mantenimiento") {
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

  // Si todo pasa, actualizar
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