// app/api/operador/habitaciones/route.ts

import { NextRequest, NextResponse } from "next/server"
import { getRoomsForOperator } from "@/prisma/operador"

/**
 * GET: Obtiene la lista de habitaciones para el panel de operador
 */
export async function GET(request: NextRequest) {
  try {
    const rooms = await getRoomsForOperator()
    return NextResponse.json({ rooms })
  } catch (error: any) {
    console.error("[API_OPERADOR_HABITACIONES_GET]", error)
    return NextResponse.json(
      { error: "Error al obtener habitaciones", message: error.message },
      { status: 500 }
    )
  }
}

export const dynamic = "force-dynamic"