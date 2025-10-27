"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import { Hotel, Users, Calendar, TrendingUp, XCircle, CheckCircle, Coffee, Waves } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from "recharts";

// Tipos para las estadísticas
interface DashboardStats {
  totalRooms: number;
  activeRooms: number;
  totalOperators: number;
  totalClients: number;
  totalReservations: number;
  confirmedReservations: number;
  revenue: number;
}

interface ReservationsReports {
  cancellationStats: {
    total: number;
    cancelled: number;
    pending: number;
    confirmed: number;
    finalized: number;
    rate: string;
    byMonth: Array<{ month: string; cancelled: number; total: number }>;
  };
  reservationsByStatus: Array<{ status: string; cantidad: number }>;
  monthlyRevenue: Array<{ period: string; revenue: number; reservations: number }>;
  weeklyRevenue: Array<{ period: string; revenue: number; reservations: number }>;
}

interface RoomsReports {
  reservationsByRoomType: Array<{ name: string; value: number }>;
  floorOccupancy: Array<{
    floor: string;
    ocupadas: number;
    disponibles: number;
    mantenimiento: number;
    limpieza: number;
  }>;
  additionalServices: {
    breakfast: { count: number; rate: string };
    spa: { count: number; rate: string };
    both: number;
    total: number;
  };
  avgGuestsPerReservation: string;
}

// Colores para los gráficos
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];
const STATUS_COLORS: Record<string, string> = {
  pendiente: "#ffb700ed",
  confirmada: "#00c469ff",
  finalizada: "#959a9fff",
  cancelada: "#ff4242ff",
};

