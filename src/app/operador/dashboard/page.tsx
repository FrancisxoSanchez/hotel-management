"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockReservations, mockRooms } from "@/lib/mock-data"
import { Calendar, Users, DoorOpen, DoorClosed, TrendingUp, Clock } from "lucide-react"
import { format, isToday, isTomorrow } from "date-fns"
import { es } from "date-fns/locale"

export default function OperadorDashboardPage() {
  const today = new Date()

  const stats = {
    totalReservations: mockReservations.length,
    pendingReservations: mockReservations.filter((r) => r.status === "pendiente").length,
    confirmedReservations: mockReservations.filter((r) => r.status === "confirmada").length,
    checkinsToday: mockReservations.filter((r) => r.status === "pendiente" && isToday(r.checkInDate)).length,
    checkoutsToday: mockReservations.filter((r) => r.status === "confirmada" && isToday(r.checkOutDate)).length,
    activeRooms: mockRooms.filter((r) => r.isActive).length,
    totalRooms: mockRooms.length,
  }

  const upcomingCheckins = mockReservations
    .filter((r) => r.status === "pendiente" && (isToday(r.checkInDate) || isTomorrow(r.checkInDate)))
    .slice(0, 5)

  const upcomingCheckouts = mockReservations
    .filter((r) => r.status === "confirmada" && (isToday(r.checkOutDate) || isTomorrow(r.checkOutDate)))
    .slice(0, 5)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de operaciones del hotel</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Totales</CardTitle>
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
            <p className="text-xs text-muted-foreground">Habitaciones disponibles</p>
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
            {upcomingCheckins.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">No hay check-ins próximos</p>
            ) : (
              <div className="space-y-4">
                {upcomingCheckins.map((reservation) => {
                  const room = mockRooms.find((r) => r.id === reservation.roomId)
                  return (
                    <div key={reservation.id} className="flex items-start justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{room?.name}</p>
                          {isToday(reservation.checkInDate) && <Badge variant="default">Hoy</Badge>}
                          {isTomorrow(reservation.checkInDate) && <Badge variant="secondary">Mañana</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{reservation.guests[0]?.name || "Sin nombre"}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(reservation.checkInDate, "d MMM, HH:mm", { locale: es })}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{reservation.guests.length}</span>
                      </div>
                    </div>
                  )
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
            {upcomingCheckouts.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">No hay check-outs próximos</p>
            ) : (
              <div className="space-y-4">
                {upcomingCheckouts.map((reservation) => {
                  const room = mockRooms.find((r) => r.id === reservation.roomId)
                  return (
                    <div key={reservation.id} className="flex items-start justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{room?.name}</p>
                          {isToday(reservation.checkOutDate) && <Badge variant="default">Hoy</Badge>}
                          {isTomorrow(reservation.checkOutDate) && <Badge variant="secondary">Mañana</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{reservation.guests[0]?.name || "Sin nombre"}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(reservation.checkOutDate, "d MMM, HH:mm", { locale: es })}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{reservation.guests.length}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
