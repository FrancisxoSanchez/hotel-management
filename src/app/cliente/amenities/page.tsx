// CORRECCIÓN: Eliminamos la importación de 'next/image'
// import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// CORRECCIÓN: Importamos la función de Prisma directamente y su tipo
import type { FullAmenity } from '../../../prisma/amenities';
import { getAllAmenities } from '../../../prisma/amenities';
import { Sparkles } from 'lucide-react';

// CORRECCIÓN: Eliminamos la función getAmenitiesData() y la API_URL
// ya que llamaremos a Prisma directamente.

// Convertimos la página en un Componente de Servidor (async)
export default async function AmenitiesPage() {
  // CORRECCIÓN: Llamamos a la función de Prisma directamente
  const amenities = await getAllAmenities();

  return (
    // AJUSTE: Añadido max-w-7xl para márgenes más amplios
    <div className="container max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Nuestras Instalaciones</h1>
        <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
          Disfruta de servicios y comodidades de clase mundial diseñados para
          hacer tu estadía inolvidable
        </p>
      </div>

      <div className="space-y-12">
        {amenities.length > 0 ? (
          amenities.map((amenity, index) => (
            <Card key={amenity.id} className="overflow-hidden">
              <div
                className={`grid gap-8 lg:grid-cols-2 ${
                  index % 2 === 1 ? 'lg:grid-flow-dense' : ''
                }`}
              >
                <div
                  className={`relative h-[300px] lg:h-auto ${
                    index % 2 === 1 ? 'lg:col-start-2' : ''
                  }`}
                >
                  {/* CORRECCIÓN: Reemplazado <Image> por <img> y eliminado onError */}
                  <img
                    src={amenity.images[0] || 'https://placehold.co/800x600/EEE/333?text=Instalacion'}
                    alt={amenity.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 lg:p-8">
                  <CardHeader className="p-0">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                      <Sparkles className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-2xl">{amenity.name}</CardTitle>
                    <CardDescription className="text-base">
                      {amenity.description}
                    </CardDescription>
                  </CardHeader>
                  {/* Mostrar imágenes secundarias si existen */}
                  {amenity.images.length > 1 && (
                    <CardContent className="mt-6 p-0">
                      <div className="grid grid-cols-2 gap-4">
                        {amenity.images.slice(1, 3).map((image, imgIndex) => ( 
                          <div
                            key={imgIndex}
                            className="relative h-32 overflow-hidden rounded-lg"
                          >
                            {/* CORRECCIÓN: Reemplazado <Image> por <img> y eliminado onError */}
                            <img
                              src={image || 'https://placehold.co/400x300/EEE/333?text=Detalle'}
                              alt={`${amenity.name} - ${imgIndex + 2}`}
                              className="absolute inset-0 h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="py-12 text-center">
            <CardContent>
              <p className="text-lg text-muted-foreground">
                No hay instalaciones disponibles en este momento.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

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
  );
}