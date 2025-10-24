"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format, differenceInDays, isValid } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import type { RoomDetailData } from "@/prisma/detallehabitacion"
import {
  BREAKFAST_PRICE_PER_NIGHT_PER_GUEST,
  SPA_PRICE_PER_GUEST,
} from "@/lib/constant"
import { ArrowLeft, ArrowRight, CalendarIcon, CreditCard, Check, Loader2, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface GuestInput {
  name: string;
  dni: string;
  email: string;
  phone: string;
}

function ReservarPageComponent({ roomTypeId }: { roomTypeId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: isAuthLoading } = useAuth()
  const { toast } = useToast()

  const [room, setRoom] = useState<RoomDetailData | null>(null)
  const [isLoadingRoom, setIsLoadingRoom] = useState(true)
  const [step, setStep] = useState(1)
  
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(() => {
    const checkIn = searchParams.get("checkIn")
    const date = checkIn ? new Date(checkIn) : undefined;
    return date && isValid(date) ? date : undefined;
  })
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(() => {
    const checkOut = searchParams.get("checkOut")
    const date = checkOut ? new Date(checkOut) : undefined;
    return date && isValid(date) ? date : undefined;
  })
  
  const [guestCount, setGuestCount] = useState(1)
  const [guests, setGuests] = useState<Partial<GuestInput>[]>([
    { name: "", dni: "", email: "", phone: "" },
  ])
  const [includesBreakfast, setIncludesBreakfast] = useState(false)
  const [includesSpa, setIncludesSpa] = useState(false)
  
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Cargar datos de la habitación desde la API
  useEffect(() => {
    if (roomTypeId) {
      setIsLoadingRoom(true)
      fetch(`/api/cliente/habitaciones/${roomTypeId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Habitación no encontrada o no disponible")
          }
          return res.json()
        })
        .then((data: RoomDetailData) => {
          setRoom(data)
          if (data.maxGuests < guestCount) {
             setGuestCount(data.maxGuests)
          }
        })
        .catch((err) => {
          console.error(err)
          toast({
            title: "Error",
            description: err.message,
            variant: "destructive",
          })
          setRoom(null)
        })
        .finally(() => {
          setIsLoadingRoom(false)
        })
    }
  }, [roomTypeId, toast])

  const calculateTotal = () => {
    if (!room || !checkInDate || !checkOutDate || checkOutDate <= checkInDate) return 0
    
    const nights = differenceInDays(checkOutDate, checkInDate)
    if (nights <= 0) return 0;

    let total = room.basePrice * nights
    
    if (includesBreakfast) {
      total += BREAKFAST_PRICE_PER_NIGHT_PER_GUEST * nights * guestCount
    }
    if (includesSpa) {
      total += SPA_PRICE_PER_GUEST * guestCount
    }
    return total
  }

  const totalPrice = calculateTotal()

  const handleStep1Next = () => {
    if (!checkInDate || !checkOutDate) {
      toast({
        title: "Error",
        description: "Por favor selecciona las fechas de tu estadía",
        variant: "destructive",
      })
      return
    }
    
    if (checkOutDate <= checkInDate) {
      toast({
        title: "Error",
        description: "La fecha de salida debe ser posterior a la de entrada",
        variant: "destructive",
      })
      return
    }

    if (guestCount > room!.maxGuests) {
      toast({
        title: "Error",
        description: `Esta habitación permite máximo ${room!.maxGuests} huéspedes`,
        variant: "destructive",
      })
      return
    }

    if (guestCount < 1) {
      toast({
        title: "Error",
        description: "Debe haber al menos 1 huésped",
        variant: "destructive",
      })
      return
    }

    setGuests(
      Array.from({ length: guestCount }, () => ({
        name: "",
        dni: "",
        email: "",
        phone: "",
      }))
    )
    setStep(2)
  }

  const handleStep2Next = () => {
    for (let i = 0; i < guests.length; i++) {
      const guest = guests[i]
      if (!guest.name || !guest.dni || !guest.email || !guest.phone) {
        toast({
          title: "Error",
          description: `Por favor completa todos los datos del huésped ${i + 1}`,
          variant: "destructive",
        })
        return
      }
    }
    setStep(3)
  }

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para completar la reserva",
        variant: "destructive",
      })
      return;
    }

    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      toast({
        title: "Error",
        description: "Por favor completa todos los datos de pago",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const reservationData = {
      userId: user.id,
      roomTypeId: room!.id,
      checkIn: checkInDate!.toISOString(),
      checkOut: checkOutDate!.toISOString(),
      guests: guests as GuestInput[],
      includesBreakfast: includesBreakfast,
      includesSpa: includesSpa,
      totalPrice: totalPrice,
    }

    try {
      const response = await fetch("/api/cliente/reservar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "No se pudo crear la reserva")
      }

      const result = await response.json()

      toast({
        title: "¡Reserva exitosa!",
        description: `Se te asignó la habitación ${result.reservation.roomId}. Redirigiendo...`,
      })

      router.push("/cliente/mis-reservas")

    } catch (error: any) {
      console.error("[RESERVATION_SUBMIT_ERROR]", error)
      toast({
        title: "Error al reservar",
        description: error.message || "Ocurrió un problema. Intenta de nuevo.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  const updateGuest = (index: number, field: keyof GuestInput, value: string) => {
    const newGuests = [...guests]
    newGuests[index] = { ...newGuests[index], [field]: value }
    setGuests(newGuests)
  }

  if (isLoadingRoom || isAuthLoading) {
    return (
      <div className="container mx-auto flex h-[60vh] items-center justify-center px-4 py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="container mx-auto px-16 py-12">
        <Card className="p-12 text-center">
          <CardHeader>
            <CardTitle>Habitación no encontrada</CardTitle>
            <CardDescription>
              La habitación que buscas no existe o no está disponible.
            </CardDescription>
          </CardHeader>
          <Button
            onClick={() => router.push("/cliente/habitaciones")}
            variant="outline"
            className="mt-4"
          >
            Volver a habitaciones
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-16 py-12">
      <Button
        onClick={() => (step === 1 ? router.back() : setStep(step - 1))}
        variant="ghost"
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {step === 1 ? "Volver" : "Paso anterior"}
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold">Reservar Habitación</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={cn("font-medium", step >= 1 && "text-primary")}>
                1. Fechas y huéspedes
              </span>
              <span>→</span>
              <span className={cn("font-medium", step >= 2 && "text-primary")}>
                2. Datos de huéspedes
              </span>
              <span>→</span>
              <span className={cn("font-medium", step >= 3 && "text-primary")}>
                3. Pago
              </span>
            </div>
          </div>

          {/* Paso 1 */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Selecciona fechas y cantidad de huéspedes</CardTitle>
                <CardDescription>
                  Elige las fechas de tu estadía y cuántas personas se hospedarán
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Se te asignará automáticamente una habitación disponible al confirmar la reserva
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Fecha de entrada</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !checkInDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkInDate ? format(checkInDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkInDate}
                          onSelect={setCheckInDate}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de salida</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !checkOutDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOutDate ? format(checkOutDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkOutDate}
                          onSelect={setCheckOutDate}
                          disabled={(date) => !checkInDate || date <= checkInDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestCount">Cantidad de huéspedes</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    >
                      -
                    </Button>
                    <Input
                      id="guestCount"
                      type="number"
                      min={1}
                      max={room.maxGuests}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Math.max(1, Math.min(room.maxGuests, Number.parseInt(e.target.value) || 1)))}
                      className="w-20 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setGuestCount(Math.min(room.maxGuests, guestCount + 1))
                      }
                    >
                      +
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Máximo: {room.maxGuests}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Servicios adicionales</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="breakfast"
                      checked={includesBreakfast}
                      onCheckedChange={(checked) =>
                        setIncludesBreakfast(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="breakfast"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Incluir desayuno buffet (+${BREAKFAST_PRICE_PER_NIGHT_PER_GUEST.toLocaleString()} por persona por noche)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="spa"
                      checked={includesSpa}
                      onCheckedChange={(checked) =>
                        setIncludesSpa(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="spa"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Incluir acceso al spa (+${SPA_PRICE_PER_GUEST.toLocaleString()} por persona)
                    </label>
                  </div>
                </div>

                <Button onClick={handleStep1Next} className="w-full" size="lg">
                  Continuar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Paso 2 */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Datos de los huéspedes</CardTitle>
                <CardDescription>
                  Ingresa la información de cada persona que se hospedará
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {guests.map((guest, index) => (
                  <div key={index} className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">
                      Huésped {index + 1} {index === 0 && "(Titular)"}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${index}`}>Nombre completo</Label>
                        <Input
                          id={`name-${index}`}
                          value={guest.name}
                          onChange={(e) =>
                            updateGuest(index, "name", e.target.value)
                          }
                          placeholder="Juan Pérez"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`dni-${index}`}>DNI / Pasaporte</Label>
                        <Input
                          id={`dni-${index}`}
                          value={guest.dni}
                          onChange={(e) =>
                            updateGuest(index, "dni", e.target.value)
                          }
                          placeholder="12345678"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`email-${index}`}>Email</Label>
                        <Input
                          id={`email-${index}`}
                          type="email"
                          value={guest.email}
                          onChange={(e) =>
                            updateGuest(index, "email", e.target.value)
                          }
                          placeholder="juan@email.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`phone-${index}`}>Teléfono</Label>
                        <Input
                          id={`phone-${index}`}
                          type="tel"
                          value={guest.phone}
                          onChange={(e) =>
                            updateGuest(index, "phone", e.target.value)
                          }
                          placeholder="+54 11 1234-5678"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button onClick={handleStep2Next} className="w-full" size="lg">
                  Continuar al pago
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Paso 3 */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Pago Total</CardTitle>
                <CardDescription>
                  Completa el pago de ${totalPrice.toLocaleString('es-AR')} para confirmar tu
                  reserva.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número de tarjeta</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nombre en la tarjeta</Label>
                    <Input
                      id="cardName"
                      placeholder="JUAN PEREZ"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cardExpiry">Vencimiento</Label>
                      <Input
                        id="cardExpiry"
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardCvv">CVV</Label>
                      <Input
                        id="cardCvv"
                        type="password"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Pago seguro encriptado</span>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando pago...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pagar ${totalPrice.toLocaleString('es-AR')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar de Resumen */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Resumen de reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative h-48 overflow-hidden rounded-lg">
                <img
                  src={room.images[0] || 'https://placehold.co/600x400/EEE/333?text=Habitacion'}
                  alt={room.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div>
                <h3 className="font-semibold">{room.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Hasta {room.maxGuests} huéspedes
                </p>
              </div>

              <Separator />

              {checkInDate && checkOutDate && differenceInDays(checkOutDate, checkInDate) > 0 ? (
                <>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-in:</span>
                      <span className="font-medium">
                        {format(checkInDate, "d MMM yyyy", { locale: es })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out:</span>
                      <span className="font-medium">
                        {format(checkOutDate, "d MMM yyyy", { locale: es })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Noches:</span>
                      <span className="font-medium">
                        {differenceInDays(checkOutDate, checkInDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Huéspedes:</span>
                      <span className="font-medium">{guestCount}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Habitación:</span>
                      <span className="font-medium">
                        ${(room.basePrice * differenceInDays(checkOutDate, checkInDate)).toLocaleString('es-AR')}
                      </span>
                    </div>
                    {includesBreakfast && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Desayuno:</span>
                        <span className="font-medium">
                          $
                          {(
                            BREAKFAST_PRICE_PER_NIGHT_PER_GUEST *
                            differenceInDays(checkOutDate, checkInDate) *
                            guestCount
                          ).toLocaleString('es-AR')}
                        </span>
                      </div>
                    )}
                    {includesSpa && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Spa:</span>
                        <span className="font-medium">
                          ${(SPA_PRICE_PER_GUEST * guestCount).toLocaleString('es-AR')}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total a pagar:</span>
                      <span className="text-primary">${totalPrice.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </>
              ) : (
                 <p className="text-sm text-muted-foreground">
                    Selecciona tus fechas para ver el resumen del precio.
                 </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ReservarPageWrapper({ params }: { params: Promise<{ id: string }> }) {
  const [roomTypeId, setRoomTypeId] = useState<string | null>(null)

  useEffect(() => {
    params.then(resolvedParams => {
      setRoomTypeId(resolvedParams.id)
    })
  }, [params])

  if (!roomTypeId) {
    return (
      <div className="container mx-auto flex h-[60vh] items-center justify-center px-4 py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div className="container mx-auto flex h-[60vh] items-center justify-center px-4 py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <ReservarPageComponent roomTypeId={roomTypeId} />
    </Suspense>
  )
}