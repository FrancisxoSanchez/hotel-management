"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Plus, Pencil, Trash2, Users } from "lucide-react"

export default function GerenciaHabitacionesPage() {
  const { toast } = useToast()
  const [rooms, setRooms] = useState(mockRooms)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxGuests: 1,
    basePrice: 0,
    amenities: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      maxGuests: 1,
      basePrice: 0,
      amenities: "",
    })
  }

  const handleCreate = () => {
    if (!formData.name || !formData.description || formData.basePrice <= 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    const newRoom: Room = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      maxGuests: formData.maxGuests,
      basePrice: formData.basePrice,
      images: ["/placeholder.svg?height=400&width=600"],
      amenities: formData.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      isActive: true,
      includesBreakfast: false,
      includesSpa: false,
    }

    setRooms([...rooms, newRoom])
    toast({
      title: "Habitación creada",
      description: "La habitación ha sido agregada exitosamente",
    })
    setIsCreateOpen(false)
    resetForm()
  }

  const handleEdit = () => {
    if (!editingRoom) return

    if (!formData.name || !formData.description || formData.basePrice <= 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    const updatedRooms = rooms.map((r) =>
      r.id === editingRoom.id
        ? {
            ...r,
            name: formData.name,
            description: formData.description,
            maxGuests: formData.maxGuests,
            basePrice: formData.basePrice,
            amenities: formData.amenities
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean),
          }
        : r,
    )

    setRooms(updatedRooms)
    toast({
      title: "Habitación actualizada",
      description: "Los cambios han sido guardados exitosamente",
    })
    setEditingRoom(null)
    resetForm()
  }

  const handleDelete = () => {
    if (!deletingRoom) return

    setRooms(rooms.filter((r) => r.id !== deletingRoom.id))
    toast({
      title: "Habitación eliminada",
      description: "La habitación ha sido eliminada del sistema",
    })
    setDeletingRoom(null)
  }

  const openEditDialog = (room: Room) => {
    setEditingRoom(room)
    setFormData({
      name: room.name,
      description: room.description,
      maxGuests: room.maxGuests,
      basePrice: room.basePrice,
      amenities: room.amenities.join(", "),
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Gestión de Habitaciones</h1>
          <p className="text-muted-foreground">Administra el inventario de habitaciones del hotel</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Habitación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Habitación</DialogTitle>
              <DialogDescription>Completa la información de la nueva habitación</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Suite Ejecutiva"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción detallada de la habitación..."
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="maxGuests">Máximo de Huéspedes *</Label>
                  <Input
                    id="maxGuests"
                    type="number"
                    min={1}
                    value={formData.maxGuests}
                    onChange={(e) => setFormData({ ...formData, maxGuests: Number.parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="basePrice">Precio Base *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    min={0}
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="15000"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amenities">Amenities (separados por coma)</Label>
                <Input
                  id="amenities"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Wi-Fi, TV, Minibar, Aire acondicionado"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>Crear Habitación</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rooms Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <Card key={room.id}>
            <div className="relative h-48 w-full">
              <Image src={room.images[0] || "/placeholder.svg"} alt={room.name} fill className="object-cover" />
              {!room.isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <Badge variant="destructive">Inactiva</Badge>
                </div>
              )}
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">{room.description}</CardDescription>
                </div>
                <Badge variant="secondary" className="ml-2 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {room.maxGuests}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold">${room.basePrice.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">por noche</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => openEditDialog(room)}
                >
                  <Pencil className="mr-2 h-3 w-3" />
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeletingRoom(room)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingRoom} onOpenChange={() => setEditingRoom(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Habitación</DialogTitle>
            <DialogDescription>Actualiza la información de la habitación</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descripción *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-maxGuests">Máximo de Huéspedes *</Label>
                <Input
                  id="edit-maxGuests"
                  type="number"
                  min={1}
                  value={formData.maxGuests}
                  onChange={(e) => setFormData({ ...formData, maxGuests: Number.parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-basePrice">Precio Base *</Label>
                <Input
                  id="edit-basePrice"
                  type="number"
                  min={0}
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-amenities">Amenities (separados por coma)</Label>
              <Input
                id="edit-amenities"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRoom(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingRoom} onOpenChange={() => setDeletingRoom(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar habitación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La habitación será eliminada permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
