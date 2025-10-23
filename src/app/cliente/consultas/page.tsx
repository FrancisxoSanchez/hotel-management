"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Mail, Phone, MapPin, Send } from "lucide-react"

export default function ConsultasPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState(user?.email || "")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Consulta enviada",
      description: "Nos pondremos en contacto contigo pronto",
    })

    setMessage("")
    setIsSubmitting(false)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Contáctanos</h1>
        <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
          ¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para asistirte
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Enviar Consulta</CardTitle>
            <CardDescription>Completa el formulario y te responderemos a la brevedad</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Enviando..."
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

        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
              <CardDescription>Otras formas de comunicarte con nosotros</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Teléfono</p>
                  <p className="text-sm text-muted-foreground">+54 11 5555-0000</p>
                  <p className="text-xs text-muted-foreground">Disponible 24/7</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">info@hotelgrandvista.com</p>
                  <p className="text-xs text-muted-foreground">Respuesta en 24 horas</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Dirección</p>
                  <p className="text-sm text-muted-foreground">Av. Principal 1234</p>
                  <p className="text-sm text-muted-foreground">Buenos Aires, Argentina</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horarios de Atención</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Recepción:</span>
                <span className="text-sm text-muted-foreground">24 horas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Check-in:</span>
                <span className="text-sm text-muted-foreground">15:00 hs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Check-out:</span>
                <span className="text-sm text-muted-foreground">11:00 hs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Restaurante:</span>
                <span className="text-sm text-muted-foreground">07:00 - 23:00 hs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Spa:</span>
                <span className="text-sm text-muted-foreground">09:00 - 21:00 hs</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-base">Preguntas Frecuentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium">¿Cuál es la política de cancelación?</p>
                <p className="text-muted-foreground">Puedes cancelar hasta 48 horas antes sin cargo.</p>
              </div>
              <div>
                <p className="font-medium">¿Aceptan mascotas?</p>
                <p className="text-muted-foreground">Sí, consulta por cargos adicionales.</p>
              </div>
              <div>
                <p className="font-medium">¿Hay estacionamiento?</p>
                <p className="text-muted-foreground">Sí, estacionamiento gratuito para huéspedes.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
