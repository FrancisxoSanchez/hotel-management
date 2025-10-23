"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { mockRooms } from "@/lib/mock-data"
import { ArrowLeft, Users, Check, Coffee, Sparkles } from "lucide-react"

export default function RoomDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const room = mockRooms.find((r) => r.id === params.id)

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-12 text-center">
          <p className="text-lg text-muted-foreground">Habitación no encontrada</p>
          <Button onClick={() => router.push("/cliente/habitaciones")} variant="outline" className="mt-4">
            Volver a habitaciones
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <Button onClick={() => router.back()} variant="ghost" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative h-[400px] w-full overflow-hidden rounded-lg lg:h-[500px]">
            <Image
              src={room.images[currentImageIndex] || "/placeholder.svg"}
              alt={room.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {room.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative h-24 overflow-hidden rounded-lg border-2 transition-all ${
                  currentImageIndex === index ? "border-primary" : "border-transparent"
                }`}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${room.name} - ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Room Details */}
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-start justify-between">
              <h1 className="text-3xl font-bold">{room.name}</h1>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Hasta {room.maxGuests} {room.maxGuests === 1 ? "huésped" : "huéspedes"}
              </Badge>
            </div>
            <p className="text-pretty text-lg text-muted-foreground">{room.description}</p>
          </div>

          <Separator />

          {/* Price */}
          <Card>
            <CardHeader>
              <CardTitle>Precio Base</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">${room.basePrice.toLocaleString()}</span>
                <span className="text-muted-foreground">por noche</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                * El precio puede variar según servicios adicionales seleccionados
              </p>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Servicios Incluidos</CardTitle>
              <CardDescription>Esta habitación cuenta con las siguientes comodidades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {room.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Services */}
          <Card>
            <CardHeader>
              <CardTitle>Servicios Adicionales</CardTitle>
              <CardDescription>Disponibles para agregar a tu reserva</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Coffee className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium">Desayuno Buffet</p>
                    <p className="text-sm text-muted-foreground">Incluye buffet completo</p>
                  </div>
                </div>
                <Badge variant="outline">Opcional</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium">Servicio de Spa</p>
                    <p className="text-sm text-muted-foreground">Acceso al spa y tratamientos</p>
                  </div>
                </div>
                <Badge variant="outline">Opcional</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={() => router.push(`/cliente/reservar/${room.id}`)} size="lg" className="flex-1">
              Reservar Ahora
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
