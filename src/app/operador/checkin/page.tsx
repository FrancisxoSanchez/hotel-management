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
import { Calendar, Users, Check, ChevronRight, Loader2, AlertCircle, BedDouble, Clock } from "lucide-react"

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

export default function CheckinPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [pendingReservations, setPendingReservations] = useState<ReservationData[]>([])
  const [confirmedReservations, setConfirmedReservations] = useState<ReservationData[]>([])
  const [selectedReservation, setSelectedReservation] = useState<ReservationData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Cargar check-ins del día
  useEffect(() => {
    fetchTodayCheckins()
  }, [])

  const fetchTodayCheckins = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/operador/checkin')
      if (!response.ok) {
        throw new Error('Error al cargar check-ins')
      }
      const data = await response.json()
      setPendingReservations(data.data.pending)
      setConfirmedReservations(data.data.confirmed)
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

  const handleConfirmCheckin = async () => {
    if (!selectedReservation) return

    setIsProcessing(true)

    try {
      const response = await fetch('/api/operador/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservationId: selectedReservation.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al confirmar check-in')
      }

      toast({
        title: 'Check-in confirmado',
        description: `${data.data.guestName} ha sido registrado en la habitación ${data.data.roomId}`,
      })

      // Actualizar listas localmente
      setPendingReservations(prev => prev.filter(r => r.id !== selectedReservation.id))
      setConfirmedReservations(prev => [...prev, { ...selectedReservation, status: 'confirmada' }])
      setSelectedReservation(null)

    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Error al confirmar check-in',
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
        <h1 className="mb-2 text-3xl font-bold">Check-in</h1>
        <p className="text-muted-foreground">Registra la llegada de huéspedes programados para hoy</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReservations.length + confirmedReservations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingReservations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedReservations.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Lista de Reservas */}
        <Card>
          <CardHeader>
            <CardTitle>Llegadas de Hoy</CardTitle>
            <CardDescription>
              {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending">
                  Pendientes ({pendingReservations.length})
                </TabsTrigger>
                <TabsTrigger value="confirmed">
                  Confirmados ({confirmedReservations.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-4">
                {pendingReservations.length === 0 ? (
                  <div className="py-12 text-center">
                    <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No hay check-ins pendientes</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingReservations.map((reservation) => (
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
                                <span>{format(new Date(reservation.checkInDate), "HH:mm", { locale: es })}</span>
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

              <TabsContent value="confirmed" className="mt-4">
                {confirmedReservations.length === 0 ? (
                  <div className="py-12 text-center">
                    <BedDouble className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No hay check-ins confirmados todavía</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {confirmedReservations.map((reservation) => (
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
                                Confirmado
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

        {/* Detalles del Check-in */}
        <div>
          {!selectedReservation ? (
            <Card>
              <CardContent className="flex min-h-[400px] items-center justify-center p-12">
                <div className="text-center">
                  <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Selecciona una reserva pendiente para realizar el check-in</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Confirmar Check-in</CardTitle>
                <CardDescription>Verifica los datos antes de confirmar</CardDescription>
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
                          <p>Teléfono: {guest.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Detalles de Reserva */}
                <div>
                  <h3 className="mb-3 font-semibold">Detalles de la Reserva</h3>
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
                        {format(new Date(selectedReservation.checkInDate), "d MMM yyyy - HH:mm", { locale: es })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out:</span>
                      <span className="font-medium">
                        {format(new Date(selectedReservation.checkOutDate), "d MMM yyyy", { locale: es })}
                      </span>
                    </div>
                    {selectedReservation.includesBreakfast && (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Incluye desayuno</span>
                      </div>
                    )}
                    {selectedReservation.includesSpa && (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Incluye spa</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Estado del Pago */}
                <div>
                  <h3 className="mb-3 font-semibold">Estado del Pago</h3>
                  <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-100">Pago completado</p>
                        <p className="text-green-700 dark:text-green-300">
                          Total pagado: ${selectedReservation.totalPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Al confirmar, la habitación {selectedReservation.room.id} se marcará como "ocupada"
                  </AlertDescription>
                </Alert>

                <Button onClick={handleConfirmCheckin} className="w-full" size="lg" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Confirmar Check-in
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