"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      } else {
        // Redirect based on role
        switch (user.role) {
          case "cliente":
            router.push("/cliente/home")
            break
          case "operador":
            router.push("/operador/dashboard")
            break
          case "gerencia":
            router.push("/gerencia/dashboard")
            break
        }
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4 text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}
