"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { ReservationStatus, Room, RoomType } from "@prisma/client";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isWithinInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, X, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Tipos de datos de la API ---
// Definimos los tipos basados en lo que devuelve la API

// Habitación física con su tipo de habitación (para el nombre)
type ApiRoom = Room & {
  roomType: {
    name: string;
  };
};

// Reserva con el nombre del huésped y el ID de la habitación
type ApiReservation = {
  id: string;
  roomId: string; // ID de la habitación física (ej: "101")
  checkInDate: string;  // Viene como string ISO de la API
  checkOutDate: string; // Viene como string ISO de la API
  status: ReservationStatus;
  guests: {
    name: string;
  }[];
};

export default function CalendarioPage() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // --- Estados para datos de la API ---
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [reservations, setReservations] = useState<ApiReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rango de fechas para la semana actual
  const dateRange = useMemo(() => {
    return {
      start: startOfWeek(currentDate, { weekStartsOn: 1 }),
      end: endOfWeek(currentDate, { weekStartsOn: 1 }),
    };
  }, [currentDate]);

  const days = eachDayOfInterval(dateRange);

  // --- Efecto para cargar datos de la API ---
  useEffect(() => {
    const fetchCalendarData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
        });

        const response = await fetch(`/api/operador/calendario?${params}`);

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "No se pudieron cargar los datos");
        }

        const data = await response.json();
        setRooms(data.rooms);
        setReservations(data.reservations);

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

    fetchCalendarData();
  }, [dateRange, toast]); // Recargar cuando cambie el rango de fechas

  // Filtrar reservas según el filtro de estado
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (r.status === "cancelada") return false; // Ya no deberíamos recibirlas, pero por si acaso
      return true;
    });
  }, [reservations, statusFilter]);

  // Encontrar la reserva para una celda (habitación + día)
  const getReservationForCell = (roomId: string, day: Date) => {
    return filteredReservations.find((r) => {
      if (r.roomId !== roomId) return false;
      
      // Parsear fechas ISO una vez
      const checkIn = parseISO(r.checkInDate);
      const checkOut = parseISO(r.checkOutDate);

      // Lógica de intervalo:
      // Está dentro si el día es >= check-in Y el día es < check-out
      // Usamos isWithinInterval pero ajustando el end-date
      // ya que un check-out el día 10 significa que la noche del 9 está ocupada
      return isWithinInterval(day, { start: checkIn, end: new Date(checkOut.getTime() - 1) });
    });
  };

  // Manejar cancelación de reserva llamando a la API
  const handleCancelReservation = async (reservationId: string) => {
    if (!reservationId) return;

    try {
      const response = await fetch(`/api/operador/reservas/${reservationId}/cancelar`, {
        method: "POST",
      });

      if (!response.ok) {
        // --- MODIFICACIÓN AQUÍ ---
        // Vamos a leer el cuerpo del error que nos manda la API
        let errorDetails = "No se pudo cancelar la reserva";
        try {
          const errData = await response.json();
          // Si la API nos da un 'error' o 'details', lo usamos
          errorDetails = errData.error || errData.message || JSON.stringify(errData);
        } catch (e) {
          // Si el cuerpo no es JSON, usamos el texto de status
          errorDetails = response.statusText;
        }
        
        // Logueamos el error detallado en la consola del navegador
        console.error("[CANCEL_RESERVATION_ERROR]", errorDetails);
        throw new Error(errorDetails); // Lanzamos el error específico
        // --- FIN DE LA MODIFICACIÓN ---
      }

      toast({
        title: "Reserva cancelada",
        description: "La reserva ha sido cancelada exitosamente",
      });

      // Actualizar UI: O se vuelve a cargar todo, o se saca la reserva del estado
      setReservations((prev) => prev.filter((r) => r.id !== reservationId));

    } catch (err: any) {
      toast({
        title: "Error al Cancelar",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
    }
  };

  // Colores de estado
  const getStatusColor = (status: ReservationStatus) => {
    const colors = {
      pendiente: "bg-yellow-500/20 border-yellow-500",
      confirmada: "bg-green-500/20 border-green-500",
      finalizada: "bg-gray-500/20 border-gray-500",
      cancelada: "bg-red-500/20 border-red-500", // No debería mostrarse
    };
    return colors[status];
  };

  // Navegar entre semanas
  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentDate(newDate);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Calendario de Reservas</h1>
        <p className="text-muted-foreground">Vista de grilla por habitación y día</p>
      </div>

      {/* Controles */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex min-w-[200px] items-center justify-center">
              <span className="font-medium">
                {format(dateRange.start, "d MMM", { locale: es })} -{" "}
                {format(dateRange.end, "d MMM yyyy", { locale: es })}
              </span>
            </div>
            <Button variant="outline" size="icon" onClick={() => navigateWeek("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReservationStatus | "all")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="finalizada">Finalizada</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
              Hoy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grilla del Calendario */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Encabezado con días */}
          <div className="mb-2 grid grid-cols-8 gap-1">
            <div className="sticky left-0 z-10 rounded-lg bg-muted p-3 text-sm font-medium">Habitación</div>
            {days.map((day) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "rounded-lg bg-muted p-3 text-center text-sm",
                    isToday && "bg-primary text-primary-foreground",
                  )}
                >
                  <div className="font-medium">{format(day, "EEE", { locale: es })}</div>
                  <div className="text-xs">{format(day, "d MMM", { locale: es })}</div>
                </div>
              );
            })}
          </div>

          {/* Estado de Carga o Error */}
          {loading && (
            <div className="flex h-64 items-center justify-center rounded-lg border">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Cargando reservas...</span>
            </div>
          )}

          {error && !loading && (
             <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/5">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <span className="mt-3 font-medium text-destructive">Error al cargar datos</span>
              <p className="text-muted-foreground">{error}</p>
            </div>
          )}

          {/* Filas de la grilla por cada habitación */}
          {!loading && !error && (
            <div className="space-y-1">
              {rooms.map((room) => {
                const roomName = `${room.roomType.name} ${room.id}`; // Ej: "Standard 101"
                
                return (
                  <div key={room.id} className="grid grid-cols-8 gap-1">
                    {/* Celda con nombre de habitación */}
                    <div className="sticky left-0 z-10 flex items-center rounded-lg border bg-card p-3 text-sm font-medium">
                      {roomName}
                    </div>

                    {/* Celdas de días */}
                    {days.map((day) => {
                      const reservation = getReservationForCell(room.id, day);
                      const isCheckIn = reservation && isSameDay(parseISO(reservation.checkInDate), day);
                      const isCheckOut = reservation && isSameDay(parseISO(reservation.checkOutDate), day);

                      return (
                        <div
                          key={day.toISOString()}
                          className={cn(
                            "relative min-h-[80px] rounded-lg border p-2 text-xs",
                            reservation ? getStatusColor(reservation.status) : "bg-card",
                          )}
                        >
                          {reservation && (
                            <div className="flex h-full flex-col justify-between">
                              <div className="flex-1">
                                {isCheckIn && (
                                  <div className="mb-1">
                                    <Badge variant="outline" className="h-5 text-[10px]">
                                      Check-in
                                    </Badge>
                                  </div>
                                )}
                                <p className="line-clamp-2 font-medium">
                                  {reservation.guests[0]?.name || "Huésped"}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                {isCheckOut && (
                                  <Badge variant="outline" className="h-5 text-[10px]">
                                    Check-out
                                  </Badge>
                                )}
                                {reservation.status === "pendiente" && isCheckIn && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 text-destructive"
                                    onClick={() => setCancellingId(reservation.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Leyenda */}
      <Card className="mt-6">
        <CardContent className="flex flex-wrap gap-4 p-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border bg-yellow-500/20 border-yellow-500" />
            <span className="text-sm">Pendiente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border bg-green-500/20 border-green-500" />
            <span className="text-sm">Confirmada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border bg-gray-500/20 border-gray-500" />
            <span className="text-sm">Finalizada</span>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Confirmación de Cancelación */}
      <AlertDialog open={!!cancellingId} onOpenChange={() => setCancellingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará la reserva como cancelada y liberará la habitación en el calendario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener</AlertDialogCancel>
            <AlertDialogAction onClick={() => cancellingId && handleCancelReservation(cancellingId)}>
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
