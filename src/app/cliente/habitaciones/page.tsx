"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Wifi, Tv, Wind, Coffee, Sparkles, CalendarIcon, Search, Loader2, Check, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ApiRoomType {
  id: string
  name: string
  description: string
  images: string[]
  maxGuests: number
  basePrice: number
  features: string[]
  includesBreakfast: boolean
  includesSpa: boolean
  isActive: boolean
  availableCount: number
}

export default function RoomsPage() {
  // Filtros temporales (valores en los inputs)
  const [tempGuestFilter, setTempGuestFilter] = useState<string>("all")
  const [tempCheckInDate, setTempCheckInDate] = useState<Date>()
  const [tempCheckOutDate, setTempCheckOutDate] = useState<Date>()

  // Filtros aplicados (valores enviados a la API)
  const [appliedGuestFilter, setAppliedGuestFilter] = useState<string>("all")
  const [appliedCheckInDate, setAppliedCheckInDate] = useState<Date>()
  const [appliedCheckOutDate, setAppliedCheckOutDate] = useState<Date>()

  // Estados de UI
  const [rooms, setRooms] = useState<ApiRoomType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Validación en tiempo real de fechas
  useEffect(() => {
    setValidationError(null)

    if (!tempCheckInDate && !tempCheckOutDate) return

    if ((tempCheckInDate && !tempCheckOutDate) || (!tempCheckInDate && tempCheckOutDate)) {
      setValidationError("Debe seleccionar ambas fechas")
      return
    }

    if (tempCheckInDate && tempCheckOutDate) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (tempCheckInDate < today) {
        setValidationError("La fecha de entrada no puede ser en el pasado")
        return
      }

      if (tempCheckOutDate <= tempCheckInDate) {
        setValidationError("La fecha de salida debe ser posterior a la de entrada")
        return
      }

      const diffTime = tempCheckOutDate.getTime() - tempCheckInDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays < 1) {
        setValidationError("La reserva debe ser de al menos 1 noche")
        return
      }
    }
  }, [tempCheckInDate, tempCheckOutDate])

  // Cargar habitaciones cuando se aplican los filtros
  useEffect(() => {
    if (!hasSearched) return

    const fetchRooms = async () => {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()

      if (appliedGuestFilter && appliedGuestFilter !== "all") {
        params.append("guests", appliedGuestFilter)
      }
      if (appliedCheckInDate) {
        params.append("checkIn", appliedCheckInDate.toISOString())
      }
      if (appliedCheckOutDate) {
        params.append("checkOut", appliedCheckOutDate.toISOString())
      }

      try {
        const response = await fetch(`/api/cliente/habitaciones?${params.toString()}`)

        if (!response.ok) {
          let errorMessage = `Error ${response.status}: ${response.statusText}`
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch {
            errorMessage = "Error al conectar con el servidor. Verifica que la API esté funcionando."
          }
          throw new Error(errorMessage)
        }

        const data = await response.json()
        const roomsData = data.data || data
        
        // Filtrar habitaciones con disponibilidad > 0
        const availableRooms = roomsData.filter((room: ApiRoomType) => room.availableCount > 0)
        setRooms(availableRooms)

      } catch (err: any) {
        console.error('[FETCH_ERROR]', err)
        setError(err.message)
        setRooms([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRooms()
  }, [appliedGuestFilter, appliedCheckInDate, appliedCheckOutDate, hasSearched])

  const handleApplyFilters = () => {
    if (validationError) return

    setHasSearched(true)
    setAppliedGuestFilter(tempGuestFilter)
    setAppliedCheckInDate(tempCheckInDate)
    setAppliedCheckOutDate(tempCheckOutDate)
  }

  const handleClearFilters = () => {
    setTempGuestFilter("all")
    setTempCheckInDate(undefined)
    setTempCheckOutDate(undefined)
    setAppliedGuestFilter("all")
    setAppliedCheckInDate(undefined)
    setAppliedCheckOutDate(undefined)
    setHasSearched(false)
    setRooms([])
    setError(null)
    setValidationError(null)
  }

  const getAmenityIcon = (feature: string) => {
    const lower = feature.toLowerCase()
    if (lower.includes("wi-fi") || lower.includes("wifi")) return <Wifi className="h-4 w-4" />
    if (lower.includes("tv")) return <Tv className="h-4 w-4" />
    if (lower.includes("aire")) return <Wind className="h-4 w-4" />
    if (lower.includes("minibar") || lower.includes("café")) return <Coffee className="h-4 w-4" />
    return <Check className="h-4 w-4" />
  }

  const hasUnappliedChanges =
    tempGuestFilter !== appliedGuestFilter ||
    tempCheckInDate?.getTime() !== appliedCheckInDate?.getTime() ||
    tempCheckOutDate?.getTime() !== appliedCheckOutDate?.getTime()

  // Construir URL de reserva con fechas si existen
  const buildReserveUrl = (roomTypeId: string) => {
    let url = `/cliente/reservar/${roomTypeId}`
    
    if (appliedCheckInDate && appliedCheckOutDate) {
      const params = new URLSearchParams({
        checkIn: appliedCheckInDate.toISOString(),
        checkOut: appliedCheckOutDate.toISOString(),
      })
      url += `?${params.toString()}`
    }
    
    return url
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold">Nuestras Habitaciones</h1>
        <p className="text-pretty text-lg text-muted-foreground">
          Encuentra la habitación perfecta para tu estadía. Todas nuestras habitaciones están equipadas con las mejores
          comodidades.
        </p>
      </div>

      {/* Card de Filtros */}
      <Card className="mb-8">
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Check-in Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha de entrada</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !tempCheckInDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tempCheckInDate ? format(tempCheckInDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={tempCheckInDate}
                    onSelect={setTempCheckInDate}
                    disabled={(date) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return date < today
                    }}
                    locale={es}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Check-out Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha de salida</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !tempCheckOutDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tempCheckOutDate ? format(tempCheckOutDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={tempCheckOutDate}
                    onSelect={setTempCheckOutDate}
                    disabled={(date) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      if (date < today) return true
                      if (tempCheckInDate) {
                        const minCheckOut = new Date(tempCheckInDate)
                        minCheckOut.setDate(minCheckOut.getDate() + 1)
                        return date < minCheckOut
                      }
                      return false
                    }}
                    locale={es}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Guest Count */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Cantidad de huéspedes</label>
              <Select value={tempGuestFilter} onValueChange={setTempGuestFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquier cantidad</SelectItem>
                  <SelectItem value="1">1 huésped</SelectItem>
                  <SelectItem value="2">2 huéspedes</SelectItem>
                  <SelectItem value="3">3 huéspedes</SelectItem>
                  <SelectItem value="4">4 huéspedes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Alerta de validación */}
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button 
              onClick={handleApplyFilters} 
              className="flex-1" 
              disabled={!hasUnappliedChanges || !!validationError}
            >
              <Search className="mr-2 h-4 w-4" />
              Buscar disponibilidad
            </Button>
            {(appliedCheckInDate || appliedCheckOutDate || appliedGuestFilter !== "all") && (
              <Button variant="outline" onClick={handleClearFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Resumen de fechas aplicadas */}
          {appliedCheckInDate && appliedCheckOutDate && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                Mostrando disponibilidad del {format(appliedCheckInDate, "d 'de' MMMM", { locale: es })} al{" "}
                {format(appliedCheckOutDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estados de la UI */}
      {!hasSearched ? (
        <Card className="p-12 text-center">
          <CardHeader>
            <CardTitle>Comienza tu búsqueda</CardTitle>
            <CardDescription>
              Selecciona tus fechas y la cantidad de huéspedes para encontrar la habitación ideal.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Buscando habitaciones disponibles...</p>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : rooms.length === 0 ? (
        <Card className="p-12 text-center">
          <CardHeader>
            <CardTitle>No hay habitaciones disponibles</CardTitle>
            <CardDescription>
              No encontramos habitaciones disponibles para los criterios seleccionados.
              <br />
              Intenta con otras fechas o cantidad de huéspedes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleClearFilters} variant="outline" className="mt-4">
              Ver todas las habitaciones
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Mostrando {rooms.length} {rooms.length === 1 ? "tipo de habitación" : "tipos de habitaciones"}
            </p>
          </div>

          {/* Grid de habitaciones */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card key={room.id} className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative h-64 w-full">
                  <Image 
                    src={room.images[0] || "/placeholder.svg"} 
                    alt={room.name} 
                    fill 
                    className="object-cover" 
                  />
                  <div className="absolute right-2 top-2">
                    <Badge variant="default" className="bg-primary backdrop-blur">
                      {room.availableCount} disponible{room.availableCount !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <CardTitle className="text-xl">{room.name}</CardTitle>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {room.maxGuests}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-3">{room.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Servicios incluidos */}
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge variant={room.includesBreakfast ? "default" : "outline"}>
                      <Coffee className="mr-1 h-3 w-3" /> Desayuno
                    </Badge>
                    <Badge variant={room.includesSpa ? "default" : "outline"}>
                      <Sparkles className="mr-1 h-3 w-3" /> Spa
                    </Badge>
                  </div>

                  {/* Features/Amenities */}
                  {room.features && room.features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {room.features.slice(0, 4).map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                        >
                          {getAmenityIcon(feature)}
                          <span>{feature}</span>
                        </div>
                      ))}
                      {room.features.length > 4 && (
                        <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                          +{room.features.length - 4} más
                        </div>
                      )}
                    </div>
                  )}

                  {/* Precio */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">${room.basePrice.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">por noche</span>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={buildReserveUrl(room.id)}>
                      Reservar Ahora
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}