import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

/**
 * Verifica las credenciales de un usuario contra la base de datos.
 *
 * ¡ADVERTENCIA DE SEGURIDAD!
 * Esto compara contraseñas en texto plano. En una aplicación real,
 * NUNCA almacenes contraseñas en texto plano. Deberías usar 'bcrypt'
 * para hashear la contraseña al registrarla y compararla durante el login.
 *
 * @param email El email del usuario.
 * @param password La contraseña en texto plano del usuario.
 * @returns El objeto de usuario (sin la contraseña) si es exitoso, o null.
 */
export async function verifyUserCredentials(
  email: string,
  password: string
): Promise<Omit<User, "password"> | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 1. Verificar si el usuario existe
    if (!user) {
      return null;
    }

    // 2. Comparar la contraseña (¡Método inseguro!)
    // En producción, usarías: const isValid = await bcrypt.compare(password, user.password);
    const isValid = user.password === password;

    if (!isValid) {
      return null;
    }

    // 3. Exitoso: Devolver el usuario sin el hash de la contraseña
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error al verificar credenciales:", error);
    return null;
  }
}

/**
 * Crea un nuevo usuario en la base de datos.
 *
 * ¡ADVERTENCIA DE SEGURIDAD!
 * Al igual que en el login, aquí deberías hashear la contraseña antes de guardarla.
 * const hashedPassword = await bcrypt.hash(password, 10);
 *
 * @param data Los datos del nuevo usuario.
 * @returns El nuevo objeto de usuario (sin la contraseña) o null si el email ya existe.
 */
export async function createUser(
  email: string,
  password: string,
  name: string,
  phone?: string
): Promise<Omit<User, "password"> | null> {
  try {
    // 1. Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return null; // Email ya en uso
    }

    // 2. Crear el nuevo usuario (¡Contraseña debería ser hasheada!)
    // const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password, // Debería ser hashedPassword
        name,
        phone,
        role: "cliente", // Por defecto es 'cliente' al registrarse
      },
    });

    // 3. Devolver el usuario sin la contraseña
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return null;
  }
}
