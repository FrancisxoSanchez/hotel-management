// app/api/gerencia/habitaciones/route.ts

import { NextRequest, NextResponse } from "next/server"
import { createRoom, getRooms } from "@/prisma/gerencia-habitaciones"
import { z } from "zod"

// --- Esquemas de validación ---
const createRoomSchema = z.object({
  id: z.string().min(1, "El número de habitación es requerido"),
  roomTypeId: z.string().min(1, "El tipo de habitación es requerido"),
})

// --- GET: lista habitaciones ---
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const floorParam = searchParams.get("floor")
    const roomTypeId = searchParams.get("roomTypeId") || undefined

    const floor = floorParam ? parseInt(floorParam) : undefined
    const rooms = await getRooms({ floor, roomTypeId })

    // Ya no devuelve roomTypes, eso se pide a /api/gerencia/room-types
    return NextResponse.json({ rooms })
  } catch (error: any) {
    console.error("[API_HABITACIONES_GET]", error)
    return NextResponse.json(
      { error: "Error al obtener habitaciones", message: error.message },
      { status: 500 }
    )
  }
}

// --- POST: crear habitación ---
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = createRoomSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.format() },
        { status: 400 }
      )
    }

    const { id, roomTypeId } = validation.data
    const room = await createRoom({ id, roomTypeId })

    return NextResponse.json({ success: true, room })
  } catch (error: any) {
    console.error("[API_HABITACIONES_POST]", error)
    // Manejo de error específico para ID duplicado
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: `Ya existe una habitación con el número ingresado.` },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Error al crear la habitación", message: error.message },
      { status: 500 }
    )
  }
}

export const dynamic = "force-dynamic"