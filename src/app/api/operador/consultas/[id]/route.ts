import { NextRequest, NextResponse } from "next/server";
import { respondToConsultation } from "@/prisma/consultas-operador";
import { z } from "zod";

// Esquema para validar el cuerpo de la respuesta
const responseSchema = z.object({
  response: z.string().min(1, "La respuesta no puede estar vacía"),
  attendedById: z.string().min(1, "ID de usuario inválido"),
});

/**
 * POST /api/operador/consultas/[id]
 * Responde a una consulta específica.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID de consulta requerido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = responseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { response, attendedById } = validation.data;

    const updatedConsultation = await respondToConsultation(
      id,
      response,
      attendedById
    );

    return NextResponse.json(updatedConsultation);

  } catch (error: any) {
    console.error("[API_CONSULTAS_POST] Error:", error);
    if (error.message.includes("El usuario operador no existe")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Error al responder la consulta" },
      { status: 500 }
    );
  }
}
