"use client"

import { useState, useEffect } from "react"
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import type { Room, RoomType, RoomStatus } from "@prisma/client"
import { FullRoom, RoomTypeInput } from "@/prisma/gerencia-habitaciones" // Importamos tipos
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Wrench,
  CheckCircle,
  XCircle,
  Package,
  FileText,
  DollarSign,
  Users,
} from "lucide-react"

// Definimos el tipo extendido que esperamos de la API
type FullRoomWithCount = Room & {
  roomType: RoomType
  _count: {
    reservations: number
  }
}

// Estado inicial para el formulario de RoomType
const initialRoomTypeForm: RoomTypeInput = {
  name: "",
  description: "",
  basePrice: 0,
  maxGuests: 1,
  includesBreakfast: false,
  includesSpa: false,
  isActive: true,
}

export default function GerenciaHabitacionesPage() {
  const { toast } = useToast()

  // --- Estados Principales ---
  const [rooms, setRooms] = useState<FullRoomWithCount[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [isLoadingTypes, setIsLoadingTypes] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // --- Estados de Filtros (Inventario) ---
  const [filterFloor, setFilterFloor] = useState("all")
  const [filterType, setFilterType] = useState("all")

  // --- Estados de Modales (Inventario) ---
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<FullRoomWithCount | null>(null)
  const [deletingRoom, setDeletingRoom] = useState<FullRoomWithCount | null>(null)
  const [statusChange, setStatusChange] = useState<{
    room: FullRoomWithCount
    newStatus: RoomStatus
  } | null>(null)

  // --- Estados de Modales (Tipos y Precios) ---
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null)
  const [formRoomType, setFormRoomType] =
    useState<RoomTypeInput>(initialRoomTypeForm)

  // --- Estado del Formulario (Inventario) ---
  const [formRoom, setFormRoom] = useState({
    id: "", // N° de Habitación
    roomTypeId: "",
  })

  // --- Carga Inicial de Datos ---
  const fetchRooms = async (filters: { floor?: string; type?: string } = {}) => {
    setIsLoadingRooms(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.floor && filters.floor !== "all") params.set("floor", filters.floor)
      if (filters.type && filters.type !== "all") params.set("roomTypeId", filters.type)

      // API actualizada
      const response = await fetch(`/api/gerencia/habitaciones?${params.toString()}`)
      if (!response.ok) {
        throw new Error("No se pudieron cargar las habitaciones")
      }
      const data = await response.json()
      setRooms(data.rooms || [])
    } catch (err: any) {
      setError(err.message)
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsLoadingRooms(false)
    }
  }

  const fetchRoomTypes = async () => {
    setIsLoadingTypes(true)
    try {
      const response = await fetch(`/api/gerencia/room-types`)
      if (!response.ok) {
        throw new Error("No se pudieron cargar los tipos de habitación")
      }
      const data = await response.json()
      setRoomTypes(data || [])
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsLoadingTypes(false)
    }
  }

  useEffect(() => {
    fetchRooms()
    fetchRoomTypes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Cargar solo al inicio

  // --- Handlers de Filtros ---
  const handleFilterApply = () => {
    fetchRooms({ floor: filterFloor, type: filterType })
  }

  const handleFilterClear = () => {
    setFilterFloor("all")
    setFilterType("all")
    fetchRooms()
  }

  // --- Handlers de Formulario (Inventario) ---
  const resetFormRoom = () => {
    setFormRoom({ id: "", roomTypeId: "" })
  }

  const openEditRoomDialog = (room: FullRoomWithCount) => {
    setFormRoom({
      id: room.id,
      roomTypeId: room.roomTypeId,
    })
    setEditingRoom(room)
  }

  const openCreateRoomDialog = () => {
    resetFormRoom()
    setIsCreateOpen(true)
  }

  // --- Handlers de API (Inventario CRUD) ---

  const handleCreateRoom = async () => {
    if (!formRoom.id || !formRoom.roomTypeId) {
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
        body: JSON.stringify(formRoom),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || data.error || "Error al crear")
      }
      toast({ title: "Éxito", description: `Habitación ${data.room.id} creada.` })
      setIsCreateOpen(false)
      fetchRooms() // Recargar habitaciones
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const handleEditRoom = async () => {
    if (!editingRoom) return

    try {
      const response = await fetch(
        `/api/gerencia/habitaciones/${editingRoom.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomTypeId: formRoom.roomTypeId }),
        }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar")
      }
      toast({ title: "Éxito", description: "Habitación actualizada." })
      setEditingRoom(null)
      fetchRooms()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

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
        // Capturamos el error 409
        throw new Error(data.message || "Error al cambiar estado")
      }
      toast({
        title: "Éxito",
        description: `Habitación ${statusChange.room.id} ahora está ${statusChange.newStatus}.`,
      })
      setStatusChange(null)
      fetchRooms() // Recargar
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const handleDeleteRoom = async () => {
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
      fetchRooms() // Recargar
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  // --- Handlers de API (Tipos y Precios) ---

  const openEditRoomTypeDialog = (roomType: RoomType) => {
    setFormRoomType({
      name: roomType.name,
      description: roomType.description || "",
      basePrice: roomType.basePrice,
      maxGuests: roomType.maxGuests,
      includesBreakfast: roomType.includesBreakfast,
      includesSpa: roomType.includesSpa,
      isActive: roomType.isActive,
    })
    setEditingRoomType(roomType)
  }

  const handleUpdateRoomType = async () => {
    if (!editingRoomType) return

    try {
      const response = await fetch(
        `/api/gerencia/room-types/${editingRoomType.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formRoomType),
        }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || data.error || "Error al actualizar")
      }
      toast({
        title: "Éxito",
        description: `Tipo ${data.roomType.name} actualizado.`,
      })
      setEditingRoomType(null)
      fetchRoomTypes() // Recargar solo los tipos
      fetchRooms() // Recargar habitaciones por si cambió el nombre del tipo
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

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

  // --- Renderizado ---

  const renderInventarioTab = () => (
    <TabsContent value="inventario">
      {/* --- Filtros --- */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros de Inventario</CardTitle>
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
                {[1, 2, 3].map((f) => (
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
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Inventario de Habitaciones ({rooms.length})</CardTitle>
          <Button onClick={openCreateRoomDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Habitación
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">N° Hab.</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-[80px]">Piso</TableHead>
                  <TableHead className="w-[120px]">Estado</TableHead>
                  <TableHead className="w-[120px]">Reservas Activas</TableHead>
                  <TableHead className="w-[280px] text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingRooms ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-red-600"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                ) : rooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
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
                      <TableCell>
                        <Badge
                          variant={
                            room._count.reservations > 0
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {room._count.reservations}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-1 text-right">
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditRoomDialog(room)}
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
    </TabsContent>
  )

  const renderTiposTab = () => (
    <TabsContent value="tipos">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Tipos y Precios</CardTitle>
          <CardDescription>
            Define los precios base, capacidad y detalles de cada tipo de
            habitación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="w-[150px]">Precio Base</TableHead>
                  <TableHead className="w-[120px]">Huéspedes Max.</TableHead>
                  <TableHead className="w-[100px]">Estado</TableHead>
                  <TableHead className="w-[120px] text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingTypes ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : roomTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No se encontraron tipos de habitación.
                    </TableCell>
                  </TableRow>
                ) : (
                  roomTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell>
                        ${type.basePrice.toFixed(2)}
                      </TableCell>
                      <TableCell>{type.maxGuests}</TableCell>
                      <TableCell>
                        {type.isActive ? (
                          <Badge variant="default">Activo</Badge>
                        ) : (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditRoomTypeDialog(type)}
                        >
                          <Pencil className="mr-1 h-3 w-3" /> Editar
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
    </TabsContent>
  )

  return (
    <div className="container mx-auto px-16 py-8">
      {/* --- Cabecera --- */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Gestión de Habitaciones</h1>
        <p className="text-muted-foreground">
          Administra el inventario de habitaciones físicas y los tipos de
          habitación.
        </p>
      </div>

      {/* --- Pestañas --- */}
      <Tabs defaultValue="inventario" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventario">
            <Package className="mr-2 h-4 w-4" />
            Inventario de Habitaciones
          </TabsTrigger>
          <TabsTrigger value="tipos">
            <DollarSign className="mr-2 h-4 w-4" />
            Tipos y Precios
          </TabsTrigger>
        </TabsList>

        {/* --- Contenido Pestaña 1: Inventario --- */}
        {renderInventarioTab()}

        {/* --- Contenido Pestaña 2: Tipos y Precios --- */}
        {renderTiposTab()}
      </Tabs>

      {/* --- Modales de Inventario --- */}

      {/* --- Modal Crear Habitación --- */}
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
                value={formRoom.id}
                onChange={(e) =>
                  setFormRoom({ ...formRoom, id: e.target.value })
                }
                placeholder="Ej: 101, 102, 201"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-type">Tipo de Habitación *</Label>
              <Select
                value={formRoom.roomTypeId}
                onValueChange={(value) =>
                  setFormRoom({ ...formRoom, roomTypeId: value })
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
            <Button onClick={handleCreateRoom}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Modal Editar Habitación --- */}
      <Dialog open={!!editingRoom} onOpenChange={() => setEditingRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Habitación: {formRoom.id}</DialogTitle>
            <DialogDescription>
              Puedes cambiar el tipo de habitación asignado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-id">N° Habitación (ID)</Label>
              <Input id="edit-id" value={formRoom.id} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Tipo de Habitación *</Label>
              <Select
                value={formRoom.roomTypeId}
                onValueChange={(value) =>
                  setFormRoom({ ...formRoom, roomTypeId: value })
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
            <Button onClick={handleEditRoom}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Alerta Eliminar Habitación --- */}
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
              asociadas, la eliminación fallará.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoom}>
              Eliminar
            </AlertDialogAction>
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
              {statusChange?.newStatus === "mantenimiento" &&
                statusChange.room._count.reservations > 0 && (
                  <p className="mt-2 font-bold text-red-600">
                    Error: Esta habitación tiene reservas activas y no puede
                    ponerse en mantenimiento.
                  </p>
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              disabled={
                statusChange?.newStatus === "mantenimiento" &&
                statusChange.room._count.reservations > 0
              }
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- Modales de Tipos y Precios --- */}

      {/* --- Modal Editar Tipo de Habitación --- */}
      <Dialog
        open={!!editingRoomType}
        onOpenChange={() => setEditingRoomType(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Tipo: {editingRoomType?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type-name">Nombre *</Label>
                <Input
                  id="type-name"
                  value={formRoomType.name}
                  onChange={(e) =>
                    setFormRoomType({ ...formRoomType, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type-price">Precio Base *</Label>
                <Input
                  id="type-price"
                  type="number"
                  value={formRoomType.basePrice}
                  onChange={(e) =>
                    setFormRoomType({
                      ...formRoomType,
                      basePrice: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type-guests">Huéspedes Máx. *</Label>
                <Input
                  id="type-guests"
                  type="number"
                  value={formRoomType.maxGuests}
                  onChange={(e) =>
                    setFormRoomType({
                      ...formRoomType,
                      maxGuests: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type-desc">Descripción</Label>
              <Textarea
                id="type-desc"
                value={formRoomType.description}
                onChange={(e) =>
                  setFormRoomType({
                    ...formRoomType,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="type-breakfast"
                  checked={formRoomType.includesBreakfast}
                  onCheckedChange={(checked) =>
                    setFormRoomType({
                      ...formRoomType,
                      includesBreakfast: checked,
                    })
                  }
                />
                <Label htmlFor="type-breakfast">Incluye Desayuno</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="type-spa"
                  checked={formRoomType.includesSpa}
                  onCheckedChange={(checked) =>
                    setFormRoomType({ ...formRoomType, includesSpa: checked })
                  }
                />
                <Label htmlFor="type-spa">Incluye Spa</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="type-active"
                  checked={formRoomType.isActive}
                  onCheckedChange={(checked) =>
                    setFormRoomType({ ...formRoomType, isActive: checked })
                  }
                />
                <Label htmlFor="type-active">Activo</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingRoomType(null)}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateRoomType}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}