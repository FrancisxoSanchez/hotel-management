// src/app/api/operador/checkin/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getTodayCheckins, confirmCheckin } from '@/prisma/checkin';
import { z } from 'zod';

/**
 * GET - Obtener todas las reservas con check-in para hoy
 */
export async function GET() {
  try {
    const reservations = await getTodayCheckins();

    // Separar por estado
    const pending = reservations.filter(r => r.status === 'pendiente');
    const confirmed = reservations.filter(r => r.status === 'confirmada');

    return NextResponse.json({
      success: true,
      data: {
        pending,
        confirmed,
        total: reservations.length,
      },
    });

  } catch (error: any) {
    console.error('[API_CHECKIN_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Error al obtener check-ins', details: error.message },
      { status: 500 }
    );
  }
}

const checkinSchema = z.object({
  reservationId: z.string().min(1, 'ID de reserva requerido'),
});

/**
 * POST - Confirmar check-in de una reserva
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar body
    const validation = checkinSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { reservationId } = validation.data;

    // Confirmar check-in (actualiza reserva y habitación)
    const updatedReservation = await confirmCheckin(reservationId);

    return NextResponse.json({
      success: true,
      message: 'Check-in confirmado exitosamente',
      data: {
        reservationId: updatedReservation.id,
        roomId: updatedReservation.roomId,
        status: updatedReservation.status,
        guestName: updatedReservation.guests[0]?.name,
      },
    });

  } catch (error: any) {
    console.error('[API_CHECKIN_POST_ERROR]', error);

    if (error.message.includes('no encontrada')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    if (error.message.includes('ya tiene estado') || error.message.includes('programadas para hoy')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al confirmar check-in', details: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';