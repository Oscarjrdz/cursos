import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"

export async function GET(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session?.userId || !session.tenantId)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const [enrollments, reactions] = await Promise.all([
    prisma.enrollment.findMany({
      where: { user: { tenantId: session.tenantId, role: "STUDENT" } },
      orderBy: { xpTotal: "desc" },
      include: { user: { select: { id: true, name: true } } },
      take: 50,
    }),
    prisma.rankingReaction.findMany({
      where: { tenantId: session.tenantId },
      select: { fromUserId: true, toUserId: true, type: true },
    }),
  ])

  // Group reactions by toUserId
  const reactionMap: Record<string, { counts: Record<string, number>; myReactions: string[] }> = {}
  for (const r of reactions) {
    if (!reactionMap[r.toUserId]) reactionMap[r.toUserId] = { counts: {}, myReactions: [] }
    reactionMap[r.toUserId].counts[r.type] = (reactionMap[r.toUserId].counts[r.type] || 0) + 1
    if (r.fromUserId === session.userId) reactionMap[r.toUserId].myReactions.push(r.type)
  }

  const entries = enrollments.map((e, i) => ({
    rank: i + 1,
    userId: e.user.id,
    userName: e.user.name,
    xpTotal: e.xpTotal,
    reactions: reactionMap[e.user.id] ?? { counts: {}, myReactions: [] },
  }))

  return NextResponse.json({ entries, currentUserId: session.userId })
}
