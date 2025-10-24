import { NextRequest, NextResponse } from "next/server";
import { cancelReservationById } from "@/prisma/calendario";

/**
 * POST /api/operador/reservas/[id]/cancelar
 * Marca una reserva como "cancelada"
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // El tipo ya nos dice que es una Promesa
) {
  try {
    // --- AQUÍ ESTÁ EL ARREGLO ---
    // 'context.params' es una promesa, necesitamos 'await' para resolverla
    const params = await context.params;
    const { id } = params;
    // const { id } = context.params; // [Línea 13 original, incorrecta]
    // --- FIN DEL ARREGLO ---

    if (!id) {
      return NextResponse.json(
        { error: "ID de reserva requerido" },
        { status: 400 }
      );
    }

    const updatedReservation = await cancelReservationById(id);

    return NextResponse.json({
      success: true,
      message: "Reserva cancelada exitosamente",
      reservation: updatedReservation,
    });

  } catch (error: any) {
    console.error("[API_RESERVA_CANCELAR_POST] Error:", error);
    
    if (error.message.includes("No se pudo")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Error al cancelar la reserva" },
      { status: 500 }
    );
  }
}

