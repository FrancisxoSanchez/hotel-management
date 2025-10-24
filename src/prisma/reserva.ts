// src/prisma/reserva.ts

import { prisma } from "@/lib/prisma";
import {
  BREAKFAST_PRICE_PER_NIGHT_PER_GUEST,
  SPA_PRICE_PER_GUEST,
} from "@/lib/constant";
import { calculateNights } from "@/lib/date-utils";
import { findAvailableRoomForType } from "./habitacion";
import type { Reservation } from "@prisma/client";

interface GuestInput {
  name: string;
  dni: string;
  email: string;
  phone: string;
}

interface CreateReservationInput {
  userId: string;
  roomTypeId: string;
  checkIn: Date;
  checkOut: Date;
  guests: GuestInput[];
  includesBreakfast: boolean;
  includesSpa: boolean;
  totalPrice: number;
}

/**
 * Crea una nueva reserva asignando una habitación física específica
 * IMPORTANTE: NO cambia el estado de la habitación. 
 * El estado solo se usa para mantenimiento/limpieza.
 * La disponibilidad se determina por las reservas activas.
 */
export async function createReservation(
  input: CreateReservationInput
): Promise<Reservation> {
  const {
    userId,
    roomTypeId,
    checkIn,
    checkOut,
    guests,
    includesBreakfast,
    includesSpa,
    totalPrice,
  } = input;

  // Validaciones básicas
  if (guests.length === 0) {
    throw new Error("Debe incluir al menos un huésped");
  }

  // Usar una transacción para garantizar consistencia
  return await prisma.$transaction(async (tx) => {
    // 1. Obtener tipo de habitación
    const roomType = await tx.roomType.findUnique({
      where: { id: roomTypeId },
    });

    if (!roomType || !roomType.isActive) {
      throw new Error("El tipo de habitación no existe o no está disponible");
    }

    // 2. Validar capacidad de huéspedes
    if (guests.length > roomType.maxGuests) {
      throw new Error(
        `Esta habitación admite máximo ${roomType.maxGuests} huéspedes`
      );
    }

    // 3. Buscar una habitación disponible de este tipo
    const availableRoomId = await findAvailableRoomForType(
      roomTypeId,
      checkIn,
      checkOut,
    );

    if (!availableRoomId) {
      throw new Error(
        "No hay habitaciones disponibles para las fechas seleccionadas"
      );
    }

    // 4. Calcular y validar precio
    const nights = calculateNights(checkIn, checkOut);
    const guestCount = guests.length;

    const baseRoomPrice = roomType.basePrice * nights;
    const breakfastPrice = includesBreakfast
      ? BREAKFAST_PRICE_PER_NIGHT_PER_GUEST * nights * guestCount
      : 0;
    const spaPrice = includesSpa ? SPA_PRICE_PER_GUEST * guestCount : 0;
    const calculatedTotal = baseRoomPrice + breakfastPrice + spaPrice;

    // Validar con tolerancia para decimales
    if (Math.abs(calculatedTotal - totalPrice) > 0.01) {
      console.warn(
        `[PRICE_MISMATCH] Expected: ${calculatedTotal}, Received: ${totalPrice}`
      );
      throw new Error(
        "El precio calculado no coincide. Por favor, recargue la página e intente nuevamente."
      );
    }

    // 5. Preparar conexiones de huéspedes
    const guestConnections = guests.map((guest) => ({
      where: { dni: guest.dni },
      create: {
        name: guest.name,
        dni: guest.dni,
        email: guest.email,
        phone: guest.phone,
      },
    }));

    // 6. Crear la reserva vinculada a la habitación física
    const newReservation = await tx.reservation.create({
      data: {
        checkInDate: checkIn,
        checkOutDate: checkOut,
        status: "pendiente",
        totalPrice: calculatedTotal,
        depositPaid: calculatedTotal,
        includesBreakfast: includesBreakfast,
        includesSpa: includesSpa,
        room: {
          connect: { id: availableRoomId },
        },
        user: {
          connect: { id: userId },
        },
        guests: {
          connectOrCreate: guestConnections,
        },
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

    // 7. NO ACTUALIZAMOS EL ESTADO DE LA HABITACIÓN
    // El estado de la habitación (disponible/ocupada/mantenimiento/limpieza)
    // es independiente de las reservas y solo se usa para gestión operativa
    // La disponibilidad se calcula en tiempo real basada en las reservas activas

    return newReservation;
  });
}

/**
 * Verifica disponibilidad para un tipo de habitación
 */
export async function checkAvailability(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date
): Promise<{ available: boolean; count: number; roomType: any }> {
  const roomType = await prisma.roomType.findFirst({ 
    where: { id: roomTypeId },
    include: {
      rooms: {
        where: {
          status: {
            in: ['disponible', 'limpieza'],
          },
        },
      },
    },
  });

  if (!roomType || !roomType.isActive) {
    throw new Error("Tipo de habitación no encontrado");
  }

  const allRoomIds = roomType.rooms.map(r => r.id);

  if (allRoomIds.length === 0) {
    return {
      available: false,
      count: 0,
      roomType,
    };
  }

  // Contar habitaciones reservadas en el período
  const reservedRooms = await prisma.reservation.findMany({
    where: {
      roomId: {
        in: allRoomIds,
      },
      status: {
        in: ["pendiente", "confirmada"],
      },
      checkInDate: {
        lt: checkOut,
      },
      checkOutDate: {
        gt: checkIn,
      },
    },
    select: {
      roomId: true,
    },
  });

  const reservedIds = new Set(reservedRooms.map(r => r.roomId));
  const availableCount = allRoomIds.filter(id => !reservedIds.has(id)).length;

  return {
    available: availableCount > 0,
    count: availableCount,
    roomType,
  };
}