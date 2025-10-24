import { NextResponse } from "next/server";
import { getConsultations } from "@/prisma/consultas-operador";

/**
 * GET /api/operador/consultas
 * Obtiene una lista de todas las consultas.
 */
export async function GET() {
  try {
    const consultations = await getConsultations();
    return NextResponse.json(consultations);
  } catch (error: any) {
    console.error("[API_CONSULTAS_GET] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener las consultas" },
      { status: 500 }
    );
  }
}

// Forzar revalidación
export const dynamic = "force-dynamic";
