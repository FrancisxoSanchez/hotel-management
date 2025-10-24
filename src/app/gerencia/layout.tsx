"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
// Corregido: Usar rutas relativas desde src/app/gerencia/dashboard/
import { useAuth } from "@/lib/auth-context";
import { ManagerHeader } from "@/components/manager-header";

export default function GerenciaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "gerencia")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "gerencia") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ManagerHeader />
      <main className="flex-1 bg-muted/30">{children}</main>
    </div>
  );
}

