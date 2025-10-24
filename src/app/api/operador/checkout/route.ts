// src/app/api/operador/checkout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getTodayCheckouts, confirmCheckout } from '@/prisma/checkout';
import { z } from 'zod';

/**
 * GET - Obtener todas las reservas con check-out para hoy
 */
export async function GET() {
  try {
    const reservations = await getTodayCheckouts();

    // Separar por estado
    const pending = reservations.filter(r => r.status === 'confirmada');
    const completed = reservations.filter(r => r.status === 'finalizada');

    return NextResponse.json({
      success: true,
      data: {
        pending,
        completed,
        total: reservations.length,
      },
    });

  } catch (error: any) {
    console.error('[API_CHECKOUT_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Error al obtener check-outs', details: error.message },
      { status: 500 }
    );
  }
}

const checkoutSchema = z.object({
  reservationId: z.string().min(1, 'ID de reserva requerido'),
});

/**
 * POST - Confirmar check-out de una reserva
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar body
    const validation = checkoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { reservationId } = validation.data;

    // Confirmar check-out (actualiza reserva y habitación)
    const updatedReservation = await confirmCheckout(reservationId);

    return NextResponse.json({
      success: true,
      message: 'Check-out confirmado exitosamente',
      data: {
        reservationId: updatedReservation.id,
        roomId: updatedReservation.roomId,
        status: updatedReservation.status,
        guestName: updatedReservation.guests[0]?.name,
      },
    });

  } catch (error: any) {
    console.error('[API_CHECKOUT_POST_ERROR]', error);

    if (error.message.includes('no encontrada')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    if (
      error.message.includes('ya fue finalizada') || 
      error.message.includes('tiene estado') || 
      error.message.includes('programadas para hoy')
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al confirmar check-out', details: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';