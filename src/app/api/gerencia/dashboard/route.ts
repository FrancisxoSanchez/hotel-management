import { NextResponse } from "next/server";
import { getDashboardStats, getReservationsReports, getRoomsReports } from "@/prisma/gerencia";

 
export async function GET() {
  try {
    const [stats, reservationsReports, roomsReports] = await Promise.all([
      getDashboardStats(),
      getReservationsReports(),
      getRoomsReports(),
    ]);
    
    return NextResponse.json({ 
      stats, 
      reservationsReports,
      roomsReports,
    });
  } catch (error) {
    console.error("Error en API /api/gerencia/dashboard:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}