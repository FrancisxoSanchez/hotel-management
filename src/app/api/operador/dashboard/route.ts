import { NextResponse } from "next/server";
import { getDashboardData } from "@/prisma/dashboardop";

/**
 * GET /api/operador/dashboard
 * Obtiene todas las estadísticas y listas para el dashboard principal.
 */
export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API_DASHBOARD_GET] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener los datos del dashboard" },
      { status: 500 }
    );
  }
}

// Forzar revalidación para que los datos sean siempre frescos
export const dynamic = "force-dynamic";
