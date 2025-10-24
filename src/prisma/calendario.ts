import { prisma } from "@/lib/prisma";
import type { ReservationStatus } from "@prisma/client";

/**
 * Obtiene los datos necesarios para la grilla del calendario del operador.
 * Trae todas las habitaciones físicas y las reservas activas en un rango de fechas.
 */
export async function getCalendarData(startDate: Date, endDate: Date) {
  // 1. Obtener todas las habitaciones físicas, ordenadas por ID (ej: 101, 102, 201)
  // Incluimos el nombre del "tipo" de habitación para poder mostrarlas
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
  // y que no estén canceladas.
  const reservations = await prisma.reservation.findMany({
    where: {
      status: {
        notIn: ["cancelada"], // Omitimos reservas ya canceladas
      },
      // Lógica de superposición:
      // La reserva comienza ANTES de que termine el rango Y
      // la reserva termina DESPUÉS de que comience el rango.
      checkInDate: {
        lt: endDate,
      },
      checkOutDate: {
        gt: startDate,
      },
    },
    include: {
      // Traemos el primer huésped para mostrar su nombre
      guests: {
        select: {
          name: true,
        },
        take: 1,
      },
      // Traemos la habitación para saber su ID
      room: {
        select: {
          id: true,
        },
      },
    },
  });

  return { rooms, reservations };
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
        // Opcionalmente: actualizar estado de la habitación si es necesario
        // Esto depende de tu lógica de negocio (ej: si pasa a "limpieza")
        // room: {
        //   update: {
        //     status: "limpieza" 
        //   }
        // }
      },
    });

    // También debemos actualizar la habitación física que estaba 'ocupada'
    await prisma.room.update({
      where: {
        id: updatedReservation.roomId
      },
      data: {
        status: "disponible" // o "limpieza"
      }
    });

    return updatedReservation;

  } catch (error) {
    console.error("Error al cancelar la reserva:", error);
    throw new Error("No se pudo cancelar la reserva");
  }
}
