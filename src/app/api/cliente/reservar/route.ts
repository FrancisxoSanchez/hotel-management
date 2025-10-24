// src/app/api/cliente/reservar/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createReservation } from "@/prisma/reserva";

// Esquema de validación para los huéspedes
const guestSchema = z.object({
  name: z.string().min(3, "Nombre de huésped requerido"),
  dni: z.string().min(5, "DNI/Pasaporte de huésped requerido"),
  email: z.string().email("Email de huésped inválido"),
  phone: z.string().min(5, "Teléfono de huésped requerido"),
});

// Esquema de validación para el cuerpo (body) de la reserva
// Esquema de validación para el cuerpo (body) de la reserva
const reservationSchema = z.object({
  // --- CAMBIO AQUÍ ---
  // Acepta cualquier string de al menos 1 caracter, no solo CUIDs
  userId: z.string().min(1, "ID de usuario inválido"),
  roomTypeId: z.string().min(1, "ID de tipo de habitación inválido"),

  // --- FIN DEL CAMBIO ---
  
  checkIn: z.string().datetime("Fecha Check-in inválida"),
  checkOut: z.string().datetime("Fecha Check-out inválida"),
  guests: z.array(guestSchema).min(1, "Se requiere al menos un huésped"),
  includesBreakfast: z.boolean(),
  includesSpa: z.boolean(),
  totalPrice: z.number().positive("Precio total inválido"),
});

/**
 * Handler POST para crear una nueva reserva con asignación automática de habitación
 */
export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // 1. Validar el body
  const validation = reservationSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Datos de reserva inválidos", details: validation.error.format() },
      { status: 400 }
    );
  }

  const data = validation.data;

  // 2. Validar lógica de fechas
  const checkInDate = new Date(data.checkIn);
  const checkOutDate = new Date(data.checkOut);

  if (checkOutDate <= checkInDate) {
    return NextResponse.json(
      { error: "La fecha de salida debe ser posterior a la de entrada" },
      { status: 400 }
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (checkInDate < today) {
    return NextResponse.json(
      { error: "La fecha de entrada no puede ser en el pasado" },
      { status: 400 }
    );
  }

  // 3. Llamar a la lógica de Prisma (asigna automáticamente una habitación)
  try {
    const newReservation = await createReservation({
      ...data,
      checkIn: checkInDate,
      checkOut: checkOutDate,
    });

    // Éxito - incluir información de la habitación asignada
    return NextResponse.json({
      success: true,
      reservation: {
        id: newReservation.id,
        roomId: newReservation.roomId,
        status: newReservation.status,
        totalPrice: newReservation.totalPrice,
        checkInDate: newReservation.checkInDate,
        checkOutDate: newReservation.checkOutDate,
      },
      message: "Reserva creada exitosamente",
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("[API_RESERVAR_POST_ERROR]", error.message);
    
    // Manejar errores específicos de la lógica de negocio
    if (error.message.includes("No hay habitaciones")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    if (error.message.includes("precio") || error.message.includes("capacidad")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    if (error.message.includes("no existe") || error.message.includes("no está disponible")) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    // Error genérico
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";