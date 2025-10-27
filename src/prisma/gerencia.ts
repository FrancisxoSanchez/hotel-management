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

/**
 * Obtiene estadísticas detalladas de reservas
 */
export async function getReservationsReports() {
  try {
    // 1. Estadísticas de cancelación detalladas
    const totalReservations = await prisma.reservation.count();
    const cancelledReservations = await prisma.reservation.count({
      where: { status: 'cancelada' },
    });
    const pendingReservations = await prisma.reservation.count({
      where: { status: 'pendiente' },
    });
    const confirmedReservations = await prisma.reservation.count({
      where: { status: 'confirmada' },
    });
    const finalizedReservations = await prisma.reservation.count({
      where: { status: 'finalizada' },
    });

    const cancellationRate = totalReservations > 0 
      ? ((cancelledReservations / totalReservations) * 100).toFixed(1)
      : '0';

    // Cancelaciones por mes (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const cancellationsByMonth = await prisma.$queryRaw<
      Array<{ month: string; cancelled: number; total: number }>
    >`
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        COUNT(CASE WHEN "status" = 'cancelada' THEN 1 END)::int as cancelled,
        COUNT(*)::int as total
      FROM "Reservation"
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month ASC
    `;

    // 2. Reservas por estado (para gráfico de barras)
    const reservationsByStatus = await prisma.reservation.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const statusData = reservationsByStatus.map(stat => ({
      status: stat.status,
      cantidad: stat._count.id,
    }));

    // 3. Ingresos mensuales y semanales
    const monthlyRevenue = await prisma.$queryRaw<
      Array<{ period: string; revenue: number; reservations: number }>
    >`
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM') as period,
        SUM("totalPrice")::float as revenue,
        COUNT(*)::int as reservations
      FROM "Reservation"
      WHERE "status" IN ('confirmada', 'finalizada')
        AND "createdAt" >= ${sixMonthsAgo}
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY period ASC
    `;

    // Ingresos semanales (últimas 12 semanas)
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    const weeklyRevenue = await prisma.$queryRaw<
      Array<{ period: string; revenue: number; reservations: number }>
    >`
      SELECT 
        TO_CHAR("createdAt", 'IYYY-IW') as period,
        SUM("totalPrice")::float as revenue,
        COUNT(*)::int as reservations
      FROM "Reservation"
      WHERE "status" IN ('confirmada', 'finalizada')
        AND "createdAt" >= ${twelveWeeksAgo}
      GROUP BY TO_CHAR("createdAt", 'IYYY-IW')
      ORDER BY period ASC
    `;

    return {
      cancellationStats: {
        total: totalReservations,
        cancelled: cancelledReservations,
        pending: pendingReservations,
        confirmed: confirmedReservations,
        finalized: finalizedReservations,
        rate: cancellationRate,
        byMonth: cancellationsByMonth,
      },
      reservationsByStatus: statusData,
      monthlyRevenue,
      weeklyRevenue,
    };
  } catch (error) {
    console.error("Error al obtener reportes de reservas:", error);
    throw new Error("No se pudieron cargar los reportes de reservas");
  }
}

/**
 * Obtiene estadísticas detalladas de habitaciones
 */
export async function getRoomsReports() {
  try {
    // 1. Reservas por tipo de habitación
    const reservationsByRoomType = await prisma.reservation.groupBy({
      by: ['roomId'],
      _count: {
        id: true,
      },
      where: {
        status: {
          in: ['confirmada', 'finalizada'],
        },
      },
    });

    // Obtener información de los tipos de habitación
    const roomTypeStats = await Promise.all(
      reservationsByRoomType.map(async (stat) => {
        const room = await prisma.room.findUnique({
          where: { id: stat.roomId },
          include: { roomType: true },
        });
        return {
          roomTypeName: room?.roomType.name || 'Desconocido',
          count: stat._count.id,
        };
      })
    );

    // Agrupar por tipo de habitación
    const groupedByType = roomTypeStats.reduce((acc, curr) => {
      const existing = acc.find(item => item.name === curr.roomTypeName);
      if (existing) {
        existing.value += curr.count;
      } else {
        acc.push({ name: curr.roomTypeName, value: curr.count });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

    // 2. Ocupación por piso
    const roomsByFloor = await prisma.room.groupBy({
      by: ['floor', 'status'],
      _count: {
        id: true,
      },
    });

    const floorOccupancy = roomsByFloor.reduce((acc, curr) => {
      const floorKey = `Piso ${curr.floor}`;
      if (!acc[floorKey]) {
        acc[floorKey] = { 
          floor: floorKey, 
          ocupadas: 0, 
          disponibles: 0, 
          mantenimiento: 0, 
          limpieza: 0 
        };
      }
      
      // Asignar el conteo según el estado
      if (curr.status === 'ocupada') {
        acc[floorKey].ocupadas = curr._count.id;
      } else if (curr.status === 'disponible') {
        acc[floorKey].disponibles = curr._count.id;
      } else if (curr.status === 'mantenimiento') {
        acc[floorKey].mantenimiento = curr._count.id;
      } else if (curr.status === 'limpieza') {
        acc[floorKey].limpieza = curr._count.id;
      }
      
      return acc;
    }, {} as Record<string, { floor: string; ocupadas: number; disponibles: number; mantenimiento: number; limpieza: number }>);

    const floorData = Object.values(floorOccupancy);

    // 3. Servicios adicionales (Spa y Desayuno)
    const [
      totalWithBreakfast,
      totalWithSpa,
      totalWithBoth,
      avgGuestsData,
    ] = await prisma.$transaction([
      // Reservas con desayuno
      prisma.reservation.count({
        where: {
          includesBreakfast: true,
          status: { in: ['confirmada', 'finalizada'] },
        },
      }),
      // Reservas con spa
      prisma.reservation.count({
        where: {
          includesSpa: true,
          status: { in: ['confirmada', 'finalizada'] },
        },
      }),
      // Reservas con ambos
      prisma.reservation.count({
        where: {
          includesBreakfast: true,
          includesSpa: true,
          status: { in: ['confirmada', 'finalizada'] },
        },
      }),
      // Promedio de huéspedes
      prisma.reservation.findMany({
        include: { guests: true },
        where: {
          status: { in: ['confirmada', 'finalizada'] },
        },
      }),
    ]);

    const totalGuests = avgGuestsData.reduce(
      (sum, res) => sum + res.guests.length,
      0
    );
    const avgGuestsPerReservation = avgGuestsData.length > 0
      ? (totalGuests / avgGuestsData.length).toFixed(1)
      : '0';

    const totalConfirmedOrFinalized = avgGuestsData.length;
    const breakfastRate = totalConfirmedOrFinalized > 0
      ? ((totalWithBreakfast / totalConfirmedOrFinalized) * 100).toFixed(1)
      : '0';
    const spaRate = totalConfirmedOrFinalized > 0
      ? ((totalWithSpa / totalConfirmedOrFinalized) * 100).toFixed(1)
      : '0';

    return {
      reservationsByRoomType: groupedByType,
      floorOccupancy: floorData,
      additionalServices: {
        breakfast: {
          count: totalWithBreakfast,
          rate: breakfastRate,
        },
        spa: {
          count: totalWithSpa,
          rate: spaRate,
        },
        both: totalWithBoth,
        total: totalConfirmedOrFinalized,
      },
      avgGuestsPerReservation,
    };
  } catch (error) {
    console.error("Error al obtener reportes de habitaciones:", error);
    throw new Error("No se pudieron cargar los reportes de habitaciones");
  }
}