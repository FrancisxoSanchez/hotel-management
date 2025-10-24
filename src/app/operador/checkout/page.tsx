"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Users, Check, ChevronRight, Loader2, AlertCircle, DoorClosed, DoorOpen } from "lucide-react"

interface Guest {
  id: string
  name: string
  dni: string
  email: string
  phone: string
}

interface ReservationData {
  id: string
  checkInDate: string
  checkOutDate: string
  status: string
  totalPrice: number
  includesBreakfast: boolean
  includesSpa: boolean
  room: {
    id: string
    status: string
    roomType: {
      id: string
      name: string
      images: string[]
      maxGuests: number
    }
  }
  guests: Guest[]
  user: {
    id: string
    name: string
    email: string
  }
}

export default function CheckoutPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [pendingCheckouts, setPendingCheckouts] = useState<ReservationData[]>([])
  const [completedCheckouts, setCompletedCheckouts] = useState<ReservationData[]>([])
  const [selectedReservation, setSelectedReservation] = useState<ReservationData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Cargar check-outs del día
  useEffect(() => {
    fetchTodayCheckouts()
  }, [])

  const fetchTodayCheckouts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/operador/checkout')
      if (!response.ok) {
        throw new Error('Error al cargar check-outs')
      }
      const data = await response.json()
      setPendingCheckouts(data.data.pending)
      setCompletedCheckouts(data.data.completed)
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmCheckout = async () => {
    if (!selectedReservation) return

    setIsProcessing(true)

    try {
      const response = await fetch('/api/operador/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservationId: selectedReservation.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al confirmar check-out')
      }

      toast({
        title: 'Check-out completado',
        description: `${data.data.guestName} ha finalizado su estadía. Habitación ${data.data.roomId} lista para limpieza`,
      })

      // Actualizar listas localmente
      setPendingCheckouts(prev => prev.filter(r => r.id !== selectedReservation.id))
      setCompletedCheckouts(prev => [...prev, { ...selectedReservation, status: 'finalizada' }])
      setSelectedReservation(null)

    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Error al confirmar check-out',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-[60vh] items-center justify-center px-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-16 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Check-out</h1>
        <p className="text-muted-foreground">Finaliza la estadía de huéspedes que se retiran hoy</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCheckouts.length + completedCheckouts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingCheckouts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCheckouts.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Lista de Check-outs */}
        <Card>
          <CardHeader>
            <CardTitle>Salidas de Hoy</CardTitle>
            <CardDescription>
              {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending">
                  Pendientes ({pendingCheckouts.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completados ({completedCheckouts.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-4">
                {pendingCheckouts.length === 0 ? (
                  <div className="py-12 text-center">
                    <DoorClosed className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No hay check-outs pendientes</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingCheckouts.map((reservation) => (
                      <button
                        key={reservation.id}
                        onClick={() => setSelectedReservation(reservation)}
                        className={`w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted ${
                          selectedReservation?.id === reservation.id ? "border-primary bg-muted" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <p className="font-medium">Hab. {reservation.room.id}</p>
                              <Badge variant="outline" className="text-amber-600 border-amber-600">
                                Pendiente
                              </Badge>
                            </div>
                            <p className="text-sm font-medium">{reservation.guests[0]?.name}</p>
                            <p className="text-xs text-muted-foreground">{reservation.room.roomType.name}</p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{reservation.guests.length} huésped{reservation.guests.length !== 1 ? 'es' : ''}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(reservation.checkOutDate), "HH:mm", { locale: es })}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-4">
                {completedCheckouts.length === 0 ? (
                  <div className="py-12 text-center">
                    <DoorOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No hay check-outs completados todavía</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedCheckouts.map((reservation) => (
                      <div
                        key={reservation.id}
                        className="rounded-lg border p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <p className="font-medium">Hab. {reservation.room.id}</p>
                              <Badge variant="default" className="bg-green-600">
                                <Check className="mr-1 h-3 w-3" />
                                Finalizado
                              </Badge>
                            </div>
                            <p className="text-sm font-medium">{reservation.guests[0]?.name}</p>
                            <p className="text-xs text-muted-foreground">{reservation.room.roomType.name}</p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{reservation.guests.length} huésped{reservation.guests.length !== 1 ? 'es' : ''}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Detalles del Check-out */}
        <div>
          {!selectedReservation ? (
            <Card>
              <CardContent className="flex min-h-[400px] items-center justify-center p-12">
                <div className="text-center">
                  <DoorClosed className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Selecciona una reserva pendiente para realizar el check-out</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Confirmar Check-out</CardTitle>
                <CardDescription>Finaliza la estadía del huésped</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Información de Huéspedes */}
                <div>
                  <h3 className="mb-3 font-semibold">Datos de los Huéspedes</h3>
                  <div className="space-y-3">
                    {selectedReservation.guests.map((guest, index) => (
                      <div key={guest.id} className="rounded-lg border p-3">
                        <p className="mb-1 font-medium">
                          {guest.name} {index === 0 && "(Titular)"}
                        </p>
                        <div className="grid gap-1 text-sm text-muted-foreground">
                          <p>DNI: {guest.dni}</p>
                          <p>Email: {guest.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Resumen de Estadía */}
                <div>
                  <h3 className="mb-3 font-semibold">Resumen de la Estadía</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Habitación:</span>
                      <span className="font-medium">
                        {selectedReservation.room.id} - {selectedReservation.room.roomType.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-in:</span>
                      <span className="font-medium">
                        {format(new Date(selectedReservation.checkInDate), "d MMM yyyy", { locale: es })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out:</span>
                      <span className="font-medium">
                        {format(new Date(selectedReservation.checkOutDate), "d MMM yyyy - HH:mm", { locale: es })}
                      </span>
                    </div>
                    {selectedReservation.includesBreakfast && (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Incluyó desayuno</span>
                      </div>
                    )}
                    {selectedReservation.includesSpa && (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Incluyó spa</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Resumen de Pagos */}
                <div>
                  <h3 className="mb-3 font-semibold">Resumen de Pagos</h3>
                  <div className="space-y-2 rounded-lg bg-green-50 p-4 dark:bg-green-950">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-900 dark:text-green-100">Total de la estadía:</span>
                      <span className="font-medium text-green-900 dark:text-green-100">
                        ${selectedReservation.totalPrice.toLocaleString()}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-green-900 dark:text-green-100">Estado:</span>
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="font-bold text-green-600 dark:text-green-400">Totalmente pagado</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Al confirmar el check-out, la habitación {selectedReservation.room.id} se marcará como "en limpieza" y la reserva como "finalizada"
                  </AlertDescription>
                </Alert>

                <Button onClick={handleConfirmCheckout} className="w-full" size="lg" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Confirmar Check-out
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}