import { PrismaClient } from '@prisma/client';

// Create a single Prisma Client instance to be shared across the application
export const prisma = new PrismaClient();
