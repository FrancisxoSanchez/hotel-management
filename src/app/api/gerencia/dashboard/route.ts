import { NextResponse } from "next/server";
// Corregido: Usar ruta relativa desde src/app/api/gerencia/dashboard/
import { getDashboardStats } from "@/prisma/gerencia";

/**
 * Manejador GET para obtener las estadísticas del dashboard de gerencia.
 *
 * NOTA DE SEGURIDAD: Esta ruta de API debería estar protegida
 * para asegurar que solo usuarios con rol 'gerencia' puedan acceder a ella.
 * La página está protegida en el cliente por el layout, pero la API
 * en sí misma sigue siendo accesible si se conoce la URL.
 */
export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error en API /api/gerencia/dashboard:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

