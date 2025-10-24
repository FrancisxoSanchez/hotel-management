// src/app/cliente/habitaciones/[id]/page.tsx

import { getRoomById } from "@/prisma/detallehabitacion"
import { RoomDetailClient } from "@/components/room-detail-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RoomDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    checkIn?: string
    checkOut?: string
  }>
}

export default async function RoomDetailPage({
  params,
  searchParams,
}: RoomDetailPageProps) {
  // Await tanto params como searchParams
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  const { id } = resolvedParams
  const { checkIn, checkOut } = resolvedSearchParams

  // Cargar datos de la habitación desde la BD
  const room = await getRoomById(id)

  // Si no existe o no está activa
  if (!room) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <Card className="p-12 text-center">
          <CardHeader>
            <CardTitle>Habitación no encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-lg text-muted-foreground">
              La habitación que buscas no existe o no está disponible actualmente.
            </p>
            <Button asChild variant="outline">
              <a href="/cliente/habitaciones">Volver a habitaciones</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Renderizar componente de cliente con los datos
  return <RoomDetailClient room={room} checkIn={checkIn} checkOut={checkOut} />
}