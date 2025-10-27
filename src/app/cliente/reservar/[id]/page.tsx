"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import StripePaymentForm from "@/components/StripePaymentForm"
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

// Inicializar Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface GuestInput {
  name: string;
  dni: string;
  email: string;
  phone: string;
}

// Utilidades de formateo
const formatCardNumber = (value: string) => {
  const cleaned = value.replace(/\s/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
};

const formatCardExpiry = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
  }
  return cleaned;
};

const formatPhone = (value: string) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 0) return '';
  
  if (cleaned.startsWith('54')) {
    // Formato internacional argentino: +54 11 1234-5678
    if (cleaned.length <= 2) return `+${cleaned}`;
    if (cleaned.length <= 4) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    if (cleaned.length <= 8) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4)}`;
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
  } else {
    // Formato nacional: 11 1234-5678
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
  }
};

// Validaciones
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateDNI = (dni: string): boolean => {
  const cleaned = dni.replace(/\D/g, '');
  return cleaned.length >= 7 && cleaned.length <= 9;
};

const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '');
  return cleaned.length === 16 && /^\d+$/.test(cleaned);
};

const validateCardExpiry = (expiry: string): boolean => {
  if (expiry.length !== 5) return false;
  
  const [month, year] = expiry.split('/');
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt('20' + year, 10);
  
  if (monthNum < 1 || monthNum > 12) return false;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (yearNum < currentYear) return false;
  if (yearNum === currentYear && monthNum < currentMonth) return false;
  
  return true;
};

const validateCVV = (cvv: string): boolean => {
  return cvv.length === 3 || cvv.length === 4;
};

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
  
  // Determinar si las fechas vienen bloqueadas desde la URL
  const datesLockedFromUrl = !!(searchParams.get("checkIn") && searchParams.get("checkOut"))
  
  const [guestCount, setGuestCount] = useState(1)
  const [guests, setGuests] = useState<Partial<GuestInput>[]>([
    { name: "", dni: "", email: "", phone: "" },
  ])
  const [includesBreakfast, setIncludesBreakfast] = useState(false)
  const [includesSpa, setIncludesSpa] = useState(false)
  
  const [clientSecret, setClientSecret] = useState<string>("")
  const [paymentIntentId, setPaymentIntentId] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Errores de validación
  const [guestErrors, setGuestErrors] = useState<Array<{[key: string]: string}>>([])

  // Cargar datos de la habitación
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
          // Si la habitación ya incluye desayuno o spa, deshabilitar opciones
          if (data.includesBreakfast) {
            setIncludesBreakfast(true)
          }
          if (data.includesSpa) {
            setIncludesSpa(true)
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
    
    // Solo agregar costo de desayuno si NO está incluido en el tipo de habitación
    if (includesBreakfast && !room.includesBreakfast) {
      total += BREAKFAST_PRICE_PER_NIGHT_PER_GUEST * nights * guestCount
    }
    
    // Solo agregar costo de spa si NO está incluido en el tipo de habitación
    if (includesSpa && !room.includesSpa) {
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
    setGuestErrors(Array.from({ length: guestCount }, () => ({})))
    setStep(2)
  }

  const validateGuests = (): boolean => {
    const errors = guests.map((guest) => {
      const guestErrors: {[key: string]: string} = {}
      
      if (!guest.name || guest.name.trim().length < 3) {
        guestErrors.name = "Nombre debe tener al menos 3 caracteres"
      }
      
      if (!guest.dni || !validateDNI(guest.dni)) {
        guestErrors.dni = "DNI/Pasaporte inválido (7-9 dígitos)"
      }
      
      if (!guest.email || !validateEmail(guest.email)) {
        guestErrors.email = "Email inválido"
      }
      
      if (!guest.phone || guest.phone.replace(/\D/g, '').length < 10) {
        guestErrors.phone = "Teléfono debe tener al menos 10 dígitos"
      }
      
      return guestErrors
    })
    
    setGuestErrors(errors)
    return errors.every(e => Object.keys(e).length === 0)
  }

  const handleStep2Next = async () => {
    if (!validateGuests()) {
      toast({
        title: "Error",
        description: "Por favor corrige los errores en los datos de los huéspedes",
        variant: "destructive",
      })
      return
    }

    // Crear Payment Intent en Stripe
    try {
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalPrice,
          reservationId: 'pending',
          userId: user?.id,
          roomTypeId: room?.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al inicializar el pago')
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
      setPaymentIntentId(data.paymentIntentId)
      setStep(3)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo inicializar el pago",
        variant: "destructive",
      })
    }
  }


  const handlePaymentSuccess = async (confirmedPaymentIntentId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para completar la reserva",
        variant: "destructive",
      })
      return;
    }

    setIsProcessing(true)

    const reservationData = {
      userId: user.id,
      roomTypeId: room!.id,
      checkIn: checkInDate!.toISOString(),
      checkOut: checkOutDate!.toISOString(),
      guests: guests as GuestInput[],
      includesBreakfast: includesBreakfast,
      includesSpa: includesSpa,
      totalPrice: totalPrice,
      paymentIntentId: confirmedPaymentIntentId,
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
        description: `Se te asignó la habitación ${result.reservation.roomId}. Recibirás un email de confirmación.`,
      })

      // Pequeño delay para que el usuario vea el mensaje
      setTimeout(() => {
        router.push("/cliente/mis-reservas")
      }, 2000)

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

  const handlePaymentError = (error: string) => {
    toast({
      title: "Error en el pago",
      description: error,
      variant: "destructive",
    })
  }

  const updateGuest = (index: number, field: keyof GuestInput, value: string) => {
    const newGuests = [...guests]
    
    // Aplicar formato según el campo
    let formattedValue = value
    if (field === 'phone') {
      formattedValue = formatPhone(value)
    } else if (field === 'dni') {
      formattedValue = value.replace(/\D/g, '')
    }
    
    newGuests[index] = { ...newGuests[index], [field]: formattedValue }
    setGuests(newGuests)
    
    // Limpiar error del campo cuando se edita
    if (guestErrors[index]?.[field]) {
      const newErrors = [...guestErrors]
      delete newErrors[index][field]
      setGuestErrors(newErrors)
    }
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
                          disabled={datesLockedFromUrl}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !checkInDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkInDate ? format(checkInDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      {!datesLockedFromUrl && (
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={checkInDate}
                            onSelect={setCheckInDate}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                            locale={es}
                            initialFocus
                          />
                        </PopoverContent>
                      )}
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Fecha de salida</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={datesLockedFromUrl}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !checkOutDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOutDate ? format(checkOutDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      {!datesLockedFromUrl && (
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={checkOutDate}
                            onSelect={setCheckOutDate}
                            disabled={(date) => !checkInDate || date <= checkInDate}
                            locale={es}
                            initialFocus
                          />
                        </PopoverContent>
                      )}
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
                        !room.includesBreakfast && setIncludesBreakfast(checked as boolean)
                      }
                      disabled={room.includesBreakfast}
                    />
                    <label
                      htmlFor="breakfast"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {room.includesBreakfast ? (
                        <span>Desayuno buffet <span className="text-green-600">(Ya incluido)</span></span>
                      ) : (
                        `Incluir desayuno buffet (+$${BREAKFAST_PRICE_PER_NIGHT_PER_GUEST.toLocaleString()} por persona por noche)`
                      )}
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="spa"
                      checked={includesSpa}
                      onCheckedChange={(checked) =>
                        !room.includesSpa && setIncludesSpa(checked as boolean)
                      }
                      disabled={room.includesSpa}
                    />
                    <label
                      htmlFor="spa"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {room.includesSpa ? (
                        <span>Acceso al spa <span className="text-green-600">(Ya incluido)</span></span>
                      ) : (
                        `Incluir acceso al spa (+$${SPA_PRICE_PER_GUEST.toLocaleString()} por persona)`
                      )}
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
                          className={guestErrors[index]?.name ? 'border-red-500' : ''}
                          required
                        />
                        {guestErrors[index]?.name && (
                          <p className="text-sm text-red-500">{guestErrors[index].name}</p>
                        )}
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
                          className={guestErrors[index]?.dni ? 'border-red-500' : ''}
                          required
                        />
                        {guestErrors[index]?.dni && (
                          <p className="text-sm text-red-500">{guestErrors[index].dni}</p>
                        )}
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
                          className={guestErrors[index]?.email ? 'border-red-500' : ''}
                          required
                        />
                        {guestErrors[index]?.email && (
                          <p className="text-sm text-red-500">{guestErrors[index].email}</p>
                        )}
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
                          className={guestErrors[index]?.phone ? 'border-red-500' : ''}
                          required
                        />
                        {guestErrors[index]?.phone && (
                          <p className="text-sm text-red-500">{guestErrors[index].phone}</p>
                        )}
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
          {/* Paso 3 */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Pago Seguro</CardTitle>
                <CardDescription>
                  Completa el pago de ${totalPrice.toLocaleString('es-AR')} para confirmar tu reserva
                </CardDescription>
              </CardHeader>
              <CardContent>
                {clientSecret && (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#667eea',
                        },
                      },
                      locale: 'es',
                    }}
                  >
                    <StripePaymentForm
                      totalPrice={totalPrice}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </Elements>
                )}
                
                {!clientSecret && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Inicializando pago seguro...</span>
                  </div>
                )}
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
                        <span className="text-muted-foreground">
                          Desayuno {room.includesBreakfast && <span className="text-xs text-green-600">(incluido)</span>}:
                        </span>
                        <span className="font-medium">
                          {room.includesBreakfast ? (
                            <span className="text-green-600">$0</span>
                          ) : (
                            `${(
                              BREAKFAST_PRICE_PER_NIGHT_PER_GUEST *
                              differenceInDays(checkOutDate, checkInDate) *
                              guestCount
                            ).toLocaleString('es-AR')}`
                          )}
                        </span>
                      </div>
                    )}
                    {includesSpa && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Spa {room.includesSpa && <span className="text-xs text-green-600">(incluido)</span>}:
                        </span>
                        <span className="font-medium">
                          {room.includesSpa ? (
                            <span className="text-green-600">$0</span>
                          ) : (
                            `${(SPA_PRICE_PER_GUEST * guestCount).toLocaleString('es-AR')}`
                          )}
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