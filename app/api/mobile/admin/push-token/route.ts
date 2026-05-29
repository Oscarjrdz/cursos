import { NextRequest, NextResponse } from "next/server"
import { getMobileSession } from "@/lib/mobile-auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session || session.role !== "TENANT_ADMIN" || !session.tenantId)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { token } = await req.json()
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Token inválido" }, { status: 400 })
  }

  await prisma.tenant.update({
    where: { id: session.tenantId },
    data: { adminPushToken: token },
  })

  return NextResponse.json({ ok: true })
}
