import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Temporary route to create the ranking_reactions table
// DELETE THIS FILE AFTER USE
export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ranking_reactions" (
        "id" TEXT NOT NULL,
        "tenantId" TEXT NOT NULL,
        "fromUserId" TEXT NOT NULL,
        "toUserId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ranking_reactions_pkey" PRIMARY KEY ("id")
      );
    `)
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ranking_reactions_tenantId_fromUserId_toUserId_type_key"
      ON "ranking_reactions"("tenantId", "fromUserId", "toUserId", "type");
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ranking_reactions_tenantId_toUserId_idx"
      ON "ranking_reactions"("tenantId", "toUserId");
    `)

    // Also ensure ranking_comments exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ranking_comments" (
        "id" TEXT NOT NULL,
        "tenantId" TEXT NOT NULL,
        "fromUserId" TEXT NOT NULL,
        "fromName" TEXT NOT NULL,
        "toUserId" TEXT NOT NULL,
        "parentId" TEXT,
        "text" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ranking_comments_pkey" PRIMARY KEY ("id")
      );
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ranking_comments_tenantId_toUserId_idx"
      ON "ranking_comments"("tenantId", "toUserId");
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ranking_comments_parentId_idx"
      ON "ranking_comments"("parentId");
    `)

    return NextResponse.json({ ok: true, message: "Tables created successfully" })
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
