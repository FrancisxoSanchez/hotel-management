import { NextResponse } from 'next/server';
import { getHomePageData } from '@/prisma/home';

/**
 * Handler GET para obtener los datos de la página de inicio del cliente.
 */
export async function GET() {
  try {
    // Llama a la función de Prisma para obtener los datos
    const data = await getHomePageData();
    
    // Devuelve los datos en formato JSON
    return NextResponse.json(data);

  } catch (error) {
    console.error('[API_HOME_GET]', error);
    // Devuelve una respuesta de error
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

// Opcional: Forzar esta ruta a ser dinámica para que
// siempre obtenga los datos más recientes y no use caché.
export const dynamic = 'force-dynamic';

