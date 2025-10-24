import { NextResponse } from 'next/server';
import {
  getOperadores,
  createOperador,
  updateOperador,
  deleteOperador,
} from '@/prisma/operadores';

// Helper para manejar errores de forma consistente
const handleError = (error: unknown, defaultMessage: string, status = 500) => {
  const message = error instanceof Error ? error.message : defaultMessage;
  return NextResponse.json({ error: message }, { status });
};

export async function GET(request: Request) {

  try {
    const operadores = await getOperadores();
    return NextResponse.json(operadores);
  } catch (error) {
    return handleError(error, 'Error al obtener los operadores');
  }
}

export async function POST(request: Request) {
  // TODO: Verificar autenticación y rol de 'gerencia'

  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const newOperador = await createOperador({ name, email, password, phone });
    return NextResponse.json(newOperador, { status: 201 });
  } catch (error) {
    // El error de email duplicado se maneja en la capa de prisma
    return handleError(error, 'Error al crear el operador', 400);
  }
}

export async function PUT(request: Request) {
  // TODO: Verificar autenticación y rol de 'gerencia'

  try {
    const body = await request.json();
    const { id, name, email, phone, password } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'El ID del operador es requerido' },
        { status: 400 }
      );
    }

    // Construimos el objeto de datos solo con los campos presentes
    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (phone) dataToUpdate.phone = phone;
    if (password) dataToUpdate.password = password; // Solo se incluye si se proveyó una nueva

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron datos para actualizar' },
        { status: 400 }
      );
    }

    const updatedOperador = await updateOperador(id, dataToUpdate);
    return NextResponse.json(updatedOperador);
  } catch (error) {
    return handleError(error, 'Error al actualizar el operador', 400);
  }
}

export async function DELETE(request: Request) {
  // TODO: Verificar autenticación y rol de 'gerencia'

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'El ID del operador es requerido' },
        { status: 400 }
      );
    }

    await deleteOperador(id);
    return NextResponse.json({ message: 'Operador eliminado exitosamente' });
  } catch (error) {
    return handleError(error, 'Error al eliminar el operador');
  }
}