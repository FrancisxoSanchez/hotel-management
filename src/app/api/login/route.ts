import { NextResponse } from "next/server";
import { verifyUserCredentials } from "@/prisma/user";

/**
 * Manejador POST para el inicio de sesión de usuarios.
 * Espera un body JSON con { email, password }.
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const user = await verifyUserCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 } // 401 Unauthorized
      );
    }

    // Autenticación exitosa
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error en API /api/login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
