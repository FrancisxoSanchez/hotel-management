import { NextRequest, NextResponse } from 'next/server';
import { createConsultation, getConsultationsByEmail } from '@/prisma/consultas';

/**
 * Handler POST para crear una nueva consulta.
 */
export async function POST(request: Request) {
  try {
    // 1. Obtener los datos del body
    const body = await request.json();
    const { email, message } = body;

    // 2. Validación simple
    if (!email || !message) {
      return new NextResponse('Email y mensaje son requeridos', { status: 400 });
    }

    // 3. Llamar a la lógica de Prisma para crear la consulta
    const newConsultation = await createConsultation({ email, message });

    // 4. Devolver la consulta creada
    return NextResponse.json(newConsultation, { status: 201 }); // 201 = Creado

  } catch (error) {
    console.error('[API_CONSULTAS_POST]', error);
    // Devolver una respuesta de error
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

/**
 * NUEVO HANDLER GET
 * Obtiene todas las consultas para un email específico.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'El parámetro email es requerido' },
        { status: 400 }
      );
    }

    const consultations = await getConsultationsByEmail(email);
    return NextResponse.json(consultations);

  } catch (error) {
    console.error('[API_CONSULTAS_GET]', error);
    return NextResponse.json(
      { error: 'Error al obtener las consultas' },
      { status: 500 }
    );
  }
}
