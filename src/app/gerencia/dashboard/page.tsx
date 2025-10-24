"use client";

import { useEffect, useState } from "react";
// Corregido: Usar rutas relativas
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Hotel, Users, Calendar, TrendingUp } from "lucide-react";

// Definimos un tipo para las estadísticas que esperamos de la API
interface DashboardStats {
  totalRooms: number;
  activeRooms: number;
  totalOperators: number;
  totalClients: number;
  totalReservations: number;
  confirmedReservations: number;
  revenue: number;
}

export default function GerenciaDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // NOTA: Asegúrate de que esta API route exista
        const response = await fetch("/api/gerencia/dashboard");
        if (!response.ok) {
          throw new Error("Error al cargar los datos del dashboard");
        }
        const data = await response.json();
        // Asumiendo que la API devuelve { stats: { ... } }
        setStats(data.stats);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ocurrió un error desconocido"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Estado de Carga
  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-lg text-muted-foreground">
            Cargando estadísticas...
          </p>
        </div>
      </div>
    );
  }

  // Estado de Error
  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center text-destructive">
          <h2 className="mb-4 text-2xl font-bold">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Estado Exitoso (stats no es null)
  if (!stats) {
    // Esto no debería pasar si isLoading es false y no hay error, pero es una buena práctica
    return (
      <div className="text-center">
        No se encontraron datos.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-16 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Dashboard de Gerencia</h1>
        <p className="text-muted-foreground">
          Resumen general del hotel y métricas clave
        </p>
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
            <p className="text-xs text-muted-foreground">
              {stats.activeRooms} activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOperators}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalClients} clientes registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.confirmedReservations} confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.revenue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">Total acumulado</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions (sin cambios) */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Habitaciones</CardTitle>
            <CardDescription>
              Administra el inventario de habitaciones del hotel
            </CardDescription>
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
            <CardDescription>
              Administra el equipo de operadores del hotel
            </CardDescription>
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
  );
}