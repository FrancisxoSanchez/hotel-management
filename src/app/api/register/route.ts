import { NextResponse } from "next/server";
import { createUser } from "@/prisma/user";

/**
 * Manejador POST para el registro de nuevos usuarios.
 * Espera un body JSON con { email, password, name, phone? }.
 */
export async function POST(request: Request) {
  try {
    const { email, password, name, phone } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, contraseña y nombre son requeridos" },
        { status: 400 }
      );
    }

    const newUser = await createUser(email, password, name, phone);

    if (!newUser) {
      return NextResponse.json(
        { error: "El email ya está en uso" },
        { status: 409 } // 409 Conflict
      );
    }

    // Registro exitoso
    return NextResponse.json({ user: newUser }, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("Error en API /api/register:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
