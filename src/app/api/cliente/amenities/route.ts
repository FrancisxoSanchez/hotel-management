import { NextResponse } from 'next/server';
import { getAllAmenities } from '@/prisma/amenities';

/**
 * Handler GET para obtener todas las instalaciones.
 */
export async function GET() {
  try {
    // Llama a la función de Prisma para obtener los datos
    const data = await getAllAmenities();
    
    // Devuelve los datos en formato JSON
    return NextResponse.json(data);

  } catch (error) {
    console.error('[API_AMENITIES_GET]', error);
    // Devuelve una respuesta de error
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

// Forzar esta ruta a ser dinámica para que
// siempre obtenga los datos más recientes.
export const dynamic = 'force-dynamic';

