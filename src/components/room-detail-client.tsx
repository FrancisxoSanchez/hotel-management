"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { differenceInDays, format, isValid } from "date-fns"
import { es } from "date-fns/locale"
import type { RoomDetailData } from "@/prisma/detallehabitacion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Users, Check, Coffee, Sparkles, Calendar, Loader2, AlertCircle } from "lucide-react"

interface RoomDetailClientProps {
  room: RoomDetailData
  checkIn?: string
  checkOut?: string
}

export function RoomDetailClient({ room, checkIn, checkOut }: RoomDetailClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [availabilityInfo, setAvailabilityInfo] = useState<{
    available: boolean
    count: number
    loading: boolean
    error: string | null
  }>({
    available: true,
    count: 0,
    loading: false,
    error: null,
  })

  // Parsear fechas de la URL
  const checkInDate = checkIn ? new Date(checkIn) : undefined
  const checkOutDate = checkOut ? new Date(checkOut) : undefined
  const hasValidDates = checkInDate && checkOutDate && isValid(checkInDate) && isValid(checkOutDate)
  const nights = hasValidDates ? differenceInDays(checkOutDate, checkInDate) : 0

  // Verificar disponibilidad si hay fechas
  useEffect(() => {
    if (!hasValidDates) {
      setAvailabilityInfo({
        available: true,
        count: 0,
        loading: false,
        error: null,
      })
      return
    }

    const checkAvailability = async () => {
      setAvailabilityInfo(prev => ({ ...prev, loading: true, error: null }))

      try {
        const params = new URLSearchParams({
          checkIn: checkInDate!.toISOString(),
          checkOut: checkOutDate!.toISOString(),
        })

        const response = await fetch(`/api/cliente/habitaciones/${room.id}/availability?${params}`)
        
        if (!response.ok) {
          throw new Error('Error al verificar disponibilidad')
        }

        const data = await response.json()
        
        setAvailabilityInfo({
          available: data.available,
          count: data.availableCount,
          loading: false,
          error: null,
        })

      } catch (error: any) {
        console.error('[AVAILABILITY_CHECK_ERROR]', error)
        setAvailabilityInfo({
          available: false,
          count: 0,
          loading: false,
          error: error.message,
        })
      }
    }

    checkAvailability()
    // Solo dependencias primitivas para evitar loops
  }, [room.id, checkIn, checkOut])

  const handleReserveClick = () => {
    let reserveUrl = `/cliente/reservar/${room.id}`
    
    if (checkIn && checkOut) {
      reserveUrl += `?checkIn=${checkIn}&checkOut=${checkOut}`
    }
    window.location.href = reserveUrl
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      {/* Back Button */}
      <Button onClick={() => window.history.back()} variant="ghost" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      {/* Información de estadía si hay fechas */}
      {hasValidDates && nights > 0 && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Tu estadía</p>
                <p className="text-lg font-semibold">
                  {format(checkInDate!, "d 'de' MMMM", { locale: es })} - {format(checkOutDate!, "d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {nights} {nights === 1 ? 'noche' : 'noches'}
                </p>
              </div>
            </div>

            {availabilityInfo.loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">Verificando...</span>
              </div>
            ) : availabilityInfo.error ? (
              <Alert variant="destructive" className="w-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">Error al verificar disponibilidad</AlertDescription>
              </Alert>
            ) : availabilityInfo.available ? (
              <Badge variant="default" className="text-base px-4 py-2">
                <Check className="mr-2 h-4 w-4" />
                {availabilityInfo.count} {availabilityInfo.count === 1 ? 'habitación disponible' : 'habitaciones disponibles'}
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-base px-4 py-2">
                <AlertCircle className="mr-2 h-4 w-4" />
                No disponible
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative h-[400px] w-full overflow-hidden rounded-lg lg:h-[500px]">
            <Image
              src={room.images[currentImageIndex] || "/placeholder.svg"}
              alt={room.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {room.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative h-24 overflow-hidden rounded-lg border-2 transition-all ${
                  currentImageIndex === index ? "border-primary" : "border-transparent"
                }`}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${room.name} - ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Room Details */}
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-start justify-between">
              <h1 className="text-3xl font-bold">{room.name}</h1>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Hasta {room.maxGuests} {room.maxGuests === 1 ? "huésped" : "huéspedes"}
              </Badge>
            </div>
            <p className="text-pretty text-lg text-muted-foreground">{room.description}</p>
          </div>

          <Separator />

          {/* Price */}
          <Card>
            <CardHeader>
              <CardTitle>Precio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">${room.basePrice.toLocaleString()}</span>
                  <span className="text-muted-foreground">por noche</span>
                </div>
                
                {hasValidDates && nights > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          ${room.basePrice.toLocaleString()} × {nights} {nights === 1 ? 'noche' : 'noches'}
                        </span>
                        <span className="font-medium">${(room.basePrice * nights).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        * Precio base. Servicios adicionales se agregan en el siguiente paso.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features/Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Comodidades</CardTitle>
              <CardDescription>Esta habitación cuenta con las siguientes comodidades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {room.features && room.features.length > 0 ? (
                  room.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Esta habitación no tiene comodidades destacadas.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Servicios Base (Incluidos/Opcionales) */}
          <Card>
            <CardHeader>
              <CardTitle>Servicios</CardTitle>
              <CardDescription>
                {room.includesBreakfast || room.includesSpa 
                  ? "Servicios incluidos con este tipo de habitación"
                  : "Servicios disponibles para agregar a tu reserva"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Coffee className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium">Desayuno Buffet</p>
                    <p className="text-sm text-muted-foreground">Incluye buffet completo</p>
                  </div>
                </div>
                <Badge variant={room.includesBreakfast ? "default" : "outline"}>
                  {room.includesBreakfast ? "Incluido" : "Opcional"}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium">Servicio de Spa</p>
                    <p className="text-sm text-muted-foreground">Acceso al spa y tratamientos</p>
                  </div>
                </div>
                <Badge variant={room.includesSpa ? "default" : "outline"}>
                  {room.includesSpa ? "Incluido" : "Opcional"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={handleReserveClick} 
              size="lg" 
              className="flex-1"
              disabled={hasValidDates && !availabilityInfo.available}
            >
              {hasValidDates && !availabilityInfo.available ? 'No Disponible' : 'Reservar Ahora'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}