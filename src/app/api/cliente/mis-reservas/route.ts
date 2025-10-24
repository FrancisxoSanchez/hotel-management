// src/app/api/cliente/mis-reservas/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUserReservations, cancelReservation } from '@/prisma/mis-reservas';
import { z } from 'zod';

/**
 * GET - Obtiene todas las reservas del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    const reservations = await getUserReservations(userId);

    return NextResponse.json({
      success: true,
      count: reservations.length,
      data: reservations,
    });

  } catch (error: any) {
    console.error('[API_MIS_RESERVAS_GET]', error);
    
    return NextResponse.json(
      { 
        error: 'Error al obtener las reservas',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

const cancelSchema = z.object({
  reservationId: z.string().cuid(),
  userId: z.string().cuid(),
});

/**
 * PATCH - Cancela una reserva
 */
export async function PATCH(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // Validar datos
  const validation = cancelSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: validation.error.format() },
      { status: 400 }
    );
  }

  const { reservationId, userId } = validation.data;

  try {
    const cancelledReservation = await cancelReservation(reservationId, userId);

    return NextResponse.json({
      success: true,
      message: 'Reserva cancelada exitosamente',
      data: cancelledReservation,
    });

  } catch (error: any) {
    console.error('[API_CANCEL_RESERVATION]', error);

    // Errores específicos
    if (error.message.includes('no encontrada')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    if (error.message.includes('ya está cancelada') || 
        error.message.includes('No se puede cancelar')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error al cancelar la reserva',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';