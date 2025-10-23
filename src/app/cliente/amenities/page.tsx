import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockAmenities } from "@/lib/mock-data"
import { Sparkles } from "lucide-react"

export default function AmenitiesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Nuestras Instalaciones</h1>
        <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
          Disfruta de servicios y comodidades de clase mundial diseñados para hacer tu estadía inolvidable
        </p>
      </div>

      <div className="space-y-12">
        {mockAmenities.map((amenity, index) => (
          <Card key={amenity.id} className="overflow-hidden">
            <div className={`grid gap-8 lg:grid-cols-2 ${index % 2 === 1 ? "lg:grid-flow-dense" : ""}`}>
              <div className={`relative h-[300px] lg:h-auto ${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                <Image src={amenity.images[0] || "/placeholder.svg"} alt={amenity.name} fill className="object-cover" />
              </div>
              <div className="flex flex-col justify-center p-6 lg:p-8">
                <CardHeader className="p-0">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-2xl">{amenity.name}</CardTitle>
                  <CardDescription className="text-base">{amenity.description}</CardDescription>
                </CardHeader>
                {amenity.images.length > 1 && (
                  <CardContent className="mt-6 p-0">
                    <div className="grid grid-cols-2 gap-4">
                      {amenity.images.slice(1).map((image, imgIndex) => (
                        <div key={imgIndex} className="relative h-32 overflow-hidden rounded-lg">
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`${amenity.name} - ${imgIndex + 2}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <Card className="mt-12 bg-muted/30">
        <CardHeader>
          <CardTitle>Información Importante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Todas las instalaciones están disponibles para huéspedes del hotel</p>
          <p>• Algunos servicios pueden requerir reserva previa</p>
          <p>• El horario de atención puede variar según la instalación</p>
          <p>• Consulta en recepción para más información sobre horarios y disponibilidad</p>
        </CardContent>
      </Card>
    </div>
  )
}
