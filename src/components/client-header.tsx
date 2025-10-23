"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Hotel, User, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export function ClientHeader() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navItems = [
    { href: "/cliente/home", label: "Inicio" },
    { href: "/cliente/habitaciones", label: "Habitaciones" },
    { href: "/cliente/amenities", label: "Instalaciones" },
    { href: "/cliente/consultas", label: "Consultas" },
    { href: "/cliente/mis-reservas", label: "Mis Reservas" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/cliente/home" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Hotel className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Hotel Grand Vista</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="md:hidden">
              <Link href="/cliente/home">Inicio</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="md:hidden">
              <Link href="/cliente/habitaciones">Habitaciones</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="md:hidden">
              <Link href="/cliente/amenities">Instalaciones</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="md:hidden">
              <Link href="/cliente/consultas">Consultas</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="md:hidden">
              <Link href="/cliente/mis-reservas">Mis Reservas</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="md:hidden" />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
