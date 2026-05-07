import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/crypto"

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  if (secret !== "debug2026") return NextResponse.json({ error: "forbidden" }, { status: 403 })

  const testHash = hashPassword("1234")

  const rows = await prisma.$queryRaw<{
    name: string; phone: string | null; has_pw: boolean; pw_match: boolean; tenant_slug: string; status: string
  }[]>`
    SELECT
      u.name,
      u.phone,
      u.password IS NOT NULL as has_pw,
      u.password = ${testHash} as pw_match,
      t.slug as tenant_slug,
      u.status
    FROM users u
    LEFT JOIN tenants t ON t.id = u."tenantId"
    WHERE u.role = 'STUDENT'
    ORDER BY u."createdAt" DESC
  `

  return NextResponse.json({ testHash, rows })
}
