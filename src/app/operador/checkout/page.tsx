"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { mockReservations, mockRooms } from "@/lib/mock-data"
import type { Reservation } from "@/lib/types"
import { format, isToday } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Users, Check, ChevronRight, DoorClosed } from "lucide-react"

export default function CheckoutPage() {
  const { toast } = useToast()
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const todayCheckouts = mockReservations.filter((r) => r.status === "confirmada" && isToday(r.checkOutDate))

  const handleConfirmCheckout = async () => {
    if (!selectedReservation) return

    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    selectedReservation.status = "finalizada"

    toast({
      title: "Check-out completado",
      description: "La estadía ha sido finalizada exitosamente",
    })

    setSelectedReservation(null)
    setIsProcessing(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Check-out</h1>
        <p className="text-muted-foreground">Finaliza la estadía de huéspedes que se retiran hoy</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Checkouts List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Salidas de Hoy</CardTitle>
              <CardDescription>{todayCheckouts.length} check-outs programados</CardDescription>
            </CardHeader>
            <CardContent>
              {todayCheckouts.length === 0 ? (
                <div className="py-12 text-center">
                  <DoorClosed className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No hay check-outs programados para hoy</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayCheckouts.map((reservation) => {
                    const room = mockRooms.find((r) => r.id === reservation.roomId)
                    return (
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
                              <p className="font-medium">{room?.name}</p>
                              <Badge variant="default">Confirmada</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{reservation.guests[0]?.name}</p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{reservation.guests.length} huéspedes</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(reservation.checkOutDate, "HH:mm", { locale: es })}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Checkout Details */}
        <div>
          {!selectedReservation ? (
            <Card>
              <CardContent className="flex min-h-[400px] items-center justify-center p-12">
                <div className="text-center">
                  <DoorClosed className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Selecciona una reserva para realizar el check-out</p>
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
                {/* Guest Information */}
                <div>
                  <h3 className="mb-3 font-semibold">Datos de los Huéspedes</h3>
                  <div className="space-y-3">
                    {selectedReservation.guests.map((guest, index) => (
                      <div key={index} className="rounded-lg border p-3">
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

                {/* Reservation Summary */}
                <div>
                  <h3 className="mb-3 font-semibold">Resumen de la Estadía</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Habitación:</span>
                      <span className="font-medium">
                        {mockRooms.find((r) => r.id === selectedReservation.roomId)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-in:</span>
                      <span className="font-medium">
                        {format(selectedReservation.checkInDate, "d MMM yyyy", { locale: es })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out:</span>
                      <span className="font-medium">
                        {format(selectedReservation.checkOutDate, "d MMM yyyy", { locale: es })}
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

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    Al confirmar el check-out, la habitación quedará disponible para nuevas reservas y la estadía se
                    marcará como finalizada.
                  </p>
                </div>

                <Button onClick={handleConfirmCheckout} className="w-full" size="lg" disabled={isProcessing}>
                  {isProcessing ? (
                    "Procesando..."
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
