import { PrismaClient } from "@prisma/client";

// Evitar múltiples instancias de Prisma Client en desarrollo
const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
