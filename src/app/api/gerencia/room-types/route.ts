// app/api/gerencia/room-types/route.ts

import { NextRequest, NextResponse } from "next/server"
import { getRoomTypes } from "@/prisma/gerencia-habitaciones"

/**
 * GET: Obtiene todos los tipos de habitación
 */
export async function GET(request: NextRequest) {
  try {
    const roomTypes = await getRoomTypes()
    return NextResponse.json(roomTypes)
  } catch (error: any) {
    console.error("[API_ROOM_TYPES_GET]", error)
    return NextResponse.json(
      { error: "Error al obtener los tipos de habitación", message: error.message },
      { status: 500 }
    )
  }
}

export const dynamic = "force-dynamic"