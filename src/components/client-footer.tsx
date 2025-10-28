import Link from "next/link"
import { Hotel, Mail, Phone, MapPin } from "lucide-react"

export function ClientFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Hotel className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Hotel Grand Vista</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Experiencia de lujo y confort en el corazón de la ciudad. Tu hogar lejos de casa.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cliente/home" className="text-muted-foreground hover:text-primary">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/cliente/habitaciones" className="text-muted-foreground hover:text-primary">
                  Habitaciones
                </Link>
              </li>
              <li>
                <Link href="/cliente/amenities" className="text-muted-foreground hover:text-primary">
                  Instalaciones
                </Link>
              </li>
              <li>
                <Link href="/cliente/consultas" className="text-muted-foreground hover:text-primary">
                  Consultas
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Contacto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+54 387 421-0000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>GrandVistaH@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Balcarce 252, Salta, Argentina</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Horarios</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <strong>Check-in:</strong> 15:00 hs
              </li>
              <li>
                <strong>Check-out:</strong> 11:00 hs
              </li>
              <li>
                <strong>Recepción:</strong> 24/7
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Hotel Grand Vista. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
