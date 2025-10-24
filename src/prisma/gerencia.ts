import { prisma } from '@/lib/prisma'

/**
 * Obtiene todas las estadísticas clave para el Dashboard de Gerencia.
 * Utiliza una transacción de Prisma para asegurar que todas las consultas
 * se ejecuten de manera eficiente.
 */
export async function getDashboardStats() {
  try {
    const [
      totalRooms,
      activeRooms,
      totalOperators,
      totalClients,
      totalReservations,
      confirmedReservations,
      revenueData,
    ] = await prisma.$transaction([
      // 1. Total de tipos de habitación
      prisma.roomType.count(),
      // 2. Total de tipos de habitación activos
      prisma.roomType.count({ where: { isActive: true } }),
      // 3. Total de usuarios Operador
      prisma.user.count({ where: { role: "operador" } }),
      // 4. Total de usuarios Cliente
      prisma.user.count({ where: { role: "cliente" } }),
      // 5. Total de reservas
      prisma.reservation.count(),
      // 6. Total de reservas confirmadas
      prisma.reservation.count({ where: { status: "confirmada" } }),
      // 7. Suma de ingresos de reservas confirmadas o finalizadas
      prisma.reservation.aggregate({
        _sum: {
          totalPrice: true,
        },
        where: {
          status: {
            in: ["confirmada", "finalizada"],
          },
        },
      }),
    ]);

    const revenue = revenueData._sum.totalPrice || 0;

    return {
      totalRooms,
      activeRooms,
      totalOperators,
      totalClients,
      totalReservations,
      confirmedReservations,
      revenue,
    };
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    throw new Error("No se pudieron cargar las estadísticas");
  }
}
