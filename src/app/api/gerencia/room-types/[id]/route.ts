// app/api/gerencia/room-types/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"
import {
  updateRoomTypeDetails,
  roomTypeSchema,
} from "@/prisma/gerencia-habitaciones"
import { z } from "zod"

/**
 * PATCH: Actualiza los detalles de un RoomType (precio, capacidad, etc.)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // Validar el body con el schema de Zod
    const validation = roomTypeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.format() },
        { status: 400 }
      )
    }

    const updatedRoomType = await updateRoomTypeDetails(id, validation.data)
    return NextResponse.json({ success: true, roomType: updatedRoomType })
  } catch (error: any) {
    console.error("[API_ROOM_TYPES_PATCH]", error)
    return NextResponse.json(
      { error: "Error al actualizar el tipo de habitación", message: error.message },
      { status: 500 }
    )
  }
}

export const dynamic = "force-dynamic"