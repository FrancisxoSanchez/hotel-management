"use client"

import { useState, useEffect } from "react"
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
import { Calendar, Users, CreditCard, X, Loader2, Home } from "lucide-react"

interface ReservationData {
  id: string
  checkInDate: string
  checkOutDate: string
  status: "pendiente" | "confirmada" | "finalizada" | "cancelada"
  totalPrice: number
  depositPaid: number
  includesBreakfast: boolean
  includesSpa: boolean
  createdAt: string
  cancelledAt: string | null
  room: {
    id: string
    roomType: {
      name: string
      images: string[]
    }
  }
  guests: Array<{
    id: string
    name: string
    dni: string
    email: string
    phone: string
  }>
}

export default function MisReservasPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { toast } = useToast()
  const [reservations, setReservations] = useState<ReservationData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  // Cargar reservas del usuario
  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const fetchReservations = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/cliente/mis-reservas?userId=${user.id}`)
        
        if (!response.ok) {
          throw new Error('Error al cargar las reservas')
        }

        const result = await response.json()
        setReservations(result.data || [])
      } catch (error: any) {
        console.error('[FETCH_RESERVATIONS_ERROR]', error)
        toast({
          title: "Error",
          description: error.message || "No se pudieron cargar las reservas",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservations()
  }, [user, toast])

  const handleCancelReservation = async (reservationId: string) => {
    if (!user) return

    setIsCancelling(true)
    try {
      const response = await fetch('/api/cliente/mis-reservas', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId,
          userId: user.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cancelar la reserva')
      }

      toast({
        title: "Reserva cancelada",
        description: "Tu reserva ha sido cancelada exitosamente",
      })

      // Actualizar la lista de reservas
      setReservations(prev => 
        prev.map(r => 
          r.id === reservationId 
            ? { ...r, status: 'cancelada' as const, cancelledAt: new Date().toISOString() }
            : r
        )
      )

      setCancellingId(null)
    } catch (error: any) {
      console.error('[CANCEL_RESERVATION_ERROR]', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo cancelar la reserva",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const getStatusBadge = (status: ReservationData["status"]) => {
    const variants = {
      pendiente: { variant: "secondary" as const, label: "Pendiente" },
      confirmada: { variant: "default" as const, label: "Confirmada" },
      finalizada: { variant: "outline" as const, label: "Finalizada" },
      cancelada: { variant: "destructive" as const, label: "Cancelada" },
    }
    const config = variants[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  // Loading state
  if (isAuthLoading || isLoading) {
    return (
      <div className="container mx-auto flex h-[60vh] items-center justify-center px-4 py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-16 py-12">
        <Card className="p-12 text-center">
          <CardHeader>
            <CardTitle>Debes iniciar sesión</CardTitle>
            <CardDescription>
              Inicia sesión para ver tus reservas
            </CardDescription>
          </CardHeader>
          <Button asChild className="mt-4">
            <a href="/login">Iniciar sesión</a>
          </Button>
        </Card>
      </div>
    )
  }

  // No reservations
  if (reservations.length === 0) {
    return (
      <div className="container mx-auto px-16 py-12">
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
    <div className="container mx-auto px-16 py-12">
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
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    {reservation.room.roomType.name} - Habitación {reservation.room.id}
                  </CardTitle>
                  <CardDescription>
                    Creada el {format(new Date(reservation.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
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
                      {format(new Date(reservation.checkInDate), "d MMM yyyy", { locale: es })}
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
                      {format(new Date(reservation.checkOutDate), "d MMM yyyy", { locale: es })}
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

              {reservation.status === "cancelada" && reservation.cancelledAt && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                  <p className="text-sm text-red-900 dark:text-red-100">
                    Cancelada el {format(new Date(reservation.cancelledAt), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              {reservation.status === "pendiente" && (
                <Button 
                  variant="destructive" 
                  onClick={() => setCancellingId(reservation.id)}
                  disabled={isCancelling}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar Reserva
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!cancellingId} onOpenChange={() => !isCancelling && setCancellingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se te reembolsará según nuestra política de cancelación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>No, mantener reserva</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => cancellingId && handleCancelReservation(cancellingId)}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Sí, cancelar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}