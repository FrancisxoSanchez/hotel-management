"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { mockUsers } from "@/lib/mock-data"
import type { User } from "@/lib/types"
import { Plus, Pencil, Trash2, Mail, Phone } from "lucide-react"

export default function GerenciaOperadoresPage() {
  const { toast } = useToast()
  const [operators, setOperators] = useState(mockUsers.filter((u) => u.role === "operador"))
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingOperator, setEditingOperator] = useState<User | null>(null)
  const [deletingOperator, setDeletingOperator] = useState<User | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
    })
  }

  const handleCreate = () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    const newOperator: User = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: "operador",
      createdAt: new Date(),
    }

    setOperators([...operators, newOperator])
    mockUsers.push(newOperator)

    toast({
      title: "Operador creado",
      description: "El operador ha sido agregado exitosamente",
    })
    setIsCreateOpen(false)
    resetForm()
  }

  const handleEdit = () => {
    if (!editingOperator) return

    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    const updatedOperators = operators.map((o) =>
      o.id === editingOperator.id
        ? {
            ...o,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            ...(formData.password && { password: formData.password }),
          }
        : o,
    )

    setOperators(updatedOperators)

    // Update in mockUsers as well
    const userIndex = mockUsers.findIndex((u) => u.id === editingOperator.id)
    if (userIndex !== -1) {
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        ...(formData.password && { password: formData.password }),
      }
    }

    toast({
      title: "Operador actualizado",
      description: "Los cambios han sido guardados exitosamente",
    })
    setEditingOperator(null)
    resetForm()
  }

  const handleDelete = () => {
    if (!deletingOperator) return

    setOperators(operators.filter((o) => o.id !== deletingOperator.id))

    // Remove from mockUsers as well
    const userIndex = mockUsers.findIndex((u) => u.id === deletingOperator.id)
    if (userIndex !== -1) {
      mockUsers.splice(userIndex, 1)
    }

    toast({
      title: "Operador eliminado",
      description: "El operador ha sido eliminado del sistema",
    })
    setDeletingOperator(null)
  }

  const openEditDialog = (operator: User) => {
    setEditingOperator(operator)
    setFormData({
      name: operator.name,
      email: operator.email,
      phone: operator.phone || "",
      password: "",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Gestión de Operadores</h1>
          <p className="text-muted-foreground">Administra el equipo de operadores del hotel</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Operador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Operador</DialogTitle>
              <DialogDescription>Completa la información del nuevo operador</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Juan Pérez"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="operador@hotel.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+54 11 1234-5678"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>Crear Operador</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Operators Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {operators.map((operator) => (
          <Card key={operator.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{operator.name}</CardTitle>
                  <Badge variant="secondary" className="mt-2">
                    Operador
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{operator.email}</span>
                </div>
                {operator.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{operator.phone}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => openEditDialog(operator)}
                >
                  <Pencil className="mr-2 h-3 w-3" />
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeletingOperator(operator)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingOperator} onOpenChange={() => setEditingOperator(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Operador</DialogTitle>
            <DialogDescription>Actualiza la información del operador</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre Completo *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">Nueva Contraseña (dejar vacío para mantener)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingOperator(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingOperator} onOpenChange={() => setDeletingOperator(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar operador?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El operador será eliminado permanentemente del sistema y perderá acceso
              a la plataforma.
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
