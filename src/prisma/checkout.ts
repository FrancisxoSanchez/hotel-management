// src/prisma/checkout.ts

import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

/**
 * Obtiene todas las reservas con check-out programado para hoy
 */
export async function getTodayCheckouts() {
  const today = new Date();
  const startDate = startOfDay(today);
  const endDate = endOfDay(today);

  const reservations = await prisma.reservation.findMany({
    where: {
      checkOutDate: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: ['confirmada', 'finalizada'],
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
      checkOutDate: 'asc',
    },
  });

  return reservations;
}

/**
 * Confirma el check-out de una reserva
 * - Cambia el estado de la reserva a "finalizada"
 * - Cambia el estado de la habitación a "limpieza" (lista para ser preparada)
 */
export async function confirmCheckout(reservationId: string) {
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

    // 2. Verificar que sea una reserva válida para check-out
    if (reservation.status === 'finalizada') {
      throw new Error("Esta reserva ya fue finalizada");
    }

    if (reservation.status !== 'confirmada') {
      throw new Error(`Esta reserva tiene estado: ${reservation.status}. Solo se puede hacer check-out de reservas confirmadas`);
    }

    const today = new Date();
    const checkOutDate = new Date(reservation.checkOutDate);
    checkOutDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (checkOutDate.getTime() !== today.getTime()) {
      throw new Error("Solo se puede hacer check-out de reservas programadas para hoy");
    }

    // 3. Actualizar reserva a finalizada
    const updatedReservation = await tx.reservation.update({
      where: { id: reservationId },
      data: {
        status: 'finalizada',
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

    // 4. Actualizar habitación a limpieza (lista para ser preparada para el siguiente huésped)
    await tx.room.update({
      where: { id: reservation.roomId },
      data: {
        status: 'limpieza',
      },
    });

    return updatedReservation;
  });
}