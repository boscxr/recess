// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // Extend the global scope with a PrismaClient instance
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma: PrismaClient =
  global.prisma ||
  new PrismaClient({
    // Optionally enable logging
    // log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
