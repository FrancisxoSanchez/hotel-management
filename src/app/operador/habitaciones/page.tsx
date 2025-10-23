"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { mockRooms } from "@/lib/mock-data"
import type { Room } from "@/lib/types"
import { Users, Wrench, Building2 } from "lucide-react"

interface IndividualRoom {
  roomNumber: string
  floor: number
  type: Room
  isActive: boolean
}

function generateIndividualRooms(): IndividualRoom[] {
  const rooms: IndividualRoom[] = []

  // Asignar pisos según el tipo de habitación
  const floorAssignments = [
    { roomType: mockRooms.find((r) => r.name === "Habitación Individual")!, floor: 1 },
    { roomType: mockRooms.find((r) => r.name === "Habitación Doble Standard")!, floor: 2 },
    { roomType: mockRooms.find((r) => r.name === "Suite Ejecutiva")!, floor: 3 },
    { roomType: mockRooms.find((r) => r.name === "Suite Familiar")!, floor: 4 },
    { roomType: mockRooms.find((r) => r.name === "Suite Presidencial")!, floor: 5 },
  ]

  floorAssignments.forEach(({ roomType, floor }) => {
    for (let i = 1; i <= roomType.quantity; i++) {
      const roomNumber = `${floor}${i.toString().padStart(2, "0")}`
      rooms.push({
        roomNumber,
        floor,
        type: roomType,
        isActive: roomType.isActive,
      })
    }
  })

  return rooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber))
}

export default function HabitacionesPage() {
  const { toast } = useToast()
  const [individualRooms, setIndividualRooms] = useState<IndividualRoom[]>(generateIndividualRooms())
  const [selectedRoom, setSelectedRoom] = useState<IndividualRoom | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  const handleToggleRoom = (room: IndividualRoom) => {
    setSelectedRoom(room)
    setShowDialog(true)
  }

  const confirmToggle = () => {
    if (!selectedRoom) return

    const updatedRooms = individualRooms.map((r) =>
      r.roomNumber === selectedRoom.roomNumber ? { ...r, isActive: !r.isActive } : r,
    )
    setIndividualRooms(updatedRooms)

    toast({
      title: selectedRoom.isActive ? "Habitación desactivada" : "Habitación activada",
      description: selectedRoom.isActive
        ? `Habitación ${selectedRoom.roomNumber} no estará disponible para nuevas reservas`
        : `Habitación ${selectedRoom.roomNumber} está nuevamente disponible para reservas`,
    })

    setShowDialog(false)
    setSelectedRoom(null)
  }

  const activeRooms = individualRooms.filter((r) => r.isActive).length
  const inactiveRooms = individualRooms.filter((r) => !r.isActive).length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Gestión de Habitaciones</h1>
        <p className="text-muted-foreground">Activa o desactiva habitaciones según necesidades de mantenimiento</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Habitaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{individualRooms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Habitaciones Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeRooms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">En Mantenimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{inactiveRooms}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {individualRooms.map((room) => (
          <Card key={room.roomNumber} className={!room.isActive ? "opacity-75" : ""}>
            <div className="relative h-48 w-full">
              <Image
                src={room.type.images[0] || "/placeholder.svg"}
                alt={`Habitación ${room.roomNumber}`}
                fill
                className="object-cover"
              />
              {!room.isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <Wrench className="h-3 w-3" />
                    En Mantenimiento
                  </Badge>
                </div>
              )}
            </div>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Número de habitación como cabecera */}
                  <CardTitle className="text-2xl font-bold">Hab. {room.roomNumber}</CardTitle>
                  {/* Piso */}
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span>Piso {room.floor}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="ml-2 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {room.type.maxGuests}
                </Badge>
              </div>
              {/* Tipo de habitación */}
              <CardDescription className="mt-2 font-medium">{room.type.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`room-${room.roomNumber}`}
                    checked={room.isActive}
                    onCheckedChange={() => handleToggleRoom(room)}
                  />
                  <Label htmlFor={`room-${room.roomNumber}`} className="cursor-pointer">
                    {room.isActive ? "Activa" : "Inactiva"}
                  </Label>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${room.type.basePrice.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">por noche</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedRoom?.isActive ? "¿Desactivar habitación?" : "¿Activar habitación?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRoom?.isActive
                ? `La habitación ${selectedRoom.roomNumber} no estará disponible para nuevas reservas. Las reservas existentes no se verán afectadas.`
                : `La habitación ${selectedRoom.roomNumber} estará nuevamente disponible para recibir reservas.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
