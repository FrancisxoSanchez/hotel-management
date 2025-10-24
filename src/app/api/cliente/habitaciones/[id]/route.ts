import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Obtiene un tipo de habitación específico por ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    const roomType = await prisma.roomType.findFirst({
      where: {
        id: id,
        isActive: true,
      },
      include: {
        rooms: {
          where: {
            status: {
              in: ['disponible', 'limpieza'],
            },
          },
          select: {
            id: true,
            floor: true,
            status: true,
          },
        },
      },
    });

    if (!roomType) {
      return NextResponse.json(
        { error: 'Habitación no encontrada o no disponible' },
        { status: 404 }
      );
    }

    // Agregar conteo de habitaciones disponibles
    const response = {
      ...roomType,
      totalRooms: roomType.rooms.length,
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[API_ROOM_GET] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al obtener la habitación',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';