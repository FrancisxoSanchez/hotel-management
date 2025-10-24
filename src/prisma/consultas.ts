import { prisma } from '@/lib/prisma';
import type { Consultation } from '@prisma/client';

// Definimos los datos necesarios para crear una consulta
type ConsultationInput = {
  email: string;
  message: string;
};

/**
 * Crea un nuevo registro de consulta en la base de datos.
 * @param data - El email y el mensaje del formulario.
 * @returns La consulta creada.
 */
export async function createConsultation(data: ConsultationInput): Promise<Consultation> {
  try {
    const newConsultation = await prisma.consultation.create({
      data: {
        email: data.email,
        message: data.message,
        // Los demás campos (isAttended, etc.) usarán sus valores por defecto
      },
    });
    return newConsultation;
  } catch (error) {
    console.error('Error al crear la consulta:', error);
    // Lanzamos el error para que la API lo maneje
    throw new Error('No se pudo guardar la consulta en la base de datos.');
  }
}

/**
 * NUEVA FUNCIÓN
 * Obtiene todas las consultas de un email específico, ordenadas por fecha.
 * @param email - El email del cliente.
 * @returns Una lista de consultas.
 */
export async function getConsultationsByEmail(email: string) {
  return prisma.consultation.findMany({
    where: {
      email: email,
    },
    orderBy: {
      createdAt: 'desc', // Más nuevas primero
    },
    include: {
      attendedBy: { // Incluir quién respondió
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}
