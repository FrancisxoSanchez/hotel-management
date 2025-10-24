"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import type { Consultation } from "@prisma/client";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Mail, Send, CheckCircle, Clock, Loader2, AlertCircle } from "lucide-react";

// Tipo de dato extendido para incluir el objeto 'attendedBy'
type ConsultationWithAttendant = Consultation & {
  attendedBy: {
    id: string;
    email: string;
    name: string | null;
  } | null;
};

export default function ConsultasOperadorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [consultations, setConsultations] = useState<ConsultationWithAttendant[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationWithAttendant | null>(null);
  const [response, setResponse] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar los datos
  const fetchConsultations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/operador/consultas");
      if (!res.ok) {
        throw new Error("No se pudieron cargar las consultas");
      }
      const data: ConsultationWithAttendant[] = await res.json();
      setConsultations(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error de Carga",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carga inicial de datos
  useEffect(() => {
    fetchConsultations();
  }, []); // Dependencia vacía para que se ejecute solo al montar

  const pendingConsultations = consultations.filter((c) => !c.isAttended);
  const attendedConsultations = consultations.filter((c) => c.isAttended);

  const handleSelectConsultation = (consultation: ConsultationWithAttendant) => {
    setSelectedConsultation(consultation);
    setResponse(consultation.response || "");
  };

  const handleSubmitResponse = async () => {
    if (!selectedConsultation || !response.trim()) {
      toast({
        title: "Error",
        description: "Por favor escribe una respuesta",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error de Autenticación",
        description: "No estás autenticado para realizar esta acción.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/operador/consultas/${selectedConsultation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          response: response,
          attendedById: user.id, // Enviar el ID del usuario logueado
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "No se pudo enviar la respuesta");
      }

      // Éxito: recargar los datos para refrescar las listas
      await fetchConsultations();
      
      toast({
        title: "Respuesta enviada",
        description: "La consulta ha sido atendida exitosamente",
      });

      setSelectedConsultation(null);
      setResponse("");

    } catch (err: any) {
      toast({
        title: "Error al Enviar",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Renderizado con estados de carga y error ---

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-[80vh] items-center justify-center px-16 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto flex h-[80vh] flex-col items-center justify-center px-16 py-8">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold text-destructive">Error al cargar Consultas</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchConsultations} className="mt-4">Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-16 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Consultas</h1>
        <p className="text-muted-foreground">Gestiona y responde las consultas de los clientes</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Consultations List */}
        <div>
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pendientes ({pendingConsultations.length})
              </TabsTrigger>
              <TabsTrigger value="attended" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Atendidas ({attendedConsultations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Consultas Pendientes</CardTitle>
                  <CardDescription>Consultas que requieren respuesta</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingConsultations.length === 0 ? (
                    <div className="py-12 text-center">
                      <CheckCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">No hay consultas pendientes</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingConsultations.map((consultation) => (
                        <button
                          key={consultation.id}
                          onClick={() => handleSelectConsultation(consultation)}
                          className={`w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted ${
                            selectedConsultation?.id === consultation.id ? "border-primary bg-muted" : ""
                          }`}
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{consultation.email}</span>
                            </div>
                            <Badge variant="secondary">Pendiente</Badge>
                          </div>
                          <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{consultation.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(consultation.createdAt as unknown as string), "d MMM yyyy, HH:mm", { locale: es })}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attended" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Consultas Atendidas</CardTitle>
                  <CardDescription>Historial de consultas respondidas</CardDescription>
                </CardHeader>
                <CardContent>
                  {attendedConsultations.length === 0 ? (
                    <div className="py-12 text-center">
                      <Mail className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">No hay consultas atendidas</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {attendedConsultations.map((consultation) => (
                        <button
                          key={consultation.id}
                          onClick={() => handleSelectConsultation(consultation)}
                          className={`w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted ${
                            selectedConsultation?.id === consultation.id ? "border-primary bg-muted" : ""
                          }`}
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{consultation.email}</span>
                            </div>
                            <Badge variant="outline">Atendida</Badge>
                          </div>
                          <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{consultation.message}</p>
                          <p className="text-xs text-muted-foreground">
                            Atendida el {format(parseISO(consultation.attendedAt! as unknown as string), "d MMM yyyy", { locale: es })}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Response Form */}
        <div>
          {!selectedConsultation ? (
            <Card>
              <CardContent className="flex min-h-[400px] items-center justify-center p-12">
                <div className="text-center">
                  <Mail className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Selecciona una consulta para ver los detalles</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{selectedConsultation.isAttended ? "Consulta Atendida" : "Responder Consulta"}</CardTitle>
                <CardDescription>
                  {selectedConsultation.isAttended ? "Detalles de la consulta" : "Escribe tu respuesta al cliente"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Consultation Details */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label className="text-sm font-medium">De:</Label>
                    <span className="text-sm text-muted-foreground">{selectedConsultation.email}</span>
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <Label className="text-sm font-medium">Fecha:</Label>
                    <span className="text-sm text-muted-foreground">
                      {format(parseISO(selectedConsultation.createdAt as unknown as string), "d MMM yyyy, HH:mm", { locale: es })}
                    </span>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <Label className="mb-2 block text-sm font-medium">Mensaje:</Label>
                    <p className="text-sm">{selectedConsultation.message}</p>
                  </div>
                </div>

                {/* Response */}
                <div className="space-y-2">
                  <Label htmlFor="response">Respuesta:</Label>
                  <Textarea
                    id="response"
                    placeholder="Escribe tu respuesta aquí..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={8}
                    disabled={selectedConsultation.isAttended}
                  />
                </div>

                {selectedConsultation.isAttended && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                    <p className="text-sm text-green-900 dark:text-green-100">
                      <strong>Atendida por:</strong> {selectedConsultation.attendedBy?.email || "N/A"}
                      <br />
                      <strong>Fecha:</strong>{" "}
                      {format(parseISO(selectedConsultation.attendedAt! as unknown as string), "d MMM yyyy, HH:mm", { locale: es })}
                    </p>
                  </div>
                )}

                {!selectedConsultation.isAttended && (
                  <Button onClick={handleSubmitResponse} className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    {isSubmitting ? "Enviando..." : "Enviar Respuesta"}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
