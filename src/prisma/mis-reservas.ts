// src/prisma/mis-reservas.ts

import { prisma } from "@/lib/prisma";

/**
 * Obtiene todas las reservas de un usuario
 */
export async function getUserReservations(userId: string) {
  return await prisma.reservation.findMany({
    where: {
      userId: userId,
    },
    include: {
      room: {
        include: {
          roomType: {
            select: {
              name: true,
              images: true,
            },
          },
        },
      },
      guests: {
        select: {
          id: true,
          name: true,
          dni: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Cancela una reserva (solo si está pendiente o confirmada y el check-in no ha pasado)
 */
export async function cancelReservation(reservationId: string, userId: string) {
  // Verificar que la reserva existe y pertenece al usuario
  const reservation = await prisma.reservation.findFirst({
    where: {
      id: reservationId,
      userId: userId,
    },
    include: {
      room: true,
    },
  });

  if (!reservation) {
    throw new Error("Reserva no encontrada o no pertenece a este usuario");
  }

  if (reservation.status === "cancelada") {
    throw new Error("La reserva ya está cancelada");
  }

  if (reservation.status === "finalizada") {
    throw new Error("No se puede cancelar una reserva finalizada");
  }

  // Verificar que la fecha de check-in no haya pasado
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkInDate = new Date(reservation.checkInDate);
  checkInDate.setHours(0, 0, 0, 0);
  
  if (checkInDate < today) {
    throw new Error("No se puede cancelar una reserva cuyo check-in ya pasó");
  }

  // Usar transacción para cancelar y liberar la habitación
  return await prisma.$transaction(async (tx) => {
    // Actualizar estado de la reserva
    const updatedReservation = await tx.reservation.update({
      where: { id: reservationId },
      data: {
        status: "cancelada",
        cancelledAt: new Date(),
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        guests: true,
      },
    });

    // Liberar la habitación solo si estaba ocupada por esta reserva
    // (No liberar si hay otras reservas activas)
    const otherActiveReservations = await tx.reservation.count({
      where: {
        roomId: reservation.roomId,
        status: { in: ["pendiente", "confirmada"] },
        id: { not: reservationId }, // Excluir la que estamos cancelando
      },
    });

    // Solo liberar si no hay otras reservas activas
    if (otherActiveReservations === 0) {
      await tx.room.update({
        where: { id: reservation.roomId },
        data: { status: "disponible" },
      });
    }

    return updatedReservation;
  });
}