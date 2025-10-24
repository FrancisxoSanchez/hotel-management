import { prisma } from "@/lib/prisma";
import { startOfToday, endOfToday, endOfTomorrow } from "date-fns";

/**
 * Obtiene todas las estadísticas y listas para el dashboard del operador.
 */
export async function getDashboardData() {
  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  const tomorrowEnd = endOfTomorrow();

  // 1. Estadísticas de Reservas
  const reservationStats = prisma.$transaction([
    // Total (sin cancelar)
    prisma.reservation.count({
      where: { status: { notIn: ["cancelada"] } },
    }),
    // Pendientes
    prisma.reservation.count({
      where: { status: "pendiente" },
    }),
    // Confirmadas
    prisma.reservation.count({
      where: { status: "confirmada" },
    }),
    // Check-ins Hoy (son 'pendientes' que llegan hoy)
    prisma.reservation.count({
      where: {
        status: "pendiente",
        checkInDate: { gte: todayStart, lt: todayEnd },
      },
    }),
    // Check-outs Hoy (son 'confirmadas' que salen hoy)
    prisma.reservation.count({
      where: {
        status: "confirmada",
        checkOutDate: { gte: todayStart, lt: todayEnd },
      },
    }),
  ]);

  // 2. Estadísticas de Habitaciones
  const roomStats = prisma.$transaction([
    // Total de habitaciones físicas
    prisma.room.count(),
    // Activas (disponibles o en limpieza)
    prisma.room.count({
      where: { status: { in: ["disponible", "limpieza"] } },
    }),
  ]);

  // 3. Listas de Próximas Actividades
  // Próximos Check-ins (pendientes hoy o mañana)
  const upcomingCheckins = prisma.reservation.findMany({
    where: {
      status: "pendiente",
      checkInDate: { gte: todayStart, lt: tomorrowEnd },
    },
    include: {
      guests: { select: { name: true }, take: 1 },
      room: { include: { roomType: { select: { name: true } } } },
    },
    orderBy: { checkInDate: "asc" },
    take: 5,
  });

  // Próximos Check-outs (confirmados hoy o mañana)
  const upcomingCheckouts = prisma.reservation.findMany({
    where: {
      status: "confirmada",
      checkOutDate: { gte: todayStart, lt: tomorrowEnd },
    },
    include: {
      guests: { select: { name: true }, take: 1 },
      room: { include: { roomType: { select: { name: true } } } },
    },
    orderBy: { checkOutDate: "asc" },
    take: 5,
  });

  // Ejecutar todas las consultas en paralelo
  const [
    [totalReservations, pendingReservations, confirmedReservations, checkinsToday, checkoutsToday],
    [totalRooms, activeRooms],
    checkins,
    checkouts,
  ] = await Promise.all([reservationStats, roomStats, upcomingCheckins, upcomingCheckouts]);

  return {
    stats: {
      totalReservations,
      pendingReservations,
      confirmedReservations,
      checkinsToday,
      checkoutsToday,
      activeRooms,
      totalRooms,
    },
    lists: {
      upcomingCheckins: checkins,
      upcomingCheckouts: checkouts,
    },
  };
}

// Tipo de dato para el frontend
export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
