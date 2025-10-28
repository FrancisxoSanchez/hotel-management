"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import {
  Calendar,
  Users,
  CreditCard,
  Home,
  User,
  Mail,
  Phone,
  IdCard,
  Loader2,
  X,
  CheckCircle,
  Coffee,
  Waves,
} from "lucide-react";
import type { ReservationStatus } from "@prisma/client";

interface ReservationDetail {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  status: ReservationStatus;
  totalPrice: number;
  depositPaid: number;
  includesBreakfast: boolean;
  includesSpa: boolean;
  createdAt: string;
  cancelledAt: string | null;
  room: {
    id: string;
    roomType: {
      name: string;
      images: string[];
      basePrice: number;
      maxGuests: number;
    };
  };
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  guests: Array<{
    id: string;
    name: string;
    dni: string;
    email: string;
    phone: string;
  }>;
}

interface ReservationDetailModalProps {
  reservationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReservationCancelled?: () => void;
}

export function ReservationDetailModal({
  reservationId,
  open,
  onOpenChange,
  onReservationCancelled,
}: ReservationDetailModalProps) {
  const { toast } = useToast();
  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Cargar detalles de la reserva
  useEffect(() => {
    if (!reservationId || !open) {
      setReservation(null);
      return;
    }

    const fetchReservationDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/operador/reservas/${reservationId}`);

        if (!response.ok) {
          throw new Error("No se pudieron cargar los detalles");
        }

        const data = await response.json();
        setReservation(data.reservation);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        onOpenChange(false);
      } finally {
        setLoading(false);
      }
    };

    fetchReservationDetails();
  }, [reservationId, open, toast, onOpenChange]);

  // Manejar cancelación
  const handleCancelReservation = async () => {
    if (!reservationId) return;

    setCancelling(true);
    try {
      const response = await fetch(`/api/operador/reservas/${reservationId}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        let errorDetails = "No se pudo cancelar la reserva";
        try {
          const errData = await response.json();
          errorDetails = errData.error || errData.message || JSON.stringify(errData);
        } catch (e) {
          errorDetails = response.statusText;
        }
        throw new Error(errorDetails);
      }

      toast({
        title: "Reserva cancelada",
        description: "La reserva ha sido cancelada exitosamente",
      });

      setShowCancelDialog(false);
      onOpenChange(false);
      onReservationCancelled?.();
    } catch (err: any) {
      toast({
        title: "Error al cancelar",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: ReservationStatus) => {
    const variants = {
      pendiente: { variant: "secondary" as const, label: "Pendiente" },
      confirmada: { variant: "default" as const, label: "Confirmada" },
      finalizada: { variant: "outline" as const, label: "Finalizada" },
      cancelada: { variant: "destructive" as const, label: "Cancelada" },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const canCancel = reservation?.status === "pendiente";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalles de la Reserva</span>
              {reservation && getStatusBadge(reservation.status)}
            </DialogTitle>
            <DialogDescription>
              {reservation && `Reserva ID: ${reservation.id}`}
            </DialogDescription>
          </DialogHeader>

          {loading && (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && reservation && (
            <div className="space-y-6">
              {/* Información de la Habitación */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <Home className="h-5 w-5" />
                  Habitación
                </h3>
                <div className="rounded-lg border p-4">
                  <div className="flex items-start gap-4">
                    {reservation.room.roomType.images[0] && (
                      <img
                        src={reservation.room.roomType.images[0]}
                        alt={reservation.room.roomType.name}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">
                        {reservation.room.roomType.name} - Habitación {reservation.room.id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Capacidad: {reservation.room.roomType.maxGuests} personas
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Precio base: ${reservation.room.roomType.basePrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Fechas y Estadía */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <Calendar className="h-5 w-5" />
                  Estadía
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="mb-1 text-sm text-muted-foreground">Check-in</p>
                    <p className="font-semibold">
                      {format(new Date(reservation.checkInDate), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                    <p className="text-sm text-muted-foreground">15:00 hs</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="mb-1 text-sm text-muted-foreground">Check-out</p>
                    <p className="font-semibold">
                      {format(new Date(reservation.checkOutDate), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                    <p className="text-sm text-muted-foreground">11:00 hs</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Cliente */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <User className="h-5 w-5" />
                  Cliente
                </h3>
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{reservation.user.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{reservation.user.email}</span>
                  </div>
                  {reservation.user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{reservation.user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Huéspedes */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <Users className="h-5 w-5" />
                  Huéspedes ({reservation.guests.length})
                </h3>
                <div className="space-y-2">
                  {reservation.guests.map((guest) => (
                    <div key={guest.id} className="rounded-lg border p-3">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{guest.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <IdCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">DNI: {guest.dni}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{guest.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{guest.phone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Información de Pago */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <CreditCard className="h-5 w-5" />
                  Pago
                </h3>
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-semibold">${reservation.totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pagado</span>
                    <span className="font-semibold text-green-600">
                      ${reservation.depositPaid.toLocaleString()}
                    </span>
                  </div>
                  {reservation.depositPaid < reservation.totalPrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pendiente</span>
                      <span className="font-semibold text-yellow-600">
                        ${(reservation.totalPrice - reservation.depositPaid).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex flex-wrap gap-2">
                    {reservation.includesBreakfast && (
                      <Badge variant="outline" className="gap-1">
                        <Coffee className="h-3 w-3" />
                        Incluye Desayuno
                      </Badge>
                    )}
                    {reservation.includesSpa && (
                      <Badge variant="outline" className="gap-1">
                        <Waves className="h-3 w-3" />
                        Incluye Spa
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Fechas de sistema */}
              <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                <p>
                  Reserva creada: {format(new Date(reservation.createdAt), "d/MM/yyyy HH:mm", { locale: es })}
                </p>
                {reservation.cancelledAt && (
                  <p>
                    Cancelada: {format(new Date(reservation.cancelledAt), "d/MM/yyyy HH:mm", { locale: es })}
                  </p>
                )}
              </div>

              {/* Acciones */}
              {canCancel && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cerrar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={cancelling}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar Reserva
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de cancelación */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará la reserva como cancelada y liberará la habitación. 
              El cliente será notificado de la cancelación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>No, mantener</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelReservation}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Sí, cancelar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}