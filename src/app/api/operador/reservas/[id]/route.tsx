import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET - Obtiene los detalles completos de una reserva
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            roomType: {
              select: {
                name: true,
                images: true,
                basePrice: true,
                maxGuests: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        guests: {
          select: {
            id: true,
            name: true,
            dni: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ reservation });
  } catch (error: any) {
    console.error("[API_RESERVATION_DETAIL_GET]", error);
    return NextResponse.json(
      { error: "Error al obtener los detalles de la reserva" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";