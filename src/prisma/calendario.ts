import { prisma } from "@/lib/prisma";
import type { ReservationStatus } from "@prisma/client";

/**
 * Obtiene los datos necesarios para la grilla del calendario del operador.
 * Trae todas las habitaciones físicas y las reservas activas en un rango de fechas.
 */
export async function getCalendarData(startDate: Date, endDate: Date) {
  // 1. Obtener todas las habitaciones físicas, ordenadas por ID (ej: 101, 102, 201)
  const rooms = await prisma.room.findMany({
    orderBy: {
      id: "asc",
    },
    include: {
      roomType: {
        select: {
          name: true,
        },
      },
    },
  });

  // 2. Obtener todas las reservas que se superponen con el rango de fechas
  const reservations = await prisma.reservation.findMany({
    where: {
      status: {
        notIn: ["cancelada"],
      },
      checkInDate: {
        lt: endDate,
      },
      checkOutDate: {
        gt: startDate,
      },
    },
    include: {
      guests: {
        select: {
          name: true,
        },
        take: 1,
      },
      room: {
        select: {
          id: true,
        },
      },
    },
  });

  // 🔥 CORRECCIÓN: Convertir las fechas a formato ISO string SIN conversión de zona horaria
  // Prisma devuelve Date objects que pueden tener offset de zona horaria
  // Los convertimos a strings en formato ISO para que el frontend los parsee correctamente
  const reservationsFormatted = reservations.map((reservation) => ({
    ...reservation,
    // Convertimos a ISO string pero manteniendo la fecha local (sin offset UTC)
    checkInDate: formatDateToLocalISO(reservation.checkInDate),
    checkOutDate: formatDateToLocalISO(reservation.checkOutDate),
    roomId: reservation.room.id,
  }));

  return { rooms, reservations: reservationsFormatted };
}

/**
 * 🔥 Función auxiliar para convertir Date a ISO string sin offset de zona horaria
 * Esto evita que "2025-10-28T00:00:00.000Z" se muestre como "27 de octubre"
 */
function formatDateToLocalISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  // Formato: YYYY-MM-DDTHH:mm:ss (sin la Z del UTC)
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Cancela una reserva específica.
 */
export async function cancelReservationById(reservationId: string) {
  try {
    const updatedReservation = await prisma.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        status: "cancelada",
        cancelledAt: new Date(),
      },
    });

    // Actualizar la habitación física que estaba ocupada
    await prisma.room.update({
      where: {
        id: updatedReservation.roomId
      },
      data: {
        status: "disponible"
      }
    });

    return updatedReservation;

  } catch (error) {
    console.error("Error al cancelar la reserva:", error);
    throw new Error("No se pudo cancelar la reserva");
  }
}