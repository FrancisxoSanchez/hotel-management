"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { format, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { mockRooms, mockReservations } from "@/lib/mock-data"
import type { Guest } from "@/lib/types"
import { ArrowLeft, ArrowRight, CalendarIcon, CreditCard, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const BREAKFAST_PRICE = 2000
const SPA_PRICE = 5000

export default function ReservarPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const room = mockRooms.find((r) => r.id === params.id)

  const [step, setStep] = useState(1)
  const [guestCount, setGuestCount] = useState(1)
  const [checkInDate, setCheckInDate] = useState<Date>()
  const [checkOutDate, setCheckOutDate] = useState<Date>()
  const [guests, setGuests] = useState<Partial<Guest>[]>([{ name: "", dni: "", email: "", phone: "" }])
  const [includesBreakfast, setIncludesBreakfast] = useState(false)
  const [includesSpa, setIncludesSpa] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-12 text-center">
          <p className="text-lg text-muted-foreground">Habitación no encontrada</p>
          <Button onClick={() => router.push("/cliente/habitaciones")} variant="outline" className="mt-4">
            Volver a habitaciones
          </Button>
        </Card>
      </div>
    )
  }

  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate) return 0
    const nights = differenceInDays(checkOutDate, checkInDate)
    let total = room.basePrice * nights
    if (includesBreakfast) total += BREAKFAST_PRICE * nights * guestCount
    if (includesSpa) total += SPA_PRICE * guestCount
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

    if (guestCount > room.maxGuests) {
      toast({
        title: "Error",
        description: `Esta habitación permite máximo ${room.maxGuests} huéspedes`,
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

    // Initialize guests array
    setGuests(Array.from({ length: guestCount }, () => ({ name: "", dni: "", email: "", phone: "" })))
    setStep(2)
  }

  const handleStep2Next = () => {
    // Validate all guests have required data
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
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      toast({
        title: "Error",
        description: "Por favor completa todos los datos de pago",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create reservation
    const newReservation = {
      id: Date.now().toString(),
      roomId: room.id,
      userId: user!.id,
      guests: guests as Guest[],
      checkInDate: checkInDate!,
      checkOutDate: checkOutDate!,
      status: "pendiente" as const,
      totalPrice,
      depositPaid: totalPrice, // Ahora se paga el total completo
      includesBreakfast,
      includesSpa,
      createdAt: new Date(),
    }

    mockReservations.push(newReservation)

    toast({
      title: "¡Reserva exitosa!",
      description: "Tu reserva ha sido confirmada",
    })

    setIsProcessing(false)
    router.push("/cliente/mis-reservas")
  }

  const updateGuest = (index: number, field: keyof Guest, value: string) => {
    const newGuests = [...guests]
    newGuests[index] = { ...newGuests[index], [field]: value }
    setGuests(newGuests)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Button onClick={() => (step === 1 ? router.back() : setStep(step - 1))} variant="ghost" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {step === 1 ? "Volver" : "Paso anterior"}
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold">Reservar Habitación</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={cn("font-medium", step >= 1 && "text-primary")}>1. Fechas y huéspedes</span>
              <span>→</span>
              <span className={cn("font-medium", step >= 2 && "text-primary")}>2. Datos de huéspedes</span>
              <span>→</span>
              <span className={cn("font-medium", step >= 3 && "text-primary")}>3. Pago</span>
            </div>
          </div>

          {/* Step 1: Dates and Guest Count */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Selecciona fechas y cantidad de huéspedes</CardTitle>
                <CardDescription>Elige las fechas de tu estadía y cuántas personas se hospedarán</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Fecha de entrada</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !checkInDate && "text-muted-foreground",
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
                          disabled={(date) => date < new Date()}
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
                            !checkOutDate && "text-muted-foreground",
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
                      onChange={(e) => setGuestCount(Number.parseInt(e.target.value) || 1)}
                      className="w-20 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setGuestCount(Math.min(room.maxGuests, guestCount + 1))}
                    >
                      +
                    </Button>
                    <span className="text-sm text-muted-foreground">Máximo: {room.maxGuests}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Servicios adicionales</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="breakfast"
                      checked={includesBreakfast}
                      onCheckedChange={(checked) => setIncludesBreakfast(checked as boolean)}
                    />
                    <label
                      htmlFor="breakfast"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Incluir desayuno buffet (+${BREAKFAST_PRICE.toLocaleString()} por persona por noche)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="spa"
                      checked={includesSpa}
                      onCheckedChange={(checked) => setIncludesSpa(checked as boolean)}
                    />
                    <label
                      htmlFor="spa"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Incluir acceso al spa (+${SPA_PRICE.toLocaleString()} por persona)
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

          {/* Step 2: Guest Information */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Datos de los huéspedes</CardTitle>
                <CardDescription>Ingresa la información de cada persona que se hospedará</CardDescription>
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
                          onChange={(e) => updateGuest(index, "name", e.target.value)}
                          placeholder="Juan Pérez"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`dni-${index}`}>DNI / Pasaporte</Label>
                        <Input
                          id={`dni-${index}`}
                          value={guest.dni}
                          onChange={(e) => updateGuest(index, "dni", e.target.value)}
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
                          onChange={(e) => updateGuest(index, "email", e.target.value)}
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
                          onChange={(e) => updateGuest(index, "phone", e.target.value)}
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

          {/* Step 3: Payment */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Pago Total</CardTitle>
                <CardDescription>
                  Completa el pago de ${totalPrice.toLocaleString()} para confirmar tu reserva.
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

                <Button onClick={handlePayment} className="w-full" size="lg" disabled={isProcessing}>
                  {isProcessing ? (
                    "Procesando pago..."
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pagar ${totalPrice.toLocaleString()}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Resumen de reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative h-48 overflow-hidden rounded-lg">
                <Image src={room.images[0] || "/placeholder.svg"} alt={room.name} fill className="object-cover" />
              </div>

              <div>
                <h3 className="font-semibold">{room.name}</h3>
                <p className="text-sm text-muted-foreground">Hasta {room.maxGuests} huéspedes</p>
              </div>

              <Separator />

              {checkInDate && checkOutDate && (
                <>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-in:</span>
                      <span className="font-medium">{format(checkInDate, "d MMM yyyy", { locale: es })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out:</span>
                      <span className="font-medium">{format(checkOutDate, "d MMM yyyy", { locale: es })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Noches:</span>
                      <span className="font-medium">{differenceInDays(checkOutDate, checkInDate)}</span>
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
                        ${(room.basePrice * differenceInDays(checkOutDate, checkInDate)).toLocaleString()}
                      </span>
                    </div>
                    {includesBreakfast && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Desayuno:</span>
                        <span className="font-medium">
                          $
                          {(
                            BREAKFAST_PRICE *
                            differenceInDays(checkOutDate, checkInDate) *
                            guestCount
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {includesSpa && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Spa:</span>
                        <span className="font-medium">${(SPA_PRICE * guestCount).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total a pagar:</span>
                      <span className="text-primary">${totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
