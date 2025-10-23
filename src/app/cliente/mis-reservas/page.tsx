"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { useAuth } from "@/lib/auth-context"
import { mockReservations } from "@/lib/mock-data"
import type { Reservation } from "@/lib/types"
import { Calendar, Users, CreditCard, X } from "lucide-react"

export default function MisReservasPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [reservations] = useState<Reservation[]>(
    mockReservations.filter((r) => r.userId === user?.id && r.status !== "cancelada"),
  )
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const handleCancelReservation = (reservationId: string) => {
    // Simulate cancellation
    toast({
      title: "Reserva cancelada",
      description: "Tu reserva ha sido cancelada exitosamente",
    })
    setCancellingId(null)
  }

  const getStatusBadge = (status: Reservation["status"]) => {
    const variants = {
      pendiente: { variant: "secondary" as const, label: "Pendiente" },
      confirmada: { variant: "default" as const, label: "Confirmada" },
      finalizada: { variant: "outline" as const, label: "Finalizada" },
      cancelada: { variant: "destructive" as const, label: "Cancelada" },
    }
    const config = variants[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (reservations.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Mis Reservas</h1>
          <p className="text-muted-foreground">Gestiona tus reservas actuales y pasadas</p>
        </div>

        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No tienes reservas</h3>
          <p className="mb-6 text-muted-foreground">
            Comienza a explorar nuestras habitaciones y haz tu primera reserva
          </p>
          <Button asChild>
            <a href="/cliente/habitaciones">Ver Habitaciones</a>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Mis Reservas</h1>
        <p className="text-muted-foreground">Gestiona tus reservas actuales y pasadas</p>
      </div>

      <div className="space-y-6">
        {reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Reserva #{reservation.id}</CardTitle>
                  <CardDescription>
                    Creada el {format(reservation.createdAt, "d 'de' MMMM, yyyy", { locale: es })}
                  </CardDescription>
                </div>
                {getStatusBadge(reservation.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Check-in</p>
                    <p className="text-sm text-muted-foreground">
                      {format(reservation.checkInDate, "d MMM yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Check-out</p>
                    <p className="text-sm text-muted-foreground">
                      {format(reservation.checkOutDate, "d MMM yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Huéspedes</p>
                    <p className="text-sm text-muted-foreground">{reservation.guests.length} personas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total</p>
                    <p className="text-sm text-muted-foreground">${reservation.totalPrice.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {reservation.status === "pendiente" && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    <strong>Pago completado:</strong> ${reservation.depositPaid.toLocaleString()}
                    <br />
                    Tu reserva está confirmada y totalmente pagada.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              {reservation.status === "pendiente" && (
                <Button variant="destructive" onClick={() => setCancellingId(reservation.id)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar Reserva
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!cancellingId} onOpenChange={() => setCancellingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se te reembolsará según nuestra política de cancelación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener reserva</AlertDialogCancel>
            <AlertDialogAction onClick={() => cancellingId && handleCancelReservation(cancellingId)}>
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