export default function GerenciaDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reservationsReports, setReservationsReports] = useState<ReservationsReports | null>(null);
  const [roomsReports, setRoomsReports] = useState<RoomsReports | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueView, setRevenueView] = useState<"month" | "week">("month");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/gerencia/dashboard");
        if (!response.ok) {
          throw new Error("Error al cargar los datos del dashboard");
        }
        const data = await response.json();
        setStats(data.stats);
        setReservationsReports(data.reservationsReports);
        setRoomsReports(data.roomsReports);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ocurrió un error desconocido"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  if (!stats || !reservationsReports || !roomsReports) {
    return <div className="text-center">No se encontraron datos.</div>;
  }

  const revenueData = revenueView === "month" 
    ? reservationsReports.monthlyRevenue 
    : reservationsReports.weeklyRevenue;

  // Función para formatear números con separadores de miles
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR').format(num);
  };

  // Función para formatear números compactos (K, M)
  const formatCompactNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  const formatXAxisTick = (period: string, view: "month" | "week") => {
    const [year, val] = period.split('-');
    if (view === "month") {
      const date = new Date(parseInt(year), parseInt(val) - 1);
      return date.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
    } else {
      return `S. ${val}`;
    }
  };



  // Función para formatear el período en el tooltip
  const formatPeriodLabel = (period: string, view: "month" | "week") => {
    if (view === "month") {
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    } else {
      const [yearStr, weekStr] = period.split('-');
      const year = parseInt(yearStr);
      const week = parseInt(weekStr);
      
      // Función para obtener el Lunes de una semana ISO
      const getDateOfISOWeek = (w: number, y: number) => {
          const simple = new Date(y, 0, 1 + (w - 1) * 7);
          const dow = simple.getDay();
          const ISOweekStart = simple;
          ISOweekStart.setDate(simple.getDate() - (dow === 0 ? 6 : dow - 1));
          return ISOweekStart;
      }

      const weekStart = getDateOfISOWeek(week, year);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const startFormat = weekStart.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
      const endFormat = weekEnd.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
      
      return `${startFormat} - ${endFormat}`;
    }
  };

  const renderReservationsTab = () => (
    <TabsContent value="reservas">
      {/* Estadísticas de Cancelación */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Estadísticas de Cancelación</CardTitle>
          <CardDescription>
            Análisis detallado de reservas canceladas y tasas de cancelación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Tasa de Cancelación
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {reservationsReports.cancellationStats.rate}%
              </p>
              <p className="text-xs text-muted-foreground">
                {reservationsReports.cancellationStats.cancelled} de{" "}
                {reservationsReports.cancellationStats.total} reservas
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Pendientes
              </p>
              <p className="text-3xl font-bold text-yellow-600">
                {reservationsReports.cancellationStats.pending}
              </p>
              <p className="text-xs text-muted-foreground">
                Esperando confirmación
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Confirmadas
              </p>
              <p className="text-3xl font-bold text-green-600">
                {reservationsReports.cancellationStats.confirmed}
              </p>
              <p className="text-xs text-muted-foreground">
                Reservas activas
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Finalizadas
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {reservationsReports.cancellationStats.finalized}
              </p>
              <p className="text-xs text-muted-foreground">
                Check-out completado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos de Reservas */}
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        {/* Reservas por Estado */}
        <Card>
          <CardHeader>
            <CardTitle>Reservas por Estado</CardTitle>
            <CardDescription>
              Distribución actual de todas las reservas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reservationsReports.reservationsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reservationsReports.reservationsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#8884d8">
                    {reservationsReports.reservationsByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.status] || "#8884d8"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ingresos por Tiempo */}
        {/* Ingresos por Tiempo */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Ingresos por Tiempo</CardTitle>
              <CardDescription>
                Evolución de ingresos confirmados y finalizados
              </CardDescription>
            </div>
            <Select value={revenueView} onValueChange={(v) => setRevenueView(v as "month" | "week")}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Por Mes</SelectItem>
                <SelectItem value="week">Por Semana</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  
                  {/* --- CAMBIOS AQUÍ --- */}
                  <XAxis 
                    dataKey="period"
                    tickFormatter={(value) => formatXAxisTick(value, revenueView)} // Eje X conciso
                  />
                  <YAxis 
                    width={80} // Ancho para que no se corten los números
                    tickFormatter={(value) => `$${formatCompactNumber(value)}`} // Eje Y compacto (100K, 1M)
                  />
                  <Tooltip
                    labelFormatter={(label) => formatPeriodLabel(label, revenueView)} // Tooltip con fecha completa
                    formatter={(value: number, name: string) => { // Tooltip con separador de miles
                      if (name === "Ingresos") {
                        return [`$${formatNumber(value)}`, name]; 
                      }
                      if (name === "Reservas") {
                        return [formatNumber(value), name];
                      }
                      return [value, name];
                    }}
                  />
                  {/* --- FIN DE CAMBIOS --- */}

                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#00C49F"
                    strokeWidth={2}
                    name="Ingresos"
                  />
                  <Line
                    type="monotone"
                    dataKey="reservations"
                    stroke="#8884D8"
                    strokeWidth={2}
                    name="Reservas"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );

  const renderRoomsTab = () => (
    <TabsContent value="habitaciones">
      {/* Métricas de Servicios Adicionales */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Desayuno Incluido
            </CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roomsReports.additionalServices.breakfast.rate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {roomsReports.additionalServices.breakfast.count} de{" "}
              {roomsReports.additionalServices.total} reservas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spa Incluido</CardTitle>
            <Waves className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roomsReports.additionalServices.spa.rate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {roomsReports.additionalServices.spa.count} de{" "}
              {roomsReports.additionalServices.total} reservas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ambos Servicios</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roomsReports.additionalServices.both}
            </div>
            <p className="text-xs text-muted-foreground">
              Desayuno + Spa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Promedio Huéspedes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roomsReports.avgGuestsPerReservation}
            </div>
            <p className="text-xs text-muted-foreground">
              Por reserva
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Habitaciones */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Reservas por Tipo de Habitación */}
        <Card>
          <CardHeader>
            <CardTitle>Reservas por Tipo de Habitación</CardTitle>
            <CardDescription>
              Distribución de reservas según el tipo de habitación
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roomsReports.reservationsByRoomType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roomsReports.reservationsByRoomType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roomsReports.reservationsByRoomType.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ocupación por Piso */}
        <Card>
          <CardHeader>
            <CardTitle>Ocupación por Piso</CardTitle>
            <CardDescription>
              Estado de habitaciones en cada piso del hotel
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roomsReports.floorOccupancy.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roomsReports.floorOccupancy}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="floor" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ocupadas" fill="#FF4444" name="Ocupadas" stackId="a" />
                  <Bar dataKey="limpieza" fill="#28f4ffd9" name="Limpieza" stackId="a" />
                  <Bar dataKey="mantenimiento" fill="#5903ecff" name="Mantenimiento" stackId="a" />
                  <Bar dataKey="disponibles" fill="#00c469ff" name="Disponibles" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );

  return (
    <div className="container mx-auto px-16 py-8">
      {/* Cabecera */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Dashboard de Gerencia</h1>
        <p className="text-muted-foreground">
          Resumen general del hotel y métricas clave
        </p>
      </div>

      {/* Stats Grid - Siempre visible */}
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

      {/* Tabs de Reportes */}
      <Tabs defaultValue="reservas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reservas">
            <Calendar className="mr-2 h-4 w-4" />
            Reservas
          </TabsTrigger>
          <TabsTrigger value="habitaciones">
            <Hotel className="mr-2 h-4 w-4" />
            Habitaciones
          </TabsTrigger>
        </TabsList>

        {renderReservationsTab()}
        {renderRoomsTab()}
      </Tabs>
    </div>
  );
}