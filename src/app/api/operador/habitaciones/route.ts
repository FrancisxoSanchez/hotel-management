// src/app/api/operador/habitaciones/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET - Obtener todas las habitaciones físicas con su tipo
 */
export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            maxGuests: true,
            images: true,
            isActive: true,
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
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      rooms: rooms.map(room => ({
        id: room.id,
        floor: room.floor,
        status: room.status,
        roomType: room.roomType,
        activeReservations: room._count.reservations,
      })),
    });

  } catch (error: any) {
    console.error('[API_ROOMS_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Error al obtener habitaciones', details: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';