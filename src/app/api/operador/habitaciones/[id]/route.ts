// src/app/api/operador/habitaciones/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['disponible', 'ocupada', 'mantenimiento', 'limpieza']),
});

/**
 * PATCH - Actualizar estado de una habitación
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();

    // Validar body
    const validation = updateStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Estado inválido', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { status } = validation.data;

    // Verificar que la habitación existe
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        roomType: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            reservations: {
              where: {
                status: {
                  in: ['pendiente', 'confirmada'],
                },
                checkOutDate: {
                  gte: new Date(),
                },
              },
            },
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Habitación no encontrada' },
        { status: 404 }
      );
    }

    // Advertencia si tiene reservas activas
    if (room._count.reservations > 0 && status === 'mantenimiento') {
      return NextResponse.json(
        {
          error: 'Habitación con reservas activas',
          message: `Esta habitación tiene ${room._count.reservations} reserva(s) activa(s). No se puede poner en mantenimiento.`,
        },
        { status: 409 }
      );
    }

    // Actualizar estado
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: { status },
      include: {
        roomType: {
          select: {
            name: true,
            basePrice: true,
            maxGuests: true,
            images: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      room: updatedRoom,
      message: `Habitación ${id} actualizada a ${status}`,
    });

  } catch (error: any) {
    console.error('[API_ROOM_UPDATE_ERROR]', error);
    return NextResponse.json(
      { error: 'Error al actualizar habitación', details: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';