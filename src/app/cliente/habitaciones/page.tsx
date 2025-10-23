"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { mockRooms, mockReservations } from "@/lib/mock-data"
import { getAvailableRoomsCount } from "@/lib/availability"
import { Users, Wifi, Tv, Wind, Coffee, Sparkles, CalendarIcon, Search } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function RoomsPage() {
  const [tempGuestFilter, setTempGuestFilter] = useState<string>("all")
  const [tempCheckInDate, setTempCheckInDate] = useState<Date>()
  const [tempCheckOutDate, setTempCheckOutDate] = useState<Date>()

  const [appliedGuestFilter, setAppliedGuestFilter] = useState<string>("all")
  const [appliedCheckInDate, setAppliedCheckInDate] = useState<Date>()
  const [appliedCheckOutDate, setAppliedCheckOutDate] = useState<Date>()

  const handleApplyFilters = () => {
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
  }

  const filteredRooms = useMemo(() => {
    let rooms = mockRooms.filter((room) => room.isActive)

    if (appliedGuestFilter !== "all") {
      const guestCount = Number.parseInt(appliedGuestFilter)
      rooms = rooms.filter((room) => room.maxGuests >= guestCount)
    }

    if (appliedCheckInDate && appliedCheckOutDate) {
      rooms = rooms.filter((room) => {
        const availableCount = getAvailableRoomsCount(
          room.id,
          appliedCheckInDate,
          appliedCheckOutDate,
          mockReservations,
          mockRooms,
        )
        return availableCount > 0
      })
    }

    return rooms
  }, [appliedGuestFilter, appliedCheckInDate, appliedCheckOutDate])

  const getAmenityIcon = (amenity: string) => {
    if (amenity.toLowerCase().includes("wi-fi")) return <Wifi className="h-4 w-4" />
    if (amenity.toLowerCase().includes("tv")) return <Tv className="h-4 w-4" />
    if (amenity.toLowerCase().includes("aire")) return <Wind className="h-4 w-4" />
    if (amenity.toLowerCase().includes("minibar") || amenity.toLowerCase().includes("desayuno"))
      return <Coffee className="h-4 w-4" />
    return <Sparkles className="h-4 w-4" />
  }

  const getAvailableCount = (roomId: string) => {
    if (!appliedCheckInDate || !appliedCheckOutDate) return null
    return getAvailableRoomsCount(roomId, appliedCheckInDate, appliedCheckOutDate, mockReservations, mockRooms)
  }

  const hasUnappliedChanges =
    tempGuestFilter !== appliedGuestFilter ||
    tempCheckInDate?.getTime() !== appliedCheckInDate?.getTime() ||
    tempCheckOutDate?.getTime() !== appliedCheckOutDate?.getTime()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold">Nuestras Habitaciones</h1>
        <p className="text-pretty text-lg text-muted-foreground">
          Encuentra la habitación perfecta para tu estadía. Todas nuestras habitaciones están equipadas con las mejores
          comodidades.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-3">
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

          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} className="flex-1" disabled={!hasUnappliedChanges}>
              <Search className="mr-2 h-4 w-4" />
              Buscar disponibilidad
            </Button>
            {(appliedCheckInDate || appliedCheckOutDate || appliedGuestFilter !== "all") && (
              <Button variant="outline" onClick={handleClearFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>

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

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredRooms.length} {filteredRooms.length === 1 ? "tipo de habitación" : "tipos de habitaciones"}
        </p>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-lg text-muted-foreground">
            No hay habitaciones disponibles para los criterios seleccionados.
          </p>
          <Button
            onClick={() => {
              setTempGuestFilter("all")
              setTempCheckInDate(undefined)
              setTempCheckOutDate(undefined)
              setAppliedGuestFilter("all")
              setAppliedCheckInDate(undefined)
              setAppliedCheckOutDate(undefined)
            }}
            variant="outline"
            className="mt-4"
          >
            Ver todas las habitaciones
          </Button>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => {
            const availableCount = getAvailableCount(room.id)

            return (
              <Card key={room.id} className="flex flex-col overflow-hidden">
                <div className="relative h-64 w-full">
                  <Image src={room.images[0] || "/placeholder.svg"} alt={room.name} fill className="object-cover" />
                  {availableCount !== null && (
                    <div className="absolute right-2 top-2">
                      <Badge variant={availableCount > 0 ? "default" : "destructive"} className="bg-background/90">
                        {availableCount} disponible{availableCount !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  )}
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
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.slice(0, 4).map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                      >
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </div>
                    ))}
                    {room.amenities.length > 4 && (
                      <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                        +{room.amenities.length - 4} más
                      </div>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">${room.basePrice.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">por noche</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link
                      href={
                        appliedCheckInDate && appliedCheckOutDate
                          ? `/cliente/habitaciones/${room.id}?checkIn=${appliedCheckInDate.toISOString()}&checkOut=${appliedCheckOutDate.toISOString()}`
                          : `/cliente/habitaciones/${room.id}`
                      }
                    >
                      Ver Detalles
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
