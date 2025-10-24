"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useToast } from "@/components/ui/use-toast"
import type { Room, RoomType, RoomStatus } from "@prisma/client"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Wrench,
  CheckCircle,
  XCircle,
} from "lucide-react"

// Importamos el tipo extendido que creamos en prisma
type FullRoom = Room & {
  roomType: RoomType
}

export default function GerenciaHabitacionesPage() {
  const { toast } = useToast()

  // --- Estados Principales ---
  const [rooms, setRooms] = useState<FullRoom[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // --- Estados de Filtros ---
  const [filterFloor, setFilterFloor] = useState("all")
  const [filterType, setFilterType] = useState("all")

  // --- Estados de Modales ---
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<FullRoom | null>(null)
  const [deletingRoom, setDeletingRoom] = useState<FullRoom | null>(null)
  const [statusChange, setStatusChange] = useState<{
    room: FullRoom
    newStatus: RoomStatus
  } | null>(null)

  // --- Estado del Formulario ---
  const [formData, setFormData] = useState({
    id: "", // N° de Habitación
    roomTypeId: "",
  })

  // --- Carga Inicial de Datos ---
  const fetchAllData = async (filters: { floor?: string; type?: string } = {}) => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.floor && filters.floor !== "all") params.set("floor", filters.floor)
      if (filters.type && filters.type !== "all") params.set("roomTypeId", filters.type)

      const response = await fetch(`/api/gerencia/habitaciones?${params.toString()}`)
      if (!response.ok) {
        throw new Error("No se pudieron cargar los datos")
      }
      const data = await response.json()
      setRooms(data.rooms || [])
      
      // Solo cargamos los roomTypes una vez
      if (roomTypes.length === 0) {
        setRoomTypes(data.roomTypes || [])
      }
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Cargar solo al inicio

  // --- Handlers de Filtros ---
  const handleFilterApply = () => {
    fetchAllData({ floor: filterFloor, type: filterType })
  }

  const handleFilterClear = () => {
    setFilterFloor("all")
    setFilterType("all")
    fetchAllData()
  }

  // --- Handlers de Formulario ---
  const resetForm = () => {
    setFormData({ id: "", roomTypeId: "" })
  }

  const openEditDialog = (room: FullRoom) => {
    setFormData({
      id: room.id,
      roomTypeId: room.roomTypeId,
    })
    setEditingRoom(room)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreateOpen(true)
  }

  // --- Handlers de API (CRUD) ---

  // CREATE
  const handleCreate = async () => {
    if (!formData.id || !formData.roomTypeId) {
      toast({
        title: "Error",
        description: "Completa todos los campos",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/gerencia/habitaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Error al crear")
      }
      toast({
        title: "Éxito",
        description: `Habitación ${data.room.id} creada.`,
      })
      setIsCreateOpen(false)
      fetchAllData() // Recargar
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  // UPDATE (RoomType)
  const handleEdit = async () => {
    if (!editingRoom) return

    try {
      const response = await fetch(
        `/api/gerencia/habitaciones/${editingRoom.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomTypeId: formData.roomTypeId }),
        }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar")
      }
      toast({ title: "Éxito", description: "Habitación actualizada." })
      setEditingRoom(null)
      fetchAllData() // Recargar
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  // UPDATE (Status)
  const handleStatusChange = async () => {
    if (!statusChange) return

    try {
      const response = await fetch(
        `/api/gerencia/habitaciones/${statusChange.room.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: statusChange.newStatus }),
        }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Error al cambiar estado")
      }
      toast({
        title: "Éxito",
        description: `Habitación ${statusChange.room.id} ahora está ${statusChange.newStatus}.`,
      })
      setStatusChange(null)
      fetchAllData() // Recargar
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  // DELETE
  const handleDelete = async () => {
    if (!deletingRoom) return

    try {
      const response = await fetch(
        `/api/gerencia/habitaciones/${deletingRoom.id}`,
        {
          method: "DELETE",
        }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Error al eliminar")
      }
      toast({ title: "Éxito", description: "Habitación eliminada." })
      setDeletingRoom(null)
      fetchAllData() // Recargar
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  // --- Opciones de Filtros ---
  const floorOptions = useMemo(
  () => Array.from(new Set(rooms.map(r => r.floor))).sort((a, b) => a - b),
  [rooms]
)


  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case "disponible":
        return <Badge variant="default">Disponible</Badge>
      case "ocupada":
        return <Badge variant="secondary">Ocupada</Badge>
      case "mantenimiento":
        return <Badge variant="destructive">Mantenimiento</Badge>
      case "limpieza":
        return <Badge variant="outline">Limpieza</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-16 py-8">
      {/* --- Cabecera --- */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Gestión de Habitaciones</h1>
          <p className="text-muted-foreground">
            Administra el inventario de habitaciones físicas del hotel.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Habitación
        </Button>
      </div>

      {/* --- Filtros --- */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1 space-y-2">
            <Label>Piso</Label>
            <Select value={filterFloor} onValueChange={setFilterFloor}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los pisos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los pisos</SelectItem>
                {/* Generar opciones de piso, ej: 1 a 5 */}
                {[1, 2, 3, 4, 5].map((f) => (
                  <SelectItem key={f} value={String(f)}>
                    Piso {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <Label>Tipo de Habitación</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {roomTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={handleFilterApply} className="flex-1 sm:flex-auto">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
            <Button
              onClick={handleFilterClear}
              variant="outline"
              className="flex-1 sm:flex-auto"
            >
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* --- Tabla de Datos --- */}
      <Card>
        <CardHeader>
          <CardTitle>Inventario de Habitaciones ({rooms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">N° Hab.</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-[100px]">Piso</TableHead>
                  <TableHead className="w-[150px]">Estado</TableHead>
                  <TableHead className="w-[280px] text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-red-600"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                ) : rooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No se encontraron habitaciones con esos filtros.
                    </TableCell>
                  </TableRow>
                ) : (
                  rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.id}</TableCell>
                      <TableCell>{room.roomType.name}</TableCell>
                      <TableCell>{room.floor}</TableCell>
                      <TableCell>{getStatusBadge(room.status)}</TableCell>
                      <TableCell className="space-x-1 text-right">
                        {/* Botones de cambio rápido de estado */}
                        {room.status !== "mantenimiento" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setStatusChange({
                                room: room,
                                newStatus: "mantenimiento",
                              })
                            }
                          >
                            <Wrench className="mr-1 h-3 w-3" /> Mant.
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              setStatusChange({
                                room: room,
                                newStatus: "disponible",
                              })
                            }
                          >
                            <CheckCircle className="mr-1 h-3 w-3" /> Disp.
                          </Button>
                        )}
                        {/* CRUD */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(room)}
                        >
                          <Pencil className="mr-1 h-3 w-3" /> Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingRoom(room)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* --- Modal Crear --- */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Habitación</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-id">N° Habitación (ID) *</Label>
              <Input
                id="create-id"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="Ej: 101, 102, 201"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-type">Tipo de Habitación *</Label>
              <Select
                value={formData.roomTypeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, roomTypeId: value })
                }
              >
                <SelectTrigger id="create-type">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Modal Editar --- */}
      <Dialog open={!!editingRoom} onOpenChange={() => setEditingRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Habitación: {formData.id}</DialogTitle>
            <DialogDescription>
              Puedes cambiar el tipo de habitación asignado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-id">N° Habitación (ID)</Label>
              <Input id="edit-id" value={formData.id} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Tipo de Habitación *</Label>
              <Select
                value={formData.roomTypeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, roomTypeId: value })
                }
              >
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* --- Alerta Eliminar --- */}
      <AlertDialog
        open={!!deletingRoom}
        onOpenChange={() => setDeletingRoom(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar Habitación {deletingRoom?.id}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Si la habitación tiene reservas
              asociadas, la eliminación fallará para proteger los datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- Alerta Cambio de Estado --- */}
      <AlertDialog
        open={!!statusChange}
        onOpenChange={() => setStatusChange(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Cambio de Estado</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Deseas cambiar el estado de la habitación{" "}
              <strong>{statusChange?.room.id}</strong> de{" "}
              <strong>{statusChange?.room.status}</strong> a{" "}
              <strong>{statusChange?.newStatus}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
