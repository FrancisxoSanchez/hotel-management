import { NextRequest, NextResponse } from "next/server"
import {
  updateRoomType,
  setRoomStatusSafe, // ✅ Cambiado de updateRoomStatus a setRoomStatusSafe
  deleteRoom,
} from "@/prisma/gerencia-habitaciones"
import { RoomStatus } from "@prisma/client"
import { z } from "zod"

const updateTypeSchema = z.object({
  roomTypeId: z.string().min(1, "Tipo de habitación inválido"),
})

const updateStatusSchema = z.object({
  status: z.nativeEnum(RoomStatus),
})

// --- PUT: cambiar tipo de habitación ---
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const validation = updateTypeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.format() },
        { status: 400 }
      )
    }

    const updatedRoom = await updateRoomType(id, validation.data.roomTypeId)
    return NextResponse.json({ success: true, room: updatedRoom })
  } catch (error: any) {
    console.error("[API_HABITACION_PUT]", error)
    return NextResponse.json(
      { error: "Error al actualizar la habitación", message: error.message },
      { status: 500 }
    )
  }
}

// --- PATCH: cambiar estado ---
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const validation = updateStatusSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Estado inválido", details: validation.error.format() },
        { status: 400 }
      )
    }

    // ✅ Usamos setRoomStatusSafe en lugar de updateRoomStatus
    const updatedRoom = await setRoomStatusSafe(id, validation.data.status)
    return NextResponse.json({ success: true, room: updatedRoom })
  } catch (error: any) {
    console.error("[API_HABITACION_PATCH]", error)
    
    // ✅ Manejamos el error específico de reservas activas
    if (error.message.includes("reservas activas")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 } // Conflict
      )
    }
    
    return NextResponse.json(
      { error: "Error al actualizar el estado", message: error.message },
      { status: 500 }
    )
  }
}

// --- DELETE: eliminar habitación ---
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    await deleteRoom(id)
    return NextResponse.json({ success: true, message: "Habitación eliminada" })
  } catch (error: any) {
    console.error("[API_HABITACION_DELETE]", error)
    return NextResponse.json(
      { error: "Error al eliminar la habitación", message: error.message },
      { status: 500 }
    )
  }
}

export const dynamic = "force-dynamic"