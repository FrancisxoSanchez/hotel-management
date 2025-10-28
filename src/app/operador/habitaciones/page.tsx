"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import type { RoomStatus } from "@prisma/client"
import { FullRoomOperador } from "@/prisma/operador-habitaciones"
import { Loader2, BedDouble, AlertCircle } from "lucide-react"

// --- LÓGICA DE ESTADOS ---
// Estados que el operador puede SELECCIONAR en el dropdown
const selectableStatus: RoomStatus[] = ["disponible", "mantenimiento"]
// Estados que permiten la INTERACCIÓN (si no está en esta lista, se bloquea)
const editableStatus: RoomStatus[] = [
  "disponible",
  "limpieza",
  "mantenimiento",
]

export default function OperadorHabitacionesPage() {
  const [rooms, setRooms] = useState<FullRoomOperador[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/operador/habitaciones")
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || "No se pudieron cargar las habitaciones")
        }
        setRooms(data.rooms)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchRooms()
  }, [toast])

  const handleStatusChange = async (roomId: string, newStatus: RoomStatus) => {
    const room = rooms.find((r) => r.id === roomId)
    const hasActiveReservations = room?._count.reservations || 0

    // Si tiene reservas y va a mantenimiento, mostrar advertencia
    if (newStatus === "mantenimiento" && hasActiveReservations > 0) {
      const confirmed = window.confirm(
        `⚠️ Esta habitación tiene ${hasActiveReservations} reserva(s) activa(s).\n\n` +
        `Si continúas, todas las reservas serán CANCELADAS automáticamente.\n\n` +
        `¿Deseas continuar con el mantenimiento?`
      )
      
      if (!confirmed) {
        return // El usuario canceló la operación
      }
    }

    const originalRooms = rooms
    // Optimistic update
    setRooms((prevRooms) =>
      prevRooms.map((r) =>
        r.id === roomId ? { ...r, status: newStatus } : r
      )
    )

    try {
      const response = await fetch(`/api/operador/habitaciones/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar")
      }

      // Mensaje personalizado si se cancelaron reservas
      const message = 
        newStatus === "mantenimiento" && hasActiveReservations > 0
          ? `Habitación ${roomId} en mantenimiento. Se cancelaron ${hasActiveReservations} reserva(s).`
          : `Habitación ${roomId} actualizada a ${newStatus}.`

      toast({
        title: "Éxito",
        description: message,
      })

      // Sincronizar el estado final desde la respuesta
      setRooms((prevRooms) =>
        prevRooms.map((r) => (r.id === roomId ? { ...r, ...data.room } : r))
      )
    } catch (err: any) {
      toast({
        title: "Error al actualizar",
        description: err.message,
        variant: "destructive",
      })
      // Revertir
      setRooms(originalRooms)
    }
  }

  const getStatusVariant = (
    status: RoomStatus
  ): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "disponible":
        return "default"
      case "mantenimiento":
        return "destructive"
      case "ocupada":
        return "secondary"
      case "limpieza":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-16 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Gestión de Habitaciones</h1>
        <p className="text-muted-foreground">
          Actualiza el estado de las habitaciones (disponible, limpieza,
          mantenimiento).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rooms.map((room) => {
          // --- LÓGICA DE BLOQUEO ---
          const isLocked = !editableStatus.includes(room.status)
          const hasActiveReservations = room._count.reservations > 0

          return (
            <Card
              key={room.id}
              className={`flex flex-col ${
                isLocked ? "opacity-70" : ""
              }`}
            >
              <CardHeader className="pb-4">
                <div className="relative h-48 w-full overflow-hidden rounded-lg">
                  <Image
                    src={room.roomType.images[0] || "/placeholder.jpg"}
                    alt={room.roomType.name}
                    layout="fill"
                    objectFit="cover"
                  />
                  <Badge
                    className="absolute right-2 top-2"
                    variant={getStatusVariant(room.status)}
                  >
                    {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                  </Badge>
                </div>
                <CardTitle className="pt-4">
                  Habitación {room.id}
                </CardTitle>
                <CardDescription>
                  <BedDouble className="mr-2 inline-block h-4 w-4" />
                  {room.roomType.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {hasActiveReservations && (
                  <Badge variant="destructive" className="mb-3 w-full">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    {room._count.reservations} reserva(s) activa(s)
                  </Badge>
                )}
                {isLocked && room.status === "ocupada" && (
                  <Badge variant="secondary" className="w-full">
                    No puede cambiar el estado.
                  </Badge>
                )}
              </CardContent>
              <CardFooter>
                {isLocked ? (
                  // 🔥 Cuando está bloqueado, mostramos el estado actual en un Select deshabilitado
                  <Select value={room.status} disabled>
                    <SelectTrigger className="w-full cursor-not-allowed">
                      <SelectValue>
                        {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                      </SelectValue>
                    </SelectTrigger>
                  </Select>
                ) : (
                  // Cuando no está bloqueado, mostramos el Select normal
                  <Select
                    value={room.status}
                    onValueChange={(newStatus) =>
                      handleStatusChange(room.id, newStatus as RoomStatus)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Cambiar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectableStatus.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}