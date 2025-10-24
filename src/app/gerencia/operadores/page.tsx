"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@prisma/client";
import { Plus, Pencil, Trash2, Mail, Phone, Loader2 } from "lucide-react";

// Definimos un tipo local para el operador (sin password)
type Operator = Omit<User, "password">;

export default function GerenciaOperadoresPage() {
  const { toast } = useToast();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Para la carga inicial
  const [isSubmitting, setIsSubmitting] = useState(false); // Para acciones (crear, editar)
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [deletingOperator, setDeletingOperator] = useState<Operator | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // --- Carga de Datos ---
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // La API route ahora existe y es la que acabamos de crear
        const response = await fetch("/api/gerencia/operadores");
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(
            errData.error || "Error al cargar los operadores"
          );
        }
        const data = await response.json();
        setOperators(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Ocurrió un error desconocido";
        setError(errorMessage);
        toast({
          title: "Error de Carga",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchOperators();
  }, [toast]); // Eliminamos 'error' de las dependencias para evitar un loop

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
    });
  };

  // --- Lógica de API ---
  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/gerencia/operadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "No se pudo crear el operador");
      }

      const newOperator = await response.json();
      setOperators([...operators, newOperator]);
      toast({
        title: "Operador creado",
        description: "El operador ha sido agregado exitosamente",
      });
      setIsCreateOpen(false);
      resetForm();
    } catch (err) {
      toast({
        title: "Error al crear",
        description:
          err instanceof Error ? err.message : "Ocurrió un error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingOperator) return;

    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = {
        id: editingOperator.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null, // Enviar null si está vacío
      };
      // Solo enviar contraseña si se escribió una nueva
      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch("/api/gerencia/operadores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "No se pudo actualizar el operador");
      }

      const updatedOperator = await response.json();
      setOperators(
        operators.map((o) =>
          o.id === updatedOperator.id ? updatedOperator : o
        )
      );

      toast({
        title: "Operador actualizado",
        description: "Los cambios han sido guardados exitosamente",
      });
      setEditingOperator(null);
      resetForm();
    } catch (err) {
      toast({
        title: "Error al actualizar",
        description:
          err instanceof Error ? err.message : "Ocurrió un error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingOperator) return;
    setIsSubmitting(true); // Usamos el mismo estado para la eliminación
    try {
      const response = await fetch("/api/gerencia/operadores", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingOperator.id }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "No se pudo eliminar el operador");
      }

      setOperators(operators.filter((o) => o.id !== deletingOperator.id));
      toast({
        title: "Operador eliminado",
        description: "El operador ha sido eliminado del sistema",
      });
      setDeletingOperator(null);
    } catch (err) {
      toast({
        title: "Error al eliminar",
        description:
          err instanceof Error ? err.message : "Ocurrió un error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (operator: Operator) => {
    setEditingOperator(operator);
    setFormData({
      name: operator.name,
      email: operator.email,
      phone: operator.phone || "",
      password: "", // Limpiar campo de contraseña
    });
  };

  // --- Renderizado ---

  if (isLoading) {
    return (
      <div className="flex items-center justify-center pt-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-16 py-8">
      {error && !isLoading && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
          <h2 className="mb-2 text-lg font-bold">Error al cargar datos</h2>
          <p>{error}</p>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Gestión de Operadores</h1>
          <p className="text-muted-foreground">
            Administra el equipo de operadores del hotel
          </p>
        </div>
        <Dialog
          open={isCreateOpen}
          onOpenChange={(isOpen) => {
            setIsCreateOpen(isOpen);
            if (!isOpen) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Operador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Operador</DialogTitle>
              <DialogDescription>
                Completa la información del nuevo operador
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Juan Pérez"
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="operador@hotel.com"
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+54 11 1234-5678"
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Crear Operador
              </Button>
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
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeletingOperator(operator)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingOperator}
        onOpenChange={(isOpen) => {
          if (!isOpen) setEditingOperator(null);
          if (!isOpen) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Operador</DialogTitle>
            <DialogDescription>
              Actualiza la información del operador
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre Completo *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">
                Nueva Contraseña (dejar vacío para mantener)
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingOperator(null)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingOperator}
        onOpenChange={() => setDeletingOperator(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar operador?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El operador será eliminado
              permanentemente del sistema y perderá acceso a la plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

