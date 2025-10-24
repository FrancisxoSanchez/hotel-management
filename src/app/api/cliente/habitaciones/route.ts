import { NextRequest, NextResponse } from 'next/server';
import { findAvailableRooms } from '@/prisma/habitacion';
import { z } from 'zod';

// Esquema para validar los parámetros de la URL
const querySchema = z.object({
  checkIn: z.string().datetime().optional(),
  checkOut: z.string().datetime().optional(),
  guests: z.string().optional().default('1'),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = Object.fromEntries(searchParams.entries());

  // 1. Validar los parámetros
  const validation = querySchema.safeParse(query);

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', details: validation.error.format() },
      { status: 400 }
    );
  }

  let { checkIn, checkOut, guests } = validation.data;
  
  // 2. Procesar los parámetros validados
  let guestCount: number;
  if (guests === 'all' || !guests) {
    guestCount = 1; 
  } else {
    guestCount = parseInt(guests, 10);
    if (isNaN(guestCount) || guestCount < 1) {
      guestCount = 1;
    }
  }

  const checkInDate = checkIn ? new Date(checkIn) : undefined;
  const checkOutDate = checkOut ? new Date(checkOut) : undefined;

  // Validación de que si viene una fecha, venga la otra
  if ((checkInDate && !checkOutDate) || (!checkInDate && checkOutDate)) {
    return NextResponse.json(
      { error: 'Debe proveer ambas fechas (entrada y salida)' },
      { status: 400 }
    );
  }

  // Validación adicional de fechas
  if (checkInDate && checkOutDate) {
    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'La fecha de salida debe ser posterior a la de entrada' },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkInDate < today) {
      return NextResponse.json(
        { error: 'La fecha de entrada no puede ser en el pasado' },
        { status: 400 }
      );
    }
  }
  
  // 3. Llamar a la lógica de Prisma
  try {
    const rooms = await findAvailableRooms(guestCount, checkInDate, checkOutDate);
    
    return NextResponse.json({
      success: true,
      count: rooms.length,
      data: rooms,
      filters: {
        guests: guestCount,
        checkIn: checkInDate?.toISOString(),
        checkOut: checkOutDate?.toISOString(),
      },
    });

  } catch (error: any) {
    console.error('[API_ROOMS_GET] Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';