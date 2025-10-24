import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';

// Definimos los campos que SÍ queremos devolver al frontend
// MUY IMPORTANTE: Omitir 'password' siempre
const operatorSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  createdAt: true,
};

/**
 * Obtiene todos los usuarios con el rol 'operador'
 */
export const getOperadores = async () => {
  try {
    const operadores = await prisma.user.findMany({
      where: {
        role: 'operador',
      },
      select: operatorSelect,
    });
    return operadores;
  } catch (error) {
    console.error('Error al obtener operadores:', error);
    throw new Error('No se pudo obtener la lista de operadores');
  }
};

/**
 * Crea un nuevo operador.
 * 'data' debe contener name, email, password, y opcionalmente phone.
 */
export const createOperador = async (
  data: Pick<User, 'name' | 'email' | 'password' | 'phone'>
) => {
  try {
    const newOperador = await prisma.user.create({
      data: {
        ...data,
        role: 'operador', // Forzamos el rol
      },
      select: operatorSelect,
    });
    return newOperador;
  } catch (error) {
    console.error('Error al crear operador:', error);
    // Manejo de error específico para email duplicado
    if (
      error instanceof Error &&
      'code' in error &&
      error.code === 'P2002' // Código de Prisma para 'Unique constraint failed'
    ) {
      throw new Error('El email ingresado ya está en uso');
    }
    throw new Error('No se pudo crear el operador');
  }
};

/**
 * Actualiza un operador por su ID.
 * 'data' puede contener name, email, password, y phone.
 * Si 'password' no se incluye, no se actualiza.
 */
export const updateOperador = async (
  id: string,
  data: Partial<Pick<User, 'name' | 'email' | 'password' | 'phone'>>
) => {
  try {
    const updatedOperador = await prisma.user.update({
      where: {
        id: id,
        // Opcional: Asegurarnos que solo podamos editar operadores
        // role: 'operador',
      },
      data: data,
      select: operatorSelect,
    });
    return updatedOperador;
  } catch (error) {
    console.error('Error al actualizar operador:', error);
    if (
      error instanceof Error &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      throw new Error('El email ingresado ya está en uso por otro usuario');
    }
    throw new Error('No se pudo actualizar el operador');
  }
};

/**
 * Elimina un operador por su ID.
 */
export const deleteOperador = async (id: string) => {
  try {
    await prisma.user.delete({
      where: {
        id: id,
        // Opcional: Asegurarnos que solo podamos borrar operadores
        // role: 'operador',
      },
    });
    return { message: 'Operador eliminado correctamente' };
  } catch (error) {
    console.error('Error al eliminar operador:', error);
    throw new Error('No se pudo eliminar el operador');
  }
};