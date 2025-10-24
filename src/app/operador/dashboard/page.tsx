"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { DashboardData } from "@/prisma/dashboardop";
import { Calendar, Users, DoorOpen, DoorClosed, TrendingUp, Clock, Loader2, AlertCircle } from "lucide-react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export default function OperadorDashboardPage() {
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/operador/dashboard");
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "No se pudieron cargar los datos");
        }
        const result: DashboardData = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error de Carga",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (loading) {
    return (
      <div className="container mx-auto flex h-[80vh] items-center justify-center px-16 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto flex h-[80vh] flex-col items-center justify-center px-16 py-8">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold text-destructive">Error al cargar el Dashboard</h2>
        <p className="text-muted-foreground">{error || "No se pudieron obtener datos."}</p>
      </div>
    );
  }

  const { stats, lists } = data;

  return (
    <div className="container mx-auto px-16 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de operaciones del hotel</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Activas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingReservations} pendientes, {stats.confirmedReservations} confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-ins Hoy</CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkinsToday}</div>
            <p className="text-xs text-muted-foreground">Llegadas programadas para hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-outs Hoy</CardTitle>
            <DoorClosed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkoutsToday}</div>
            <p className="text-xs text-muted-foreground">Salidas programadas para hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Habitaciones Activas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeRooms}/{stats.totalRooms}
            </div>
            <p className="text-xs text-muted-foreground">Disponibles o en limpieza</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Activities */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Upcoming Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5" />
              Próximos Check-ins
            </CardTitle>
            <CardDescription>Llegadas programadas para hoy y mañana</CardDescription>
          </CardHeader>
          <CardContent>
            {lists.upcomingCheckins.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">No hay check-ins próximos</p>
            ) : (
              <div className="space-y-4">
                {lists.upcomingCheckins.map((reservation) => {
                  const checkInDate = parseISO(reservation.checkInDate as unknown as string);
                  const roomName = `${reservation.room.roomType.name} ${reservation.room.id}`;
                  return (
                    <div key={reservation.id} className="flex items-start justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{roomName}</p>
                          {isToday(checkInDate) && <Badge variant="default">Hoy</Badge>}
                          {isTomorrow(checkInDate) && <Badge variant="secondary">Mañana</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{reservation.guests[0]?.name || "Sin nombre"}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(checkInDate, "d MMM, HH:mm", { locale: es })}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{reservation.guests.length}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Check-outs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DoorClosed className="h-5 w-5" />
              Próximos Check-outs
            </CardTitle>
            <CardDescription>Salidas programadas para hoy y mañana</CardDescription>
          </CardHeader>
          <CardContent>
            {lists.upcomingCheckouts.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">No hay check-outs próximos</p>
            ) : (
              <div className="space-y-4">
                {lists.upcomingCheckouts.map((reservation) => {
                  const checkOutDate = parseISO(reservation.checkOutDate as unknown as string);
                  const roomName = `${reservation.room.roomType.name} ${reservation.room.id}`;
                  return (
                    <div key={reservation.id} className="flex items-start justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{roomName}</p>
                          {isToday(checkOutDate) && <Badge variant="default">Hoy</Badge>}
                          {isTomorrow(checkOutDate) && <Badge variant="secondary">Mañana</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{reservation.guests[0]?.name || "Sin nombre"}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(checkOutDate, "d MMM, HH:mm", { locale: es })}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{reservation.guests.length}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
