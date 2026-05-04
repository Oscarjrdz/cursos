import { PrismaClient } from "@prisma/client"
import path from "path"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// LOCAL DEV: SQLite. En producción usar POSTGRES_PRISMA_URL desde env.
const datasourceUrl =
  process.env.POSTGRES_PRISMA_URL ?? `file:${path.join(process.cwd(), "prisma/dev.db")}`

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
