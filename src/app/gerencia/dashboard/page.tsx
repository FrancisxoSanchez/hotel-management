"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockRooms, mockUsers, mockReservations } from "@/lib/mock-data"
import { Hotel, Users, Calendar, TrendingUp } from "lucide-react"

export default function GerenciaDashboardPage() {
  const stats = {
    totalRooms: mockRooms.length,
    activeRooms: mockRooms.filter((r) => r.isActive).length,
    totalOperators: mockUsers.filter((u) => u.role === "operador").length,
    totalClients: mockUsers.filter((u) => u.role === "cliente").length,
    totalReservations: mockReservations.length,
    confirmedReservations: mockReservations.filter((r) => r.status === "confirmada").length,
    revenue: mockReservations
      .filter((r) => r.status === "confirmada" || r.status === "finalizada")
      .reduce((sum, r) => sum + r.totalPrice, 0),
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Dashboard de Gerencia</h1>
        <p className="text-muted-foreground">Resumen general del hotel y métricas clave</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Habitaciones</CardTitle>
            <Hotel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRooms}</div>
            <p className="text-xs text-muted-foreground">{stats.activeRooms} activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOperators}</div>
            <p className="text-xs text-muted-foreground">{stats.totalClients} clientes registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservations}</div>
            <p className="text-xs text-muted-foreground">{stats.confirmedReservations} confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.revenue / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">Total acumulado</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Habitaciones</CardTitle>
            <CardDescription>Administra el inventario de habitaciones del hotel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>• Crear nuevas habitaciones</p>
              <p>• Editar información y precios</p>
              <p>• Gestionar amenities y servicios</p>
              <p>• Eliminar habitaciones obsoletas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestión de Operadores</CardTitle>
            <CardDescription>Administra el equipo de operadores del hotel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>• Agregar nuevos operadores</p>
              <p>• Actualizar información de contacto</p>
              <p>• Gestionar credenciales de acceso</p>
              <p>• Eliminar operadores inactivos</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
