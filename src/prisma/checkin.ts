// src/prisma/checkin.ts

import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

/**
 * Obtiene todas las reservas con check-in programado para hoy
 */
export async function getTodayCheckins() {
  const today = new Date();
  const startDate = startOfDay(today);
  const endDate = endOfDay(today);

  const reservations = await prisma.reservation.findMany({
    where: {
      checkInDate: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: ['pendiente', 'confirmada'],
      },
    },
    include: {
      room: {
        include: {
          roomType: {
            select: {
              id: true,
              name: true,
              images: true,
              maxGuests: true,
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
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      checkInDate: 'asc',
    },
  });

  return reservations;
}

/**
 * Confirma el check-in de una reserva
 * - Cambia el estado de la reserva a "confirmada"
 * - Cambia el estado de la habitación a "ocupada"
 */
export async function confirmCheckin(reservationId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Obtener la reserva
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
      include: {
        room: true,
      },
    });

    if (!reservation) {
      throw new Error("Reserva no encontrada");
    }

    // 2. Verificar que sea una reserva válida para check-in
    if (reservation.status !== 'pendiente') {
      throw new Error(`Esta reserva ya tiene estado: ${reservation.status}`);
    }

    const today = new Date();
    const checkInDate = new Date(reservation.checkInDate);
    checkInDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (checkInDate.getTime() !== today.getTime()) {
      throw new Error("Solo se puede hacer check-in de reservas programadas para hoy");
    }

    // 3. Actualizar reserva a confirmada
    const updatedReservation = await tx.reservation.update({
      where: { id: reservationId },
      data: {
        status: 'confirmada',
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        guests: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 4. Actualizar habitación a ocupada
    await tx.room.update({
      where: { id: reservation.roomId },
      data: {
        status: 'ocupada',
      },
    });

    return updatedReservation;
  });
}

/**
 * Obtiene una reserva específica con todos sus detalles
 */
export async function getReservationDetails(reservationId: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      room: {
        include: {
          roomType: true,
        },
      },
      guests: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!reservation) {
    throw new Error("Reserva no encontrada");
  }

  return reservation;
}