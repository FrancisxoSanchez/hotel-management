"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import type { Consultation } from "@/lib/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Mail, Send, CheckCircle, Clock } from "lucide-react"

// Mock consultations data
const mockConsultations: Consultation[] = [
  {
    id: "1",
    email: "cliente@example.com",
    message: "¿Tienen disponibilidad para la primera semana de enero?",
    isAttended: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "2",
    email: "juan@example.com",
    message: "¿Aceptan mascotas? Tengo un perro pequeño.",
    isAttended: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: "3",
    email: "maria@example.com",
    message: "¿Cuál es la política de cancelación?",
    response:
      "Puedes cancelar hasta 48 horas antes sin cargo. Después de ese plazo, se cobra el 50% de la primera noche.",
    isAttended: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    attendedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
    attendedBy: "operador@hotel.com",
  },
]

export default function ConsultasOperadorPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [consultations, setConsultations] = useState(mockConsultations)
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [response, setResponse] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const pendingConsultations = consultations.filter((c) => !c.isAttended)
  const attendedConsultations = consultations.filter((c) => c.isAttended)

  const handleSelectConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
    setResponse(consultation.response || "")
  }

  const handleSubmitResponse = async () => {
    if (!selectedConsultation || !response.trim()) {
      toast({
        title: "Error",
        description: "Por favor escribe una respuesta",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedConsultations = consultations.map((c) =>
      c.id === selectedConsultation.id
        ? {
            ...c,
            response,
            isAttended: true,
            attendedAt: new Date(),
            attendedBy: user?.email,
          }
        : c,
    )

    setConsultations(updatedConsultations)

    toast({
      title: "Respuesta enviada",
      description: "La consulta ha sido atendida exitosamente",
    })

    setSelectedConsultation(null)
    setResponse("")
    setIsSubmitting(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
                            {format(consultation.createdAt, "d MMM yyyy, HH:mm", { locale: es })}
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
                            Atendida el {format(consultation.attendedAt!, "d MMM yyyy", { locale: es })}
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
                      {format(selectedConsultation.createdAt, "d MMM yyyy, HH:mm", { locale: es })}
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
                      <strong>Atendida por:</strong> {selectedConsultation.attendedBy}
                      <br />
                      <strong>Fecha:</strong>{" "}
                      {format(selectedConsultation.attendedAt!, "d MMM yyyy, HH:mm", { locale: es })}
                    </p>
                  </div>
                )}

                {!selectedConsultation.isAttended && (
                  <Button onClick={handleSubmitResponse} className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Respuesta
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
