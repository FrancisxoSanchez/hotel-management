"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ClientHeader } from "@/components/client-header"
import { ClientFooter } from "@/components/client-footer"
import 'react-day-picker/dist/style.css';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "cliente")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "cliente") {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ClientHeader />
      <main className="flex-1">{children}</main>
      <ClientFooter />
    </div>
  )
}
