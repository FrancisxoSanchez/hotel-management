"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "../../../hooks/use-toast";
import { useAuth } from "../../../lib/auth-context";
import { Mail, Send, Loader2, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { Consultation } from "@prisma/client";

// Tipo extendido para incluir la info del operador
type ClientConsultation = Consultation & {
  attendedBy: {
    name: string | null;
    email: string;
  } | null;
};

export default function ConsultasPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estado para el formulario
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para la lista de consultas
  const [myConsultations, setMyConsultations] = useState<ClientConsultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar "Mis Consultas"
  const fetchMyConsultations = async () => {
    if (!user) return; // No hacer nada si el usuario no está cargado

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/cliente/consultas?email=${encodeURIComponent(user.email)}`);
      if (!response.ok) {
        throw new Error("No se pudieron cargar tus consultas");
      }
      const data: ClientConsultation[] = await response.json();
      setMyConsultations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar consultas cuando el 'user' esté disponible
  useEffect(() => {
    if (user) {
      setEmail(user.email);
      fetchMyConsultations();
    }
  }, [user]); // Depende del objeto user

  // Manejador para enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/cliente/consultas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      });

      if (!response.ok) {
        throw new Error('Falló el envío de la consulta');
      }

      toast({
        title: "Consulta enviada",
        description: "Nos pondremos en contacto contigo pronto",
      });

      setMessage(""); // Limpiar el mensaje
      await fetchMyConsultations(); // Recargar la lista

    } catch (error) {
      console.error('Error en handleSubmit:', error);
      toast({
        title: "Error al enviar",
        description: "Hubo un problema al enviar tu consulta. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingConsultations = myConsultations.filter((c) => !c.isAttended);
  const attendedConsultations = myConsultations.filter((c) => c.isAttended);

  return (
    <div className="container mx-auto px-4 py-12 md:px-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Consultas</h1>
        <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
          Envía una nueva consulta o revisa el historial de tus consultas anteriores.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Columna 1: Enviar Consulta */}
        <Card>
          <CardHeader>
            <CardTitle>Enviar Nueva Consulta</CardTitle>
            <CardDescription>Completa el formulario y te responderemos a la brevedad</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Tu Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting || !!user} // Deshabilitar si está enviando o si está logueado
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  placeholder="Escribe tu consulta aquí..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Consulta
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Columna 2: Mis Consultas */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Consultas</CardTitle>
            <CardDescription>Historial de tus consultas enviadas</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pendientes ({pendingConsultations.length})
                </TabsTrigger>
                <TabsTrigger value="attended" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Respondidas ({attendedConsultations.length})
                </TabsTrigger>
              </TabsList>

              {/* Estado de Carga o Error */}
              {isLoading ? (
                <div className="flex h-60 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="flex h-60 flex-col items-center justify-center text-destructive">
                  <AlertCircle className="h-8 w-8" />
                  <p className="mt-2 text-sm font-medium">{error}</p>
                </div>
              ) : (
                <>
                  {/* Pestaña Pendientes */}
                  <TabsContent value="pending" className="mt-4">
                    {pendingConsultations.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground">
                        <Mail className="mx-auto mb-4 h-10 w-10" />
                        <p>No tienes consultas pendientes.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingConsultations.map((c) => (
                          <div key={c.id} className="rounded-lg border p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">
                                {format(parseISO(c.createdAt as unknown as string), "d MMM yyyy, HH:mm", { locale: es })}
                              </p>
                              <Badge variant="secondary">Pendiente</Badge>
                            </div>
                            <p className="text-sm">{c.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Pestaña Respondidas */}
                  <TabsContent value="attended" className="mt-4">
                    {attendedConsultations.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground">
                        <Mail className="mx-auto mb-4 h-10 w-10" />
                        <p>No tienes consultas respondidas.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {attendedConsultations.map((c) => (
                          <div key={c.id} className="rounded-lg border p-4">
                            <div className="mb-3 flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">
                                {format(parseISO(c.createdAt as unknown as string), "d MMM yyyy, HH:mm", { locale: es })}
                              </p>
                              <Badge variant="outline">Respondida</Badge>
                            </div>
                            <p className="mb-3 text-sm">{c.message}</p>
                            
                            {/* La Respuesta */}
                            <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
                              <p className="mb-2 text-xs font-semibold text-green-800 dark:text-green-100">
                                Respuesta de {c.attendedBy?.name || 'Operador'} (
                                {c.attendedAt ? format(parseISO(c.attendedAt as unknown as string), "d MMM yyyy", { locale: es }) : 'N/A'}
                                )
                              </p>
                              <p className="text-sm text-green-900 dark:text-green-50">{c.response}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
