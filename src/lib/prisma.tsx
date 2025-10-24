import { PrismaClient } from '@prisma/client';

// Este bloque previene que se creen múltiples instancias de PrismaClient
// en el entorno de desarrollo debido al Hot Module Replacement (HMR).
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Opcional: puedes habilitar logs de consulta si lo necesitas
    // log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

