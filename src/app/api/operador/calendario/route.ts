import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCalendarData } from "@/prisma/calendario";

// Esquema de validación para los query params
const querySchema = z.object({
  startDate: z.string().datetime("Fecha de inicio inválida"),
  endDate: z.string().datetime("Fecha de fin inválida"),
});

/**
 * GET /api/operador/calendario
 * Obtiene las habitaciones y reservas para un rango de fechas.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = Object.fromEntries(searchParams.entries());

  // Validar los parámetros
  const validation = querySchema.safeParse(query);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Parámetros inválidos", details: validation.error.format() },
      { status: 400 }
    );
  }

  const { startDate, endDate } = validation.data;
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  if (endDateObj <= startDateObj) {
    return NextResponse.json(
      { error: "La fecha de fin debe ser posterior a la de inicio" },
      { status: 400 }
    );
  }

  try {
    // Consultar la base de datos
    const data = await getCalendarData(startDateObj, endDateObj);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API_CALENDARIO_GET] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener los datos del calendario" },
      { status: 500 }
    );
  }
}

// Forzar revalidación para que los datos sean siempre frescos
export const dynamic = "force-dynamic";
