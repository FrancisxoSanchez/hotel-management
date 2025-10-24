// src/app/api/cliente/habitaciones/[id]/availability/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { checkAvailability } from '@/prisma/reserva';
import { z } from 'zod';

const querySchema = z.object({
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
});

/**
 * Endpoint para verificar disponibilidad de un tipo de habitación
 * GET /api/cliente/habitaciones/[id]/availability?checkIn=...&checkOut=...
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    // Validar parámetros
    const validation = querySchema.safeParse(query);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { checkIn, checkOut } = validation.data;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validar fechas básicas
    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'La fecha de salida debe ser posterior a la entrada' },
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

    // Verificar disponibilidad
    const result = await checkAvailability(id, checkInDate, checkOutDate);

    return NextResponse.json({
      success: true,
      roomTypeId: id,
      available: result.available,
      availableCount: result.count,
      roomType: {
        id: result.roomType.id,
        name: result.roomType.name,
        maxGuests: result.roomType.maxGuests,
        basePrice: result.roomType.basePrice,
      },
      dates: {
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
      },
    });

  } catch (error: any) {
    // --- MODIFICACIÓN PARA DEBUGGING ---
    // Imprime el error COMPLETO en la consola del SERVIDOR (tu terminal)
    console.error('[API_AVAILABILITY_ERROR_REAL]', error);
    // --- FIN DE MODIFICACIÓN ---

    if (error.message?.includes('no encontrado')) { //
      return NextResponse.json(
        { error: 'Habitación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error al verificar disponibilidad',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';