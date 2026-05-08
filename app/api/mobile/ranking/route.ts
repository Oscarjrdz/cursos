import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"

export async function GET(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session?.userId || !session.tenantId)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const enrollments = await prisma.enrollment.findMany({
    where: { user: { tenantId: session.tenantId, role: "STUDENT" } },
    orderBy: { xpTotal: "desc" },
    include: { user: { select: { id: true, name: true } } },
    take: 50,
  })

  const entries = enrollments.map((e, i) => ({
    rank: i + 1,
    userId: e.user.id,
    userName: e.user.name,
    xpTotal: e.xpTotal,
  }))

  return NextResponse.json({ entries, currentUserId: session.userId })
}
