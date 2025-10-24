import { prisma } from "@/lib/prisma";
import type { Consultation } from "@prisma/client";

/**
 * Obtiene todas las consultas, ordenadas por pendientes primero
 * y luego por fecha de creación.
 */
export async function getConsultations(): Promise<Consultation[]> {
  return prisma.consultation.findMany({
    orderBy: [
      { isAttended: "asc" }, // Pendientes (false) primero
      { createdAt: "asc" },  // Más antiguas primero
    ],
    include: {
      attendedBy: { // Incluir info del operador que respondió
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Responde a una consulta específica.
 * @param consultationId El ID de la consulta a responder
 * @param response El texto de la respuesta
 * @param attendedById El ID del operador (User) que está respondiendo
 */
export async function respondToConsultation(
  consultationId: string,
  response: string,
  attendedById: string
): Promise<Consultation> {
  
  // Verificar que el operador exista
  const user = await prisma.user.findUnique({
    where: { id: attendedById },
  });

  if (!user) {
    throw new Error("El usuario operador no existe");
  }

  // Actualizar la consulta
  return prisma.consultation.update({
    where: { id: consultationId },
    data: {
      response,
      isAttended: true,
      attendedAt: new Date(),
      attendedBy: {
        connect: { id: attendedById },
      },
    },
    include: {
      attendedBy: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
}
