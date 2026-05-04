import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migraciones requieren conexión directa (sin pgbouncer) para advisory locks
    url: process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_PRISMA_URL!,
  },
});
