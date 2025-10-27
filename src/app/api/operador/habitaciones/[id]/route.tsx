// app/api/operador/habitaciones/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"
import { updateRoomStatus } from "@/prisma/operador-habitaciones"
import { RoomStatus } from "@prisma/client"
import { z } from "zod"

// Esquema modificado: solo permite los estados de destino del operador
const updateStatusSchema = z.object({
  status: z.enum(["disponible", "mantenimiento"], {
    errorMap: () => ({
      message:
        "Estado inválido. Solo se permite 'disponible' o 'mantenimiento'.",
    }),
  }),
})

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // Validar el estado de DESTINO
    const validation = updateStatusSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.format() },
        { status: 400 }
      )
    }

    // updateRoomStatus ahora valida el estado de ORIGEN y las reservas
    const updatedRoom = await updateRoomStatus(id, validation.data.status)
    return NextResponse.json({ success: true, room: updatedRoom })
  } catch (error: any) {
    console.error("[API_HABITACION_PATCH]", error)

    // Capturar errores de la lógica de negocio (Regla de Origen)
    if (error.message.includes("Operación no permitida")) {
      return NextResponse.json(
        { error: "Acción no permitida", message: error.message },
        { status: 403 } // 403 Forbidden
      )
    }
    // Capturar errores de la lógica de negocio (Regla de Reservas)
    if (error.message.includes("reservas activas")) {
      return NextResponse.json(
        { error: "Conflicto", message: error.message },
        { status: 409 } // 409 Conflict
      )
    }

    return NextResponse.json(
      { error: "Error al actualizar el estado", message: error.message },
      { status: 500 }
    )
  }
}