"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Users, Wrench, Building2, Sparkles, BedDouble, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type RoomStatus = 'disponible' | 'ocupada' | 'mantenimiento' | 'limpieza'

interface RoomData {
  id: string
  floor: number
  status: RoomStatus
  roomType: {
    id: string
    name: string
    basePrice: number
    maxGuests: number
    images: string[]
    isActive: boolean
  }
  activeReservations: number
}

const STATUS_CONFIG = {
  disponible: {
    label: 'Disponible',
    color: 'bg-green-500',
    variant: 'default' as const,
    icon: BedDouble,
  },
  limpieza: {
    label: 'En Limpieza',
    color: 'bg-blue-500',
    variant: 'secondary' as const,
    icon: Sparkles,
  },
  mantenimiento: {
    label: 'Mantenimiento',
    color: 'bg-amber-500',
    variant: 'outline' as const,
    icon: Wrench,
  },
  ocupada: {
    label: 'Ocupada',
    color: 'bg-red-500',
    variant: 'destructive' as const,
    icon: Users,
  },
}

export default function HabitacionesPage() {
  const { toast } = useToast()
  const [rooms, setRooms] = useState<RoomData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null)
  const [newStatus, setNewStatus] = useState<RoomStatus>('disponible')
  const [showDialog, setShowDialog] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Cargar habitaciones
  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/operador/habitaciones')
      if (!response.ok) {
        throw new Error('Error al cargar habitaciones')
      }
      const data = await response.json()
      setRooms(data.rooms)
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

  const handleChangeStatus = (room: RoomData, status: RoomStatus) => {
    setSelectedRoom(room)
    setNewStatus(status)
    setShowDialog(true)
  }

  const confirmStatusChange = async () => {
    if (!selectedRoom) return

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/operador/habitaciones/${selectedRoom.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error al actualizar')
      }

      // Actualizar lista local
      setRooms(prev =>
        prev.map(r =>
          r.id === selectedRoom.id ? { ...r, status: newStatus } : r
        )
      )

      toast({
        title: 'Estado actualizado',
        description: `Habitación ${selectedRoom.id} ahora está en estado: ${STATUS_CONFIG[newStatus].label}`,
      })

      setShowDialog(false)
      setSelectedRoom(null)

    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Error al actualizar',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Estadísticas
  const stats = {
    total: rooms.length,
    disponible: rooms.filter(r => r.status === 'disponible').length,
    limpieza: rooms.filter(r => r.status === 'limpieza').length,
    mantenimiento: rooms.filter(r => r.status === 'mantenimiento').length,
    ocupada: rooms.filter(r => r.status === 'ocupada').length,
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
        <h1 className="mb-2 text-3xl font-bold">Gestión de Habitaciones</h1>
        <p className="text-muted-foreground">
          Administra el estado de las habitaciones físicas del hotel
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.disponible}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">En Limpieza</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.limpieza}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mantenimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.mantenimiento}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ocupadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.ocupada}</div>
          </CardContent>
        </Card>
      </div>

      {rooms.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No hay habitaciones registradas en el sistema. Crea habitaciones físicas en la base de datos.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rooms.map((room) => {
            const statusConfig = STATUS_CONFIG[room.status]
            const StatusIcon = statusConfig.icon

            return (
              <Card key={room.id} className={room.status === 'mantenimiento' ? 'opacity-75' : ''}>
                <div className="relative h-48 w-full">
                  <Image
                    src={room.roomType.images[0] || "/placeholder.svg"}
                    alt={`Habitación ${room.id}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute right-2 top-2">
                    <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  {room.activeReservations > 0 && (
                    <div className="absolute left-2 top-2">
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                        {room.activeReservations} reserva{room.activeReservations !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold">Hab. {room.id}</CardTitle>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        <span>Piso {room.floor}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-2 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {room.roomType.maxGuests}
                    </Badge>
                  </div>
                  <CardDescription className="mt-2 font-medium">
                    {room.roomType.name}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Precio base:</span>
                    <span className="font-medium">${room.roomType.basePrice.toLocaleString()}/noche</span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`status-${room.id}`} className="text-xs">
                      Cambiar estado
                    </Label>
                    <Select
                      value={room.status}
                      onValueChange={(value) => handleChangeStatus(room, value as RoomStatus)}
                    >
                      <SelectTrigger id={`status-${room.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disponible">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Disponible
                          </div>
                        </SelectItem>
                        <SelectItem value="limpieza">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            En Limpieza
                          </div>
                        </SelectItem>
                        <SelectItem value="mantenimiento">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                            Mantenimiento
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog de confirmación */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cambio de estado</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRoom && (
                <>
                  Vas a cambiar el estado de la habitación <strong>{selectedRoom.id}</strong> de{' '}
                  <strong>{STATUS_CONFIG[selectedRoom.status].label}</strong> a{' '}
                  <strong>{STATUS_CONFIG[newStatus].label}</strong>.
                  {selectedRoom.activeReservations > 0 && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Esta habitación tiene {selectedRoom.activeReservations} reserva(s) activa(s).
                        Considera esto antes de cambiar el estado.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Confirmar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}