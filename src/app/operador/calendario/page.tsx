"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { mockReservations, mockRooms } from "@/lib/mock-data"
import type { ReservationStatus } from "@/lib/types"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isWithinInterval } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CalendarioPage() {
  const { toast } = useToast()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">("all")
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const dateRange = useMemo(() => {
    return {
      start: startOfWeek(currentDate, { weekStartsOn: 1 }),
      end: endOfWeek(currentDate, { weekStartsOn: 1 }),
    }
  }, [currentDate])

  const days = eachDayOfInterval(dateRange)

  const roomInstances = useMemo(() => {
    const instances: Array<{ roomId: string; roomNumber: number; roomName: string }> = []
    mockRooms.forEach((room) => {
      for (let i = 1; i <= room.quantity; i++) {
        instances.push({
          roomId: room.id,
          roomNumber: i,
          roomName: `${room.name} ${i}`,
        })
      }
    })
    return instances
  }, [])

  const filteredReservations = useMemo(() => {
    return mockReservations.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false
      if (r.status === "cancelada") return false
      return true
    })
  }, [statusFilter])

  const getReservationForCell = (roomId: string, roomNumber: number, day: Date) => {
    return filteredReservations.find((r) => {
      if (r.roomId !== roomId || r.roomNumber !== roomNumber) return false
      return isWithinInterval(day, { start: r.checkInDate, end: r.checkOutDate }) || isSameDay(r.checkOutDate, day)
    })
  }

  const handleCancelReservation = (reservationId: string) => {
    const reservation = mockReservations.find((r) => r.id === reservationId)
    if (reservation) {
      reservation.status = "cancelada"
      reservation.cancelledAt = new Date()
      toast({
        title: "Reserva cancelada",
        description: "La reserva ha sido cancelada exitosamente",
      })
    }
    setCancellingId(null)
  }

  const getStatusColor = (status: ReservationStatus) => {
    const colors = {
      pendiente: "bg-yellow-500/20 border-yellow-500",
      confirmada: "bg-green-500/20 border-green-500",
      finalizada: "bg-gray-500/20 border-gray-500",
      cancelada: "bg-red-500/20 border-red-500",
    }
    return colors[status]
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    setCurrentDate(newDate)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Calendario de Reservas</h1>
        <p className="text-muted-foreground">Vista de grilla por habitación y día</p>
      </div>

      {/* Controls */}
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

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header with days */}
          <div className="mb-2 grid grid-cols-8 gap-1">
            <div className="rounded-lg bg-muted p-3 text-sm font-medium">Habitación</div>
            {days.map((day) => {
              const isToday = isSameDay(day, new Date())
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
              )
            })}
          </div>

          {/* Grid rows for each room instance */}
          <div className="space-y-1">
            {roomInstances.map((instance) => (
              <div key={`${instance.roomId}-${instance.roomNumber}`} className="grid grid-cols-8 gap-1">
                {/* Room name cell */}
                <div className="flex items-center rounded-lg border bg-card p-3 text-sm font-medium">
                  {instance.roomName}
                </div>

                {/* Day cells */}
                {days.map((day) => {
                  const reservation = getReservationForCell(instance.roomId, instance.roomNumber, day)
                  const isCheckIn = reservation && isSameDay(reservation.checkInDate, day)
                  const isCheckOut = reservation && isSameDay(reservation.checkOutDate, day)

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
                            <p className="line-clamp-2 font-medium">{reservation.guests[0]?.name}</p>
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
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
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

      <AlertDialog open={!!cancellingId} onOpenChange={() => setCancellingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará la reserva como cancelada y liberará el espacio en el calendario.
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
  )
}
