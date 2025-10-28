import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getHomePageData } from '@/prisma/home'; 

import { Users, Sparkles, Phone, Mail } from 'lucide-react';

// Convertimos la página en un Componente de Servidor (async)
export default async function ClientHomePage() {
  
  // Llamamos a la función de Prisma directamente.
  const { featuredRooms, featuredAmenities } = await getHomePageData();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[600px] w-full overflow-hidden">
        <img
          src="/luxury-hotel-suite-bedroom.jpg"
          alt="Hotel Grand Vista"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="container max-w-7xl relative mx-auto flex h-full items-center px-4">
          <div className="max-w-2xl space-y-6 text-white">
            <Badge className="bg-accent text-accent-foreground">
              Bienvenido
            </Badge>
            <h1 className="text-balance text-5xl font-bold leading-tight md:text-6xl">
              Hotel Grand Vista
            </h1>
            <p className="text-pretty text-xl text-white/90">
              Experimenta el lujo y la comodidad en el corazón de la ciudad.
              Habitaciones elegantes, servicios de primera clase y una atención
              excepcional.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                <a href="/cliente/habitaciones">Ver Habitaciones</a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 bg-transparent"
              >
                <a href="/cliente/consultas">Contactar</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="container max-w-7xl mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Nuestras Habitaciones
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            Descubre nuestras elegantes habitaciones diseñadas para tu máximo
            confort y relajación
          </p>
        </div>

        {featuredRooms.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden">
                <div className="relative h-64 w-full">
                  <img
                    src={room.images[0] || 'https://placehold.co/600x400/EEE/333?text=Habitacion'}
                    alt={room.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{room.name}</CardTitle>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {room.maxGuests}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {room.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      ${room.basePrice.toLocaleString('es-AR')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      por noche
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No hay habitaciones destacadas disponibles en este momento.
          </p>
        )}

        <div className="mt-12 text-center">
          <Button asChild size="lg" variant="outline">
            <a href="/cliente/habitaciones">Ver Todas las Habitaciones</a>
          </Button>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="bg-muted/30 py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Nuestras Instalaciones
            </h2>
            <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
              Disfruta de servicios y comodidades de clase mundial durante tu
              estadía
            </p>
          </div>

          {featuredAmenities.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featuredAmenities.map((amenity) => (
                <Card key={amenity.id} className="overflow-hidden">
                  <div className="relative h-48 w-full">
                    <img
                      src={amenity.images[0] || 'https://placehold.co/600x400/EEE/333?text=Instalacion'}
                      alt={amenity.name}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="h-5 w-5 text-accent" />
                      {amenity.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {amenity.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No hay instalaciones destacadas disponibles en este momento.
            </p>
          )}

          <div className="mt-12 text-center">
            <Button asChild size="lg" variant="outline">
              <a href="/cliente/amenities">
                Ver Todas las Instalaciones
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="container max-w-7xl mx-auto px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative h-[400px] overflow-hidden rounded-lg lg:h-[500px]">
            <img
              src="/elegant-hotel-restaurant.jpg"
              alt="Sobre nosotros"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold md:text-4xl">Sobre Nosotros</h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="text-pretty">
                Hotel Grand Vista es más que un lugar para hospedarse, es una
                experiencia única que combina elegancia, confort y servicio
                excepcional. Ubicado en el corazón de la ciudad, nuestro hotel
                ofrece fácil acceso a las principales atracciones turísticas y
                centros de negocios.
              </p> 
              <p className="text-pretty">
                Con más de 20 años de experiencia en la industria hotelera, nos
                enorgullecemos de ofrecer habitaciones impecables,
                instalaciones de primera clase y un equipo dedicado que trabaja
                incansablemente para superar tus expectativas.
              </p> 
              <p className="text-pretty">
                Ya sea que viajes por negocios o placer, solo o en familia, en
                Hotel Grand Vista encontrarás el refugio perfecto para descansar
                y disfrutar de momentos inolvidables.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            ¿Tienes Alguna Pregunta?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-pretty text-primary-foreground/90">
            Nuestro equipo está disponible 24/7 para ayudarte con cualquier
            consulta o reserva
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              <span className="text-lg font-medium">+54 11 5555-0000</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <span className="text-lg font-medium">
                GranVistaH@gmail.com
              </span>
            </div>
          </div>
          <div className="mt-8">
            <Button asChild size="lg" variant="secondary">
              <a href="/cliente/consultas">Enviar Consulta</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}